<script setup>
/**
 * 像素风发布说说组件
 * 用法：<PostTweet @posted="..." />
 */
import { ref, computed } from 'vue'
import { useTweetsStore } from '../stores/tweets.js'

const emit = defineEmits(['posted'])

const store = useTweetsStore()

const MAX_LENGTH = 200
const MAX_IMAGES = 4

const content = ref('')
const images = ref([])
const imageInputRef = ref(null)
const textareaRef = ref(null)

// 暴露聚焦方法，供父组件调用
function focus() {
  textareaRef.value?.focus()
}
defineExpose({ focus })

// 字数统计
const charCount = computed(() => content.value.length)
const isOverLimit = computed(() => content.value.length > MAX_LENGTH)
const canSubmit = computed(() => {
  const hasContent = content.value.trim().length > 0
  const hasImages = images.value.length > 0
  return (hasContent || hasImages) && !isOverLimit.value
})

// 选择图片
function triggerFileInput() {
  imageInputRef.value?.click()
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  const remaining = MAX_IMAGES - images.value.length
  const toAdd = files.slice(0, remaining)

  for (const file of toAdd) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        images.value.push(ev.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  // 清空 input value 以便下次选择相同文件
  e.target.value = ''
}

function removeImage(index) {
  images.value.splice(index, 1)
}

// 发布
function handleSubmit() {
  if (!canSubmit.value) return

  store.addTweet(content.value.trim(), [...images.value])
  content.value = ''
  images.value = []
  emit('posted')
}
</script>

<template>
  <div class="post-tweet">
    <!-- 头像 -->
    <div class="post-avatar">🧑‍🎨</div>

    <div class="post-main">
      <!-- 文本输入 -->
      <div class="input-wrapper" :class="{ 'over-limit': isOverLimit }">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="tweet-input"
          :maxlength="MAX_LENGTH + 50"
          placeholder="分享你的像素生活..."
        ></textarea>
      </div>

      <!-- 图片预览 -->
      <div v-if="images.length" class="image-previews">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="preview-item"
        >
          <img :src="img" :alt="`预览${idx + 1}`" class="preview-img" />
          <button class="remove-img-btn" @click="removeImage(idx)">×</button>
        </div>
      </div>

      <!-- 底部工具条 -->
      <div class="post-toolbar">
        <div class="toolbar-left">
          <!-- 图片上传 -->
          <button
            class="tool-btn upload-btn"
            :disabled="images.length >= MAX_IMAGES"
            @click="triggerFileInput"
          >
            📷 <span class="tool-label">图片</span>
          </button>
          <input
            ref="imageInputRef"
            type="file"
            accept="image/*"
            multiple
            class="file-hidden"
            @change="handleFileChange"
          />
        </div>

        <div class="toolbar-right">
          <!-- 字数统计 -->
          <span class="char-count" :class="{ 'over-limit': isOverLimit }">
            {{ charCount }}/{{ MAX_LENGTH }}
          </span>

          <!-- 发布按钮 -->
          <button
            class="submit-btn"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-tweet {
  display: flex;
  gap: 14px;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  padding: 18px 22px;
  border-radius: 2px;
  margin-bottom: 20px;
}

/* ====== 头像 ====== */
.post-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  flex-shrink: 0;
}

/* ====== 主内容 ====== */
.post-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ====== 输入框 ====== */
.input-wrapper {
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  transition: box-shadow 0.15s;
}

.input-wrapper:focus-within {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.input-wrapper.over-limit {
  box-shadow:
    inset 0 0 0 2px #c0392b,
    0 0 0 2px var(--color-border);
}

.tweet-input {
  width: 100%;
  min-height: 90px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  padding: 10px 14px;
}

.tweet-input::placeholder {
  color: var(--color-text-light);
  opacity: 0.5;
}

/* ====== 图片预览 ====== */
.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-item {
  position: relative;
  width: 72px;
  height: 72px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-img-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.remove-img-btn:hover {
  background: #c0392b;
}

/* ====== 底部工具条 ====== */
.post-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 工具按钮 */
.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--color-text-light);
  font-family: var(--font-title);
  font-size: 10px;
  border: none;
  padding: 6px 10px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
}

.tool-btn:hover:not(:disabled) {
  background: var(--color-border-light);
  color: var(--color-text);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-label {
  font-size: 9px;
}

.file-hidden {
  display: none;
}

/* 字数统计 */
.char-count {
  font-family: var(--font-code);
  font-size: 15px;
  color: var(--color-text-light);
}

.char-count.over-limit {
  color: #c0392b;
  font-weight: bold;
}

/* 发布按钮 */
.submit-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-title);
  font-size: 11px;
  border: none;
  padding: 8px 24px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.submit-btn:hover:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

.submit-btn:disabled {
  background: var(--color-border-light);
  color: var(--color-text-light);
  cursor: not-allowed;
  opacity: 0.6;
}

/* ====== 透明主题 ====== */
:deep(.theme-transparent) .post-tweet {
  background: rgba(255, 255, 255, calc(var(--glass-opacity, 0.15) + 0.1));
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

:deep(.theme-transparent) .tweet-input {
  /* [FIX] */ color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

:deep(.theme-transparent) .input-wrapper {
  background: rgba(255, 255, 255, 0.25);
}

:deep(.theme-transparent) .input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.35);
}

:deep(.theme-transparent) .char-count {
  /* [FIX] */ color: #E0E0E0;
}

:deep(.theme-transparent) .tool-btn {
  /* [FIX] */ color: #E0E0E0;
}

:deep(.theme-transparent) .tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.theme-transparent) .submit-btn {
  background: #FF6B6B;
}

:deep(.theme-transparent) .submit-btn:disabled {
  background: rgba(150, 150, 150, 0.5);
  color: rgba(255, 255, 255, 0.7);
}

/* ====== 响应式 ====== */
@media (max-width: 500px) {
  .post-tweet {
    padding: 14px 16px;
  }
  .post-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  .tweet-input {
    font-size: 15px;
    min-height: 70px;
  }
  .preview-item {
    width: 60px;
    height: 60px;
  }
}
</style>
