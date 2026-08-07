<script setup>
/**
 * 像素风图片预览灯箱组件
 * 用法：
 *   简单模式：<ImageViewer v-if="show" :images="urlArray" :index="currentIndex" @close="..." @change="..." />
 *   照片模式：<ImageViewer v-if="show" :images="photoArray" :index="currentIndex" @close="..." @change="..." @add-comment="..." @delete-comment="..." />
 *   其中 photoArray 每项为 { url, description, tags, takenDate, comments[] }
 */
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  images: { type: Array, default: () => [] },
  index: { type: Number, default: 0 },
  showMetadata: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'change', 'add-comment', 'delete-comment'])

const currentIndex = computed({
  get: () => props.index,
  set: (val) => emit('change', val)
})

// 支持字符串数组或对象数组
const currentPhoto = computed(() => props.images[props.index] || null)
const currentImage = computed(() => {
  const item = props.images[props.index]
  if (!item) return ''
  return typeof item === 'string' ? item : item.url
})
const hasMultiple = computed(() => props.images.length > 1)
const total = computed(() => props.images.length)
const hasMetadata = computed(() => {
  const item = props.images[props.index]
  return props.showMetadata && item && typeof item === 'object'
})

// 元数据
const currentDescription = computed(() => currentPhoto.value?.description || '')
const currentTags = computed(() => currentPhoto.value?.tags || [])
const currentDate = computed(() => currentPhoto.value?.takenDate || '')
const currentComments = computed(() => currentPhoto.value?.comments || [])

// 评论
const newCommentText = computed(() => '')

function prev() {
  if (props.index > 0) {
    emit('change', props.index - 1)
  } else {
    emit('change', props.images.length - 1)
  }
}

function next() {
  if (props.index < props.images.length - 1) {
    emit('change', props.index + 1)
  } else {
    emit('change', 0)
  }
}

function handleKeydown(e) {
  if (!props.show) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

function handleAddComment(text) {
  emit('add-comment', currentPhoto.value?.id, text)
}

function handleDeleteComment(commentId) {
  emit('delete-comment', currentPhoto.value?.id, commentId)
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="show" class="image-viewer" @click.self="emit('close')">
        <!-- 关闭按钮 -->
        <button class="viewer-close" @click="emit('close')">✕</button>

        <!-- 计数 -->
        <div v-if="hasMultiple" class="viewer-counter">
          {{ index + 1 }} / {{ total }}
        </div>

        <!-- 主体：图片 + 元数据面板 -->
        <div class="viewer-main">
          <!-- 上一张 -->
          <button
            v-if="hasMultiple"
            class="viewer-nav viewer-prev"
            @click.stop="prev"
          >◀</button>

          <!-- 图片 -->
          <div class="viewer-image-container" :class="{ 'with-meta': hasMetadata }">
            <img
              :src="currentImage"
              :alt="`图片 ${index + 1}`"
              class="viewer-image"
              @click.stop
            />

            <!-- 元数据面板 -->
            <Transition name="meta-slide">
              <div v-if="hasMetadata" class="viewer-meta-panel" @click.stop>
                <div class="meta-info">
                  <p v-if="currentDescription" class="meta-desc">{{ currentDescription }}</p>
                  <div v-if="currentDate" class="meta-row">
                    <span class="meta-icon">📅</span>
                    <span>{{ currentDate }}</span>
                  </div>
                  <div v-if="currentTags.length" class="meta-tags">
                    <span v-for="tag in currentTags" :key="tag" class="meta-tag">#{{ tag }}</span>
                  </div>
                </div>

                <!-- 评论区 -->
                <div class="meta-comments">
                  <div v-if="currentComments.length" class="comments-list">
                    <div v-for="comment in currentComments" :key="comment.id" class="comment-item">
                      <span class="comment-avatar">{{ comment.avatar }}</span>
                      <div class="comment-body">
                        <div class="comment-head">
                          <span class="comment-name">{{ comment.username }}</span>
                          <span class="comment-time">{{ comment.time }}</span>
                        </div>
                        <p class="comment-text">{{ comment.text }}</p>
                      </div>
                      <button
                        class="comment-del"
                        @click="handleDeleteComment(comment.id)"
                        title="删除"
                      >×</button>
                    </div>
                  </div>

                  <!-- 评论输入 -->
                  <div class="comment-input">
                    <input
                      type="text"
                      class="comment-text-input"
                      placeholder="说点什么..."
                      @keydown.enter="currentPhoto && $emit('add-comment', currentPhoto.id, $event.target.value, $event.target.value = '')"
                    />
                    <button
                      class="comment-send-btn"
                      @click="() => { const input = document.querySelector('.viewer-meta-panel .comment-text-input'); if (input && input.value.trim()) { handleAddComment(input.value.trim()); input.value = ''; } }"
                    >💬</button>
                  </div>

                  <span class="comment-total">💬 {{ currentComments.length }} 条评论</span>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 下一张 -->
          <button
            v-if="hasMultiple"
            class="viewer-nav viewer-next"
            @click.stop="next"
          >▶</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 40px;
  backdrop-filter: blur(4px);
}

/* ====== 主体 ====== */
.viewer-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  max-width: 1200px;
}

