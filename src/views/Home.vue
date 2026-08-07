<script setup>
/**
 * 首页 - 双层结构
 * 1. HeroSection 英雄区（全屏品牌形象）
 * 2. 内容聚合区（关于我 / 文章列表 / 数据看板 / 签名）
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import PixelBox from '../components/PixelBox.vue'
import CreateMenu from '../components/CreateMenu.vue'
import ClockWidget from '../components/ClockWidget.vue'
import Checkin from '../components/Checkin.vue'
import { useDocsStore } from '../stores/docs.js'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const docsStore = useDocsStore()
const { avatarConfig } = useTheme()

const contentRef = ref(null)
const heroSectionRef = ref(null)
const heroVisible = ref(true)

// ====== 滚动监听：控制 NavBar 透明模式 ======
let scrollRaf = null

function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    const el = heroSectionRef.value
    if (el) {
      const rect = el.getBoundingClientRect()
      heroVisible.value = rect.bottom > 80
    } else {
      heroVisible.value = false
    }

    if (heroVisible.value) {
      document.body.classList.add('hero-visible')
    } else {
      document.body.classList.remove('hero-visible')
    }
    scrollRaf = null
  })
}

// ====== 英雄区 → 内容区 平滑滚动 ======
function scrollToContent() {
  nextTick(() => {
    contentRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// ====== 文章数据 ======
const latestArticles = computed(() => {
  const list = [...docsStore.documents]
  list.sort((a, b) => (a.date < b.date ? 1 : -1))
  return list.slice(0, 5)
})

// ====== 统计数据 ======
const stats = computed(() => {
  const docs = docsStore.documents
  const allTags = new Set()
  const allCategories = new Set()
  docs.forEach(d => {
    d.tags.forEach(t => allTags.add(t))
    allCategories.add(d.category)
  })
  return {
    articles: docs.length,
    tags: allTags.size,
    categories: allCategories.size
  }
})

// ====== 头像旋转动画 ======
const avatarAngle = ref(0)
const avatarHovered = ref(false)
let avatarRaf = null
let avatarLastTime = 0
let fastSpinRemaining = 0

const SLOW_DEG_PER_MS = 360 / 10000
const FAST_DEG_PER_MS = 360 / 600

function animateAvatar(now) {
  if (!avatarLastTime) avatarLastTime = now
  const delta = now - avatarLastTime
  avatarLastTime = now

  if (avatarHovered.value) {
    const inc = FAST_DEG_PER_MS * delta
    avatarAngle.value += inc
    fastSpinRemaining -= inc
    if (fastSpinRemaining <= 0) {
      avatarHovered.value = false
      fastSpinRemaining = 0
    }
  } else {
    avatarAngle.value += SLOW_DEG_PER_MS * delta
  }

  avatarAngle.value = avatarAngle.value % 360
  avatarRaf = requestAnimationFrame(animateAvatar)
}

function onAvatarEnter() {
  avatarHovered.value = true
  fastSpinRemaining = 360
}

function onAvatarLeave() {
  avatarHovered.value = false
  fastSpinRemaining = 0
}

// ====== 社交链接 ======
const socialLinks = [
  { icon: '🐙', label: 'GitHub', url: '#' },
  { icon: '💬', label: '微信', url: '#' },
  { icon: '📧', label: 'Email', url: '#' },
  { icon: '🎮', label: '游戏', url: '#' }
]

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  nextTick(() => {
    onScroll()
  })
  avatarRaf = requestAnimationFrame(animateAvatar)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.classList.remove('hero-visible')
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  if (avatarRaf) cancelAnimationFrame(avatarRaf)
})
</script>

<template>
  <div class="home-page">
    <!-- ====== 第一屏：英雄区 ====== -->
    <div ref="heroSectionRef">
      <HeroSection
        brand-name="PIXEL·BLOG"
        @scroll-down="scrollToContent"
      />
    </div>

    <!-- ====== 第二屏及以下：内容聚合区 ====== -->
    <section ref="contentRef" class="content-section">
      <div class="content-container">
        <!-- 左侧：关于我 + 数据看板 -->
        <aside class="content-left">
          <!-- 关于我 -->
          <PixelBox class="about-card">
            <div class="about-header">
              <div
                class="pixel-avatar"
                :class="{
                  'avatar-circle': avatarConfig.type !== 'pixel',
                  'avatar-image': avatarConfig.type === 'image',
                  'avatar-char': avatarConfig.type === 'char'
                }"
                :style="{ transform: `rotate(${avatarAngle}deg)` }"
                @mouseenter="onAvatarEnter"
                @mouseleave="onAvatarLeave"
                title="PDX-X · 鼠标悬停旋转一圈"
              >
                <!-- 像素模式 -->
                <template v-if="avatarConfig.type === 'pixel'">
                  <div class="avatar-grid">
                    <span v-for="i in 64" :key="i" class="avatar-pixel" :class="{
                      'bg': avatarConfig.pixelPattern.includes(i),
                      'eye-l': avatarConfig.eyeIndices[0] === i,
                      'eye-r': avatarConfig.eyeIndices[1] === i,
                      'mouth': avatarConfig.mouthIndices.includes(i)
                    }"></span>
                  </div>
                </template>
                <!-- 图片模式 -->
                <template v-else-if="avatarConfig.type === 'image'">
                  <img
                    :src="avatarConfig.content"
                    alt="avatar"
                    class="avatar-img"
                    @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex') }"
                  />
                  <div class="avatar-fallback" style="display:none">
                    <span>{{ avatarConfig.content || '👤' }}</span>
                  </div>
                </template>
                <!-- 字符模式 -->
                <template v-else>
                  <span class="avatar-char-text">{{ avatarConfig.content || '👤' }}</span>
                </template>
              </div>
              <div class="about-info">
                <h2 class="about-name">PDX-X</h2>
                <p class="about-title">全栈开发者 · 像素爱好者</p>
              </div>
            </div>
            <p class="about-desc">热爱像素艺术与复古美学，在代码世界里构筑属于自己的像素小站。用有限的像素，创造无限的可能。</p>
            <div class="social-links">
              <a
                v-for="link in socialLinks"
                :key="link.label"
                :href="link.url"
                class="social-link"
                :title="link.label"
              >
                <span class="social-icon">{{ link.icon }}</span>
              </a>
            </div>
          </PixelBox>

          <!-- 时钟组件（替代数据统计） -->
          <PixelBox class="clock-card">
            <h3 class="clock-title">🕐 像素时钟</h3>
            <div class="clock-container">
              <ClockWidget />
            </div>
          </PixelBox>

          <!-- 个人签名 -->
          <PixelBox class="signature-card">
            <h3 class="signature-title">✏️ 个人签名</h3>
            <p class="signature-text">"即使再小的帆也能远航"</p>
            <div class="signature-divider">
              <span v-for="i in 12" :key="i" class="divider-dot" :class="{ active: i % 3 === 0 }"></span>
            </div>
            <p class="signature-hint">— PDX-X · 像素世界探索中</p>
          </PixelBox>
        </aside>

        <!-- 中间：文章动态列表 -->
        <main class="content-main">
          <div class="section-header">
            <h2 class="section-title">📜 最新动态</h2>
            <RouterLink to="/docs" class="view-all">
              查看全部 →
            </RouterLink>
          </div>

          <div class="article-list" v-if="latestArticles.length">
            <PixelBox
              v-for="article in latestArticles"
              :key="article.id"
              class="article-card"
            >
              <RouterLink :to="`/post/${article.id}`" class="article-link">
                <div class="article-header">
                  <span class="article-category">{{ article.category }}</span>
                  <span class="article-date">{{ article.date }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-desc" v-if="article.description">{{ article.description }}</p>
                <div class="article-tags" v-if="article.tags && article.tags.length">
                  <span
                    v-for="tag in article.tags.slice(0, 4)"
                    :key="tag"
                    class="article-tag"
                  >#{{ tag }}</span>
                </div>
              </RouterLink>
            </PixelBox>
          </div>

          <PixelBox v-else class="empty-state">
            <div class="empty-icon">░▒▓</div>
            <p>暂无文章，快去创作第一篇吧！</p>
            <button class="pixel-btn" @click="router.push('/docs?action=create')">
              ✏️ 写文档
            </button>
          </PixelBox>
        </main>

        <!-- 右侧：固定信息 -->
        <aside class="content-right">
          <!-- 每日签到（替代快速导航） -->
          <PixelBox class="checkin-card">
            <Checkin />
          </PixelBox>

          <!-- 公告栏 -->
          <PixelBox class="notice-card">
            <h3 class="notice-title">📢 最新公告</h3>
            <div class="notice-content">
              <p class="notice-text">🎉 欢迎来到 PIXEL·BLOG v2.0！</p>
              <p class="notice-sub">全新像素风格改版上线</p>
            </div>
            <div class="notice-ticker">
              <span class="ticker-icon">►</span>
              <span class="ticker-text">持续更新中，敬请期待更多像素内容...</span>
            </div>
          </PixelBox>

          <!-- 友情链接 -->
          <PixelBox class="links-card">
            <h3 class="links-title">🔗 友情链接</h3>
            <div class="links-list">
              <a href="#" class="friend-link">像素艺术网</a>
              <a href="#" class="friend-link">Vue.js 官网</a>
              <a href="#" class="friend-link">Vite 构建工具</a>
              <a href="#" class="friend-link">Pinia 状态管理</a>
            </div>
          </PixelBox>
        </aside>
      </div>
    </section>

    <!-- 创作浮动菜单 -->
    <CreateMenu />
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* ====== 内容区 ====== */
.content-section {
  min-height: 100vh;
  padding: 48px 0 64px;
  background: var(--color-bg);
}

