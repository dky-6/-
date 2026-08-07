<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  comments: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'delete'])

const inputText = ref('')
const inputRef = ref(null)

const commentCount = computed(() => props.comments.length)
const canSubmit = computed(() => inputText.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('add', inputText.value.trim())
  inputText.value = ''
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

function handleDelete(commentId) {
  emit('delete', commentId)
}
</script>

<template>
  <div class="photo-comment">
    <!-- 评论列表 -->
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">{{ comment.avatar }}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-name">{{ comment.username }}</span>
            <span class="comment-time">{{ comment.time }}</span>
          </div>
          <p class="comment-text">{{ comment.text }}</p>
        </div>
        <button
          v-if="comment.username === '像素旅人'"
          class="comment-del"
          @click="handleDelete(comment.id)"
          title="删除"
        >×</button>
      </div>
    </div>

    <!-- 评论输入 -->
    <div class="comment-input-bar">
      <input
        ref="inputRef"
        v-model="inputText"
        type="text"
        class="comment-input"
        placeholder="说点什么..."
        @keydown="handleKeydown"
      />
      <button
        class="comment-send"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        💬 发送
      </button>
    </div>

    <!-- 计数 -->
    <div v-if="commentCount" class="comment-count">💬 {{ commentCount }} 条评论</div>
  </div>
</template>

<style scoped>
.photo-comment {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 3px solid var(--color-border);
}

/* ====== 评论列表 ====== */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  position: relative;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.comment-name {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-primary);
}

.comment-time {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-light);
}

.comment-text {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text);
  margin: 0;
  word-break: break-word;
}

.comment-del {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  background: var(--color-bg-card);
  color: var(--color-text-light);
  border: none;
  font-family: var(--font-title);
  font-size: 12px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
}

.comment-item:hover .comment-del {
  display: flex;
}

.comment-del:hover {
  color: var(--color-secondary);
}

/* ====== 输入框 ====== */
.comment-input-bar {
  display: flex;
  gap: 8px;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 13px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  outline: none;
}

.comment-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.comment-send {
  padding: 8px 16px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-title);
  font-size: 12px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  transition: transform 0.1s;
  white-space: nowrap;
}

.comment-send:hover:not(:disabled) {
  transform: translate(1px, 1px);
}

.comment-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-count {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
  text-align: right;
}

/* ====== 主题透明 ====== */
.theme-transparent .comment-item {
  background: rgba(255, 255, 255, 0.15);
}

.theme-transparent .comment-avatar {
  background: rgba(255, 255, 255, 0.2);
}
</style>
