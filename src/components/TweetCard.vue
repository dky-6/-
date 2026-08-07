<script setup>
/**
 * 像素风说说卡片组件
 * 用法：<TweetCard :tweet="tweet" @delete="..." />
 */
import { ref, computed } from 'vue'
import { useTweetsStore } from '../stores/tweets.js'
import ConfirmModal from './ConfirmModal.vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  tweet: { type: Object, required: true }
})

const emit = defineEmits(['deleted'])

const store = useTweetsStore()

// 展开评论
const showAllComments = ref(false)

// 评论输入
const commentText = ref('')
const showCommentInput = ref(false)

// 删除确认弹窗
const showDeleteConfirm = ref(false)

// 图片预览
const viewerShow = ref(false)
const viewerIndex = ref(0)

// 格式化时间
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${d}日 ${h}:${min}`
}

// 显示的评论列表（默认最新2条）
const displayedComments = computed(() => {
  if (showAllComments.value) return props.tweet.comments
  return props.tweet.comments.slice(-2)
})

// 点赞
function handleLike() {
  store.toggleLike(props.tweet.id)
}

// 置顶
function handleTogglePin() {
  store.togglePin(props.tweet.id)
}

// 删除
function handleDelete() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  store.deleteTweet(props.tweet.id)
  showDeleteConfirm.value = false
  emit('deleted')
}

// 添加评论
function submitComment() {
  if (commentText.value.trim()) {
    store.addComment(props.tweet.id, commentText.value)
    commentText.value = ''
    showCommentInput.value = false
  }
}

// 预览图片
function previewImage(index) {
  viewerIndex.value = index
  viewerShow.value = true
}

// 获取图片网格类名
function getImageGridClass(count) {
  if (count === 1) return 'img-single'
  if (count === 2) return 'img-double'
  return 'img-grid'
}
</script>

<template>
  <div class="tweet-card">
    <!-- 置顶标签 -->
    <div v-if="tweet.isPinned" class="pinned-tag">
      📌 置顶
    </div>

    <!-- 删除按钮 -->
    <button class="delete-btn" @click="handleDelete" title="删除">×</button>

    <div class="tweet-header">
      <!-- 头像 -->
      <div class="tweet-avatar">
        <span>{{ tweet.avatar }}</span>
      </div>

      <!-- 用户信息 -->
      <div class="tweet-info">
        <span class="tweet-name">{{ tweet.username }}</span>
        <span class="tweet-date">{{ formatDate(tweet.date) }}</span>
      </div>
    </div>

    <!-- 正文 -->
    <div class="tweet-content">
      <p class="tweet-text">{{ tweet.content }}</p>
    </div>

    <!-- 图片 -->
    <div
      v-if="tweet.images && tweet.images.length"
      class="tweet-images"
      :class="getImageGridClass(tweet.images.length)"
    >
      <div
        v-for="(img, idx) in tweet.images"
        :key="idx"
        class="tweet-img-wrap"
        @click="previewImage(idx)"
      >
        <img :src="img" :alt="`图片${idx + 1}`" class="tweet-img" />
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="tweet-actions">
      <button
        class="action-btn like-btn"
        :class="{ liked: tweet.liked }"
        @click="handleLike"
      >
        <span class="like-icon">{{ tweet.liked ? '❤️' : '🤍' }}</span>
        <span class="like-count">{{ tweet.likes }}</span>
      </button>

      <button
        class="action-btn comment-btn"
        @click="showCommentInput = !showCommentInput"
      >
        <span>💬</span>
        <span class="comment-count">{{ tweet.comments.length }}</span>
      </button>

      <button
        class="action-btn pin-btn"
        :class="{ pinned: tweet.isPinned }"
        @click="handleTogglePin"
        title="置顶"
      >
        {{ tweet.isPinned ? '📌' : '📍' }}
      </button>
    </div>

    <!-- 评论区 -->
    <div v-if="tweet.comments.length" class="tweet-comments">
      <div
        v-for="comment in displayedComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar">{{ comment.avatar }}</div>
        <div class="comment-content">
          <span class="comment-name">{{ comment.username }}</span>
          <span class="comment-text">{{ comment.text }}</span>
        </div>
      </div>

      <!-- 展开/收起 -->
      <button
        v-if="tweet.comments.length > 2"
        class="toggle-comments-btn"
        @click="showAllComments = !showAllComments"
      >
        {{ showAllComments ? '收起评论' : `查看全部 ${tweet.comments.length} 条评论` }}
      </button>
    </div>

    <!-- 评论输入 -->
    <div v-if="showCommentInput" class="comment-input-wrap">
      <input
        v-model="commentText"
        type="text"
        class="comment-input"
        placeholder="写下你的评论..."
        @keyup.enter="submitComment"
      />
      <button
        class="comment-submit-btn"
        :disabled="!commentText.trim()"
        @click="submitComment"
      >发送</button>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="确认删除"
      message="确定删除这条说说吗？此操作不可撤销。"
      confirm-text="删除"
      danger
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- 图片预览 -->
    <ImageViewer
      :show="viewerShow"
      :images="tweet.images"
      :index="viewerIndex"
      @close="viewerShow = false"
      @change="viewerIndex = $event"
    />
  </div>
</template>

<style scoped>
.tweet-card {
  position: relative;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  padding: 18px 22px;
  border-radius: 2px;
}

/* ====== 置顶标签 ====== */
.pinned-tag {
  position: absolute;
  top: 12px;
  right: 48px;
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  padding: 3px 8px;
  border-radius: 2px;
}

/* ====== 删除按钮 ====== */
.delete-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  background: var(--color-border-light);
  color: var(--color-text);
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 2;
}

.tweet-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #c0392b;
  color: #fff;
}

/* ====== 头部 ====== */
.tweet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.tweet-avatar {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.tweet-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tweet-name {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text);
}

.tweet-date {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

/* ====== 正文 ====== */
.tweet-content {
  margin-bottom: 14px;
}

.tweet-text {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ====== 图片 ====== */
.tweet-images {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.tweet-images.img-single {
  grid-template-columns: 1fr;
}

.tweet-images.img-double {
  grid-template-columns: 1fr 1fr;
}

.tweet-images.img-grid {
  grid-template-columns: 1fr 1fr;
}

.tweet-img-wrap {
  cursor: pointer;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  aspect-ratio: 1;
}

.tweet-images.img-single .tweet-img-wrap {
  aspect-ratio: 16 / 9;
}

.tweet-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.tweet-img-wrap:hover .tweet-img {
  transform: scale(1.03);
}

/* ====== 操作栏 ====== */
.tweet-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 2px dashed var(--color-border-light);
  margin-bottom: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--color-text-light);
  font-family: var(--font-title);
  font-size: 10px;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--color-border-light);
  color: var(--color-text);
}

.like-btn.liked {
  color: var(--color-primary);
}

.like-btn.liked .like-icon {
  animation: like-bounce 0.4s ease;
}

@keyframes like-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.pin-btn.pinned {
  color: var(--color-primary);
}

/* ====== 评论区 ====== */
.tweet-comments {
  background: var(--color-bg);
  padding: 12px;
  border-radius: 2px;
  border: 1px solid var(--color-border-light);
}

.comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  background: var(--color-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 2px;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.comment-name {
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-secondary-light);
}

.comment-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text);
  word-break: break-word;
}

.toggle-comments-btn {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-primary-light);
  font-family: var(--font-title);
  font-size: 9px;
  cursor: pointer;
  padding: 8px 0 4px;
}

.toggle-comments-btn:hover {
  color: var(--color-primary);
}

/* ====== 评论输入 ====== */
.comment-input-wrap {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.comment-input {
  flex: 1;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  padding: 6px 10px;
  border-radius: 2px;
  outline: none;
}

.comment-input::placeholder {
  color: var(--color-text-light);
  opacity: 0.5;
}

.comment-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.comment-submit-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-title);
  font-size: 9px;
  border: none;
  padding: 6px 14px;
  cursor: pointer;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-submit-btn:not(:disabled):hover {
  transform: translate(1px, 1px);
}

/* ====== 透明主题 ====== */
:deep(.theme-transparent) .tweet-card {
  background: rgba(255, 255, 255, calc(var(--glass-opacity, 0.15) + 0.08));
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

:deep(.theme-transparent) .tweet-name,
:deep(.theme-transparent) .tweet-text,
:deep(.theme-transparent) .comment-text {
  /* [FIX] */ color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

:deep(.theme-transparent) .tweet-date,
:deep(.theme-transparent) .like-count,
:deep(.theme-transparent) .comment-count {
  /* [FIX] */ color: #E0E0E0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

:deep(.theme-transparent) .tweet-comments {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.theme-transparent) .action-btn {
  /* [FIX] */ color: #E0E0E0;
}

:deep(.theme-transparent) .action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.theme-transparent) .like-btn.liked {
  color: #c0392b;
}

:deep(.theme-transparent) .delete-btn {
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

:deep(.theme-transparent) .comment-input {
  background: rgba(255, 255, 255, 0.3);
  /* [FIX] */ color: #FFFFFF;
}

:deep(.theme-transparent) .comment-input::placeholder {
  color: #666;
}

/* ====== 响应式 ====== */
@media (max-width: 500px) {
  .tweet-card {
    padding: 14px 16px;
  }
  .tweet-text {
    font-size: 15px;
  }
  .tweet-images.img-double,
  .tweet-images.img-grid {
    gap: 4px;
  }
}
</style>