.content-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr 260px;
  gap: 24px;
  align-items: start;
}

/* ====== 左侧栏 ====== */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: visible;
  padding-right: 4px;
  scrollbar-width: thin;
}

.content-left::-webkit-scrollbar {
  width: 4px;
}

.content-left::-webkit-scrollbar-track {
  background: var(--color-bg);
}

.content-left::-webkit-scrollbar-thumb {
  background: var(--color-border);
}

/* 关于我卡片 */
.about-card {
  padding: 20px;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.pixel-avatar {
  width: 64px;
  height: 64px;
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  padding: 4px;
  flex-shrink: 0;
  transform-origin: center center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* 圆形模式（图片/字符） */
.pixel-avatar.avatar-circle {
  border-radius: 50%;
  padding: 0;
  background: var(--color-bg);
  box-shadow:
    0 0 0 3px var(--color-border),
    inset 0 0 0 2px var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图片模式 */
.pixel-avatar.avatar-image {
  padding: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 24px;
  border-radius: 50%;
}

/* 字符模式 */
.pixel-avatar.avatar-char {
  background: var(--color-primary);
}

.avatar-char-text {
  font-size: 28px;
  line-height: 1;
  font-family: var(--font-title);
  color: var(--color-text-inverse);
  user-select: none;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
  gap: 1px;
}

.avatar-pixel {
  width: 100%;
  height: 100%;
  background: var(--color-primary);
}

.avatar-pixel.bg {
  background: var(--color-primary-dark);
}

.avatar-pixel.eye-l,
.avatar-pixel.eye-r {
  background: var(--color-text-inverse);
}

.avatar-pixel.mouth {
  background: var(--color-text-inverse);
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.about-name {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
  margin: 0;
}

.about-title {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-primary-light);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.about-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0 0 14px;
}

.social-links {
  display: flex;
  gap: 8px;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  text-decoration: none;
  transition: transform 0.1s;
}

.social-link:hover {
  transform: translate(2px, 2px);
  background: var(--color-primary);
}

.social-icon {
  font-size: 16px;
}

/* 时钟卡片 */
.clock-card {
  padding: 18px;
}

.clock-title {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
  margin-bottom: 10px;
}

.clock-container {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
}

/* 签到卡片 */
.checkin-card {
  padding: 0;
  overflow: hidden;
}

/* 统计数据（保留响应式兼容） */

/* 签名卡片 */
.signature-card {
  padding: 18px;
}

.signature-title {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
  margin-bottom: 10px;
}

.signature-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-primary-light);
  line-height: 1.5;
  margin: 0 0 12px;
  font-style: italic;
}

.signature-divider {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.divider-dot {
  width: 8px;
  height: 4px;
  background: var(--color-border-light);
}

.divider-dot.active {
  background: var(--color-primary);
}

.signature-hint {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0;
}

/* ====== 中间栏：文章列表 ====== */
.content-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding: 0 4px;
}

.section-title {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
  margin: 0;
  text-shadow: 2px 2px 0 var(--color-primary);
}

.view-all {
  font-family: var(--font-code);
  font-size: 16px;
  color: var(--color-primary);
  text-decoration: none;
}

.view-all:hover {
  color: var(--color-secondary);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  padding: 0;
  transition: transform 0.15s;
}

.article-card:hover {
  transform: translateX(4px);
}

.article-link {
  display: block;
  padding: 20px 24px;
  text-decoration: none;
  color: inherit;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-category {
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  padding: 3px 8px;
  box-shadow: inset 0 0 0 2px var(--color-primary-dark);
}

.article-date {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

.article-title {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0 0 8px;
  transition: color 0.15s;
}

.article-link:hover .article-title {
  color: var(--color-primary);
}

.article-desc {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-tag {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-secondary-light);
  background: rgba(108, 99, 255, 0.15);
  padding: 2px 8px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-family: var(--font-code);
  font-size: 32px;
  color: var(--color-primary);
  letter-spacing: 8px;
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text-light);
}

/* ====== 右侧栏 ====== */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
  z-index: 2;
}

/* 公告栏 */
.notice-card {
  padding: 18px;
}

.notice-title {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
  margin-bottom: 12px;
}

.notice-content {
  margin-bottom: 12px;
}

.notice-text {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-primary-light);
  margin: 0 0 4px;
  line-height: 1.5;
}