/* ====== 图片容器 ====== */
.viewer-image-container {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.viewer-image-container.with-meta {
  gap: 16px;
}

.viewer-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  image-rendering: pixelated;
}

/* ====== 元数据面板 ====== */
.viewer-meta-panel {
  width: 280px;
  max-height: 85vh;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.meta-info {
  padding: 16px;
  border-bottom: 3px solid var(--color-border);
}

.meta-desc {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  margin: 0 0 10px;
  line-height: 1.5;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
  margin-bottom: 6px;
}

.meta-icon {
  font-size: 14px;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.meta-tag {
  font-family: var(--font-code);
  font-size: 11px;
  background: var(--color-bg);
  color: var(--color-primary);
  padding: 2px 6px;
  box-shadow: inset 0 0 0 2px var(--color-border-light);
}

/* ====== 评论区 ====== */
.meta-comments {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  position: relative;
}

.comment-avatar {
  width: 26px;
  height: 26px;
  background: var(--color-bg-card);
  box-shadow: inset 0 0 0 2px var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-head {
  display: flex;
  gap: 6px;
  align-items: center;
}

.comment-name {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-primary);
}

.comment-time {
  font-family: var(--font-code);
  font-size: 10px;
  color: var(--color-text-light);
}

.comment-text {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text);
  margin: 2px 0 0;
}

.comment-del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: transparent;
  color: var(--color-text-light);
  border: none;
  font-size: 11px;
  cursor: pointer;
  display: none;
}

.comment-item:hover .comment-del {
  display: flex;
}

.comment-del:hover {
  color: var(--color-secondary);
}

/* 评论输入 */
.comment-input {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.comment-text-input {
  flex: 1;
  padding: 6px 10px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 12px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  outline: none;
}

.comment-text-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.comment-send-btn {
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-send-btn:hover {
  transform: translate(1px, 1px);
}

.comment-total {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-light);
  text-align: center;
}

/* ====== 关闭按钮 ====== */
.viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 16px;
  font-family: var(--font-title);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.viewer-close:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* ====== 导航按钮 ====== */
.viewer-nav {
  width: 56px;
  height: 56px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 24px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
}

.viewer-nav:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.viewer-prev {
  margin-right: 12px;
}

.viewer-next {
  margin-left: 12px;
}

/* ====== 计数 ====== */
.viewer-counter {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  background: var(--color-bg-card);
  padding: 8px 16px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  z-index: 10;
}

/* ====== 过渡动画 ====== */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

.meta-slide-enter-active,
.meta-slide-leave-active {
  transition: transform 0.2s, opacity 0.2s;
}

.meta-slide-enter-from,
.meta-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .viewer-main {
    flex-direction: column;
    gap: 12px;
  }
  .viewer-nav {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  .viewer-prev {
    margin-right: 0;
    margin-bottom: 12px;
  }
  .viewer-next {
    margin-left: 0;
    margin-top: 12px;
  }
  .viewer-image-container.with-meta {
    flex-direction: column;
  }
  .viewer-image {
    max-height: 50vh;
  }
  .viewer-meta-panel {
    width: 100%;
    max-height: 30vh;
  }
}

@media (max-width: 600px) {
  .viewer-close {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
  }
}
</style>
