<script setup>
/**
 * Sidebar - 文章详情页侧边栏 [NEW]
 * 包含：博主信息卡、文章目录、公告、最新文章列表
 */
import { computed } from 'vue'
import PixelBox from './PixelBox.vue'
import PostToc from './PostToc.vue'
import { useBlogStore } from '../stores/blog.js' // [FIX] 改用独立的 blog store
import { useTheme } from '../composables/useTheme.js'

const props = defineProps({
  content: { type: String, default: '' }
})

const blogStore = useBlogStore()
const { avatarConfig } = useTheme()

// 博主信息
const authorInfo = {
  name: 'PDX-X',
  bio: 'Backend Developer · Go Enthusiast · Gamer',
  signature: '即使再小的帆也能远航 🚢'
}

// [FIX] 数据统计直接使用 blog store 的 stats
const stats = computed(() => blogStore.stats)

// [FIX] 最新文章直接使用 blog store 的 latestPosts
const latestPosts = computed(() => blogStore.latestPosts)
</script>

<template>
  <aside class="sidebar">
    <!-- 模块1：博主信息卡 -->
    <PixelBox class="author-card">
      <div class="author-avatar">
        <div
          class="avatar-circle"
          :class="{
            'avatar-image': avatarConfig.type === 'image',
            'avatar-char': avatarConfig.type === 'char'
          }"
        >
          <template v-if="avatarConfig.type === 'pixel'">
            <div class="avatar-grid">
              <span
                v-for="i in 64"
                :key="i"
                class="avatar-pixel"
                :class="{
                  'bg': avatarConfig.pixelPattern.includes(i),
                  'eye-l': avatarConfig.eyeIndices[0] === i,
                  'eye-r': avatarConfig.eyeIndices[1] === i,
                  'mouth': avatarConfig.mouthIndices.includes(i)
                }"
              ></span>
            </div>
          </template>
          <template v-else-if="avatarConfig.type === 'image'">
            <img :src="avatarConfig.content" alt="avatar" class="avatar-img" />
          </template>
          <template v-else>
            <span class="avatar-char-text">{{ avatarConfig.content || '👤' }}</span>
          </template>
        </div>
      </div>
      <h3 class="author-name">{{ authorInfo.name }}</h3>
      <p class="author-bio">{{ authorInfo.bio }}</p>

      <div class="author-stats">
        <div class="stat-item">
          <span class="stat-num">{{ stats.articles }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.tags }}</span>
          <span class="stat-label">标签</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.categories }}</span>
          <span class="stat-label">分类</span>
        </div>
      </div>

      <div class="follow-btns">
        <a href="#" class="follow-btn github">🐙 GitHub</a>
        <a href="#" class="follow-btn rss">📡 RSS</a>
      </div>
    </PixelBox>

    <!-- 模块2：文章目录 -->
    <PixelBox class="toc-card">
      <PostToc :content="content" />
    </PixelBox>

    <!-- 模块3：公告/个人签名 -->
    <PixelBox class="notice-card">
      <h3 class="sidebar-title">📢 公告</h3>
      <p class="notice-text">{{ authorInfo.signature }}</p>
    </PixelBox>

    <!-- 模块4：最新文章列表 -->
    <PixelBox class="recent-card">
      <h3 class="sidebar-title">📝 最新文章</h3>
      <ul class="recent-list">
        <li v-for="post in latestPosts" :key="post.id" class="recent-item">
          <router-link :to="`/post/${post.id}`" class="recent-link">
            <span class="recent-title">{{ post.title }}</span>
            <span class="recent-date">{{ post.date }}</span>
          </router-link>
        </li>
      </ul>
    </PixelBox>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: visible;
  padding-right: 4px;
  scrollbar-width: thin;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
}

/* ====== 博主信息卡 ====== */
.author-card {
  padding: 20px;
  text-align: center;
}

.author-avatar {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  padding: 4px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1px;
  width: 100%;
  height: 100%;
}

.avatar-pixel {
  background: transparent;
  border-radius: 0;
}

.avatar-pixel.bg {
  background: var(--color-text);
}

.avatar-pixel.eye-l,
.avatar-pixel.eye-r {
  background: var(--color-primary);
}

.avatar-pixel.mouth {
  background: var(--color-primary);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-char-text {
  font-size: 32px;
  color: var(--color-text);
}

.author-name {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  margin-bottom: 4px;
}

.author-bio {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-light);
  line-height: 1.4;
  margin-bottom: 14px;
}

.author-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-num {
  font-family: var(--font-code);
  font-size: 20px;
  font-weight: bold;
  color: var(--color-primary-light);
  line-height: 1;
}

.stat-label {
  font-family: var(--font-title);
  font-size: 7px;
  color: var(--color-text-light);
  margin-top: 2px;
}

.stat-divider {
  width: 2px;
  height: 24px;
  background: var(--color-border-light);
}

.follow-btns {
  display: flex;
  gap: 8px;
}

.follow-btn {
  flex: 1;
  display: block;
  text-align: center;
  font-family: var(--font-title);
  font-size: 8px;
  padding: 6px 4px;
  border-radius: 2px;
  text-decoration: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  transition: all 0.1s;
}

.follow-btn.github {
  color: var(--color-text);
  background: var(--color-bg);
}

.follow-btn.rss {
  color: var(--color-text);
  background: var(--color-bg);
}

.follow-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 1px var(--color-border);
}

/* ====== 通用侧边栏标题 ====== */
.sidebar-title {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border-light);
}

/* ====== 公告卡 ====== */
.notice-card {
  padding: 18px;
}

.notice-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-primary-light);
  line-height: 1.5;
}

/* ====== 最新文章 ====== */
.recent-card {
  padding: 18px;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  margin-bottom: 10px;
}

.recent-item:last-child {
  margin-bottom: 0;
}

.recent-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
  padding: 6px 8px;
  border-left: 3px solid transparent;
  transition: all 0.1s;
  border-radius: 0 2px 2px 0;
}

.recent-link:hover {
  background: var(--color-bg);
  border-left-color: var(--color-primary);
}

.recent-title {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-date {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .sidebar {
    position: static;
    max-height: none;
    overflow: visible;
  }
}
</style>
