<script setup>
/**
 * 说说页面 - Pixel Blog
 * - 发布新说说（PostTweet）
 * - 展示说说列表（TweetCard）
 * - 统计信息
 */
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PixelBox from '../components/PixelBox.vue'
import PostTweet from '../components/PostTweet.vue'
import TweetCard from '../components/TweetCard.vue'
import { useTweetsStore } from '../stores/tweets.js'

const route = useRoute()
const router = useRouter()
const store = useTweetsStore()

const postTweetRef = ref(null)

// 监听 ?action=create 自动聚焦发布输入框
watch(
  () => route.query.action,
  async (action) => {
    if (action === 'create') {
      await nextTick()
      postTweetRef.value?.focus()
      router.replace({ query: { ...route.query, action: undefined } })
    }
  },
  { immediate: true }
)

// 发布成功提示
const showToast = ref(false)
const toastMessage = ref('')

function handlePosted() {
  toastMessage.value = '发布成功！'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function handleDeleted() {
  toastMessage.value = '删除成功'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1500)
}
</script>

<template>
  <div class="page-container tweets">
    <h1 class="page-title">▶ 说说</h1>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-icon">📝</span>
        <span class="stat-label">共</span>
        <span class="stat-value">{{ store.totalCount }}</span>
        <span class="stat-label">条说说</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-icon">✨</span>
        <span class="stat-label">今日已发布</span>
        <span class="stat-value">{{ store.todayCount }}</span>
        <span class="stat-label">条</span>
      </div>
    </div>

    <!-- 发布说说 -->
    <PostTweet ref="postTweetRef" @posted="handlePosted" />

    <!-- 说说列表 -->
    <div class="tweet-list" v-if="store.sortedTweets.length">
      <TweetCard
        v-for="tweet in store.sortedTweets"
        :key="tweet.id"
        :tweet="tweet"
        @deleted="handleDeleted"
      />
    </div>

    <!-- 空状态 -->
    <PixelBox v-else class="empty">
      <div class="empty-icon">░▒▓</div>
      <p class="empty-text">还没有说说</p>
      <p class="empty-hint">在上方发布第一条说说吧～</p>
    </PixelBox>

    <!-- 发布成功 Toast -->
    <Transition name="toast-fade">
      <div v-if="showToast" class="pixel-toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tweets {
  max-width: 680px;
}

/* ====== 统计栏 ====== */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  padding: 12px 20px;
  margin-bottom: 16px;
  border-radius: 2px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text);
}

.stat-icon {
  font-size: 16px;
}

.stat-label {
  color: var(--color-text-light);
  font-size: 13px;
}

.stat-value {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-primary);
  font-weight: bold;
}

.stat-divider {
  width: 2px;
  height: 20px;
  background: var(--color-border-light);
}

/* ====== 说说列表 ====== */
.tweet-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====== 空状态 ====== */
.empty {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon {
  font-family: var(--font-code);
  font-size: 22px;
  color: var(--color-primary);
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.empty-text {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
  margin-bottom: 6px;
}

.empty-hint {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

/* ====== Toast 提示 ====== */
.pixel-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-family: var(--font-title);
  font-size: 11px;
  padding: 12px 28px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  z-index: 9999;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ====== 透明主题 ====== */
:deep(.theme-transparent) .stats-bar {
  background: rgba(255, 255, 255, calc(var(--glass-opacity, 0.15) + 0.1));
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

:deep(.theme-transparent) .stat-label {
  /* [FIX] */ color: #E0E0E0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

:deep(.theme-transparent) .stat-value {
  color: #c0392b;
}

:deep(.theme-transparent) .pixel-toast {
  background: rgba(255, 255, 255, 0.9);
  /* [FIX] 背景接近不透明白色，保持深色文字 */
  color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.6);
  text-shadow: none;
}

/* ====== 响应式 ====== */
@media (max-width: 500px) {
  .stats-bar {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 14px;
  }
  .stat-divider {
    display: none;
  }
  .stat-item {
    font-size: 12px;
  }
}
</style>