.notice-sub {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0;
}

.notice-ticker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
}

.ticker-icon {
  color: var(--color-primary);
  font-size: 10px;
  animation: ticker-pulse 1s ease-in-out infinite;
}

@keyframes ticker-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ticker-text {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 友情链接 */
.links-card {
  padding: 18px;
}

.links-title {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
  margin-bottom: 12px;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friend-link {
  font-family: var(--font-code);
  font-size: 15px;
  color: var(--color-secondary-light);
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.1s, padding-left 0.1s;
}

.friend-link:hover {
  color: var(--color-primary);
  padding-left: 8px;
}

.friend-link::before {
  content: '► ';
  color: var(--color-border-light);
  font-size: 10px;
}

.friend-link:hover::before {
  color: var(--color-primary);
}

/* ====== 响应式：<1100px 三栏变两栏 ====== */
@media (max-width: 1100px) {
  .content-container {
    grid-template-columns: 240px 1fr;
  }

  .content-right {
    grid-column: 1 / -1;
    grid-row: 3;
    flex-direction: row;
    position: static;
  }

  .content-right > * {
    flex: 1;
    min-width: 0;
  }
}

/* ====== 响应式：<768px 单栏 ====== */
@media (max-width: 768px) {
  .content-section {
    padding: 32px 0 48px;
  }

  .content-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .content-left,
  .content-right {
    position: static;
    flex-direction: column;
  }

  .content-right > * {
    flex: none;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ====== 透明主题 ====== */
.theme-transparent .content-section {
  background: transparent;
}

.theme-transparent .about-title,
.theme-transparent .about-name,
.theme-transparent .section-title,
.theme-transparent .article-title,
.theme-transparent .notice-text {
  /* [FIX] */ color: #FFFFFF;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .about-desc,
.theme-transparent .article-desc,
.theme-transparent .notice-sub,
.theme-transparent .view-all,
.theme-transparent .friend-link,
.theme-transparent .signature-text {
  /* [FIX] */ color: #E0E0E0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .empty-state p {
  /* [FIX] */ color: #E0E0E0;
}
</style>
