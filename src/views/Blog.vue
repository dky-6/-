<script setup>
/**
 * Blog - 博客列表页 [NEW]
 * 独立于文档模块，双栏布局：左侧文章列表 + 右侧侧边栏
 * 支持分类筛选、标签筛选、关键词搜索
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PixelBox from '../components/PixelBox.vue'
import { useBlogStore } from '../stores/blog.js'

const router = useRouter()
const blogStore = useBlogStore()

// ====== 筛选状态 ======
const activeCategory = ref('全部')
const activeTag = ref('')
const searchKeyword = ref('')

function selectCategory(cat) {
  activeCategory.value = cat
  activeTag.value = '' // 切换分类时清除标签筛选
}

function selectTag(tag) {
  // 再次点击同一标签则取消
  activeTag.value = activeTag.value === tag ? '' : tag
}

function handleSearch() {
  // 搜索时不清除分类/标签筛选，叠加过滤
}

// ====== 最终展示列表：分类 + 标签 + 搜索叠加 ======
const displayList = computed(() => {
  let list = blogStore.filterByCategory(activeCategory.value)
  if (activeTag.value) {
    list = list.filter(p => p.tags.includes(activeTag.value))
  }
  if (searchKeyword.value.trim()) {
    list = blogStore.searchByKeyword(searchKeyword.value, list)
  }
  return list
})

// ====== 分类计数 ======
const categoryCount = computed(() => {
  const counts = { '全部': blogStore.posts.length }
  blogStore.categories.forEach(cat => {
    if (cat !== '全部') {
      counts[cat] = blogStore.posts.filter(p => p.category === cat).length
    }
  })
  return counts
})

// ====== 侧边栏数据 ======
const authorInfo = {
  name: 'PDX-X',
  bio: 'Backend Developer · Go Enthusiast · Gamer',
  signature: '即使再小的帆也能远航 🚢'
}

const stats = computed(() => blogStore.stats)
const latestPosts = computed(() => blogStore.latestPosts)
const allTags = computed(() => blogStore.allTags)

function goToPost(id) {
  router.push(`/post/${id}`)
}

// 跳转到博客编辑器
function goEditor() {
  router.push('/post-editor')
}
</script>

<template>
  <div class="page-container blog-page">
    <!-- 页面标题 + 写博客按钮 -->
    <div class="blog-header">
      <h1 class="page-title">▶ 博客</h1>
      <button class="write-btn" @click="goEditor">
        <span class="write-icon">✎</span>
        <span>写博客</span>
      </button>
    </div>

    <!-- 搜索栏 -->
    <PixelBox class="search-box">
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="搜索文章标题、内容或标签..."
        @input="handleSearch"
      />
      <span class="search-icon">🔍</span>
    </PixelBox>

    <!-- 双栏布局 -->
    <div class="blog-layout">
      <!-- ====== 左侧：文章列表 ====== -->
      <main class="blog-main">
        <!-- 分类筛选 -->
        <PixelBox class="category-nav">
          <button
            v-for="cat in blogStore.categories"
            :key="cat"
            class="cat-btn"
            :class="{ active: activeCategory === cat }"
            @click="selectCategory(cat)"
          >{{ cat }} ({{ categoryCount[cat] || 0 }})</button>
        </PixelBox>

        <!-- 当前筛选状态提示 -->
        <div class="filter-status" v-if="activeTag">
          <span class="filter-label">标签筛选：</span>
          <span class="filter-tag">{{ activeTag }}</span>
          <button class="filter-clear" @click="activeTag = ''">✕</button>
        </div>

        <!-- 文章列表 -->
        <div class="post-list" v-if="displayList.length">
          <PixelBox
            v-for="post in displayList"
            :key="post.id"
            class="post-card"
            @click="goToPost(post.id)"
          >
            <div class="post-card-body">
              <div class="post-header">
                <h3 class="post-title">{{ post.title }}</h3>
                <span class="post-views">👁 {{ post.views || 0 }}</span>
              </div>
              <p class="post-desc">{{ post.description }}</p>
              <div class="post-footer">
                <div class="post-tags">
                  <span class="tag tag-category" @click.stop="selectCategory(post.category)">
                    {{ post.category }}
                  </span>
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="tag tag-label"
                    :class="{ 'tag-active': activeTag === tag }"
                    @click.stop="selectTag(tag)"
                  >#{{ tag }}</span>
                </div>
                <span class="post-date">📅 {{ post.date }}</span>
              </div>
            </div>
          </PixelBox>
        </div>

        <!-- 空状态 -->
        <PixelBox v-else class="empty">
          <div class="empty-icon">░▒▓</div>
          <p class="empty-text" v-if="searchKeyword.trim()">没有匹配 "{{ searchKeyword }}" 的文章</p>
          <p class="empty-text" v-else-if="activeTag">没有包含标签 "{{ activeTag }}" 的文章</p>
          <p class="empty-text" v-else>该分类下还没有文章</p>
        </PixelBox>
      </main>

      <!-- ====== 右侧：侧边栏 ====== -->
      <aside class="blog-sidebar">
        <!-- 博主信息卡 -->
        <PixelBox class="author-card">
          <div class="author-avatar">
            <div class="avatar-circle">👤</div>
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
        </PixelBox>

        <!-- 标签云 -->
        <PixelBox class="tag-cloud-card">
          <h3 class="sidebar-title">🏷 标签云</h3>
          <div class="tag-cloud">
            <button
              v-for="tag in allTags"
              :key="tag"
              class="cloud-tag"
              :class="{ active: activeTag === tag }"
              @click="selectTag(tag)"
            >{{ tag }}</button>
          </div>
        </PixelBox>

        <!-- 公告 -->
        <PixelBox class="notice-card">
          <h3 class="sidebar-title">📢 公告</h3>
          <p class="notice-text">{{ authorInfo.signature }}</p>
        </PixelBox>

        <!-- 最新文章 -->
        <PixelBox class="recent-card">
          <h3 class="sidebar-title">📝 最新文章</h3>
          <ul class="recent-list">
            <li
              v-for="post in latestPosts"
              :key="post.id"
              class="recent-item"
              @click="goToPost(post.id)"
            >
              <span class="recent-title">{{ post.title }}</span>
              <span class="recent-date">{{ post.date }}</span>
            </li>
          </ul>
        </PixelBox>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  max-width: 1280px;
}

/* ====== 页面顶部：标题 + 写博客按钮 ====== */
.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.blog-header .page-title {
  margin-bottom: 0;
}

.write-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-title);
  font-size: 11px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 10px 18px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border),
    3px 3px 0 var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
  text-decoration: none;
}

.write-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border),
    1px 1px 0 var(--color-border);
}

.write-btn:active {
  transform: translate(3px, 3px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.write-icon {
  font-size: 14px;
}

/* ====== 搜索栏 ====== */
.search-box {
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
  padding: 6px 0;
}

.search-input::placeholder {
  color: var(--color-text-light);
  opacity: 0.7;
}

.search-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* ====== 双栏布局 ====== */
.blog-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.blog-main {
  flex: 1;
  min-width: 0;
}

.blog-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}

.blog-sidebar::-webkit-scrollbar {
  width: 4px;
}

.blog-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
}

/* ====== 分类导航 ====== */
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 14px 16px;
}

.cat-btn {
  font-family: var(--font-title);
  font-size: 10px;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 6px 12px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.cat-btn:hover {
  background: var(--color-primary-light);
}

.cat-btn.active {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

/* ====== 筛选状态 ====== */
.filter-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 14px;
  background: var(--color-secondary);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 14px;
  border-radius: 2px;
  box-shadow:
    inset 0 0 0 2px var(--color-secondary-light),
    0 0 0 2px var(--color-border);
}

.filter-label {
  font-family: var(--font-body);
}

.filter-tag {
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-text);
  color: var(--color-text-inverse);
  padding: 2px 8px;
  border-radius: 2px;
}

.filter-clear {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}

.filter-clear:hover {
  color: var(--color-primary-light);
}

/* ====== 文章卡片 ====== */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.post-card {
  padding: 0;
  cursor: pointer;
  transition: transform 0.1s;
}

.post-card:hover {
  transform: translate(-2px, -2px);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border),
    4px 4px 0 var(--color-primary);
}

.post-card-body {
  padding: 18px 22px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.post-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text);
  line-height: 1.4;
  flex: 1;
}

.post-card:hover .post-title {
  color: var(--color-primary-light);
}

.post-views {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  flex-shrink: 0;
  white-space: nowrap;
}

.post-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1.5;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-family: var(--font-title);
  font-size: 8px;
  padding: 3px 7px;
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.tag-category {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
}

.tag-category:hover {
  background: var(--color-primary);
}

.tag-label {
  background: rgba(108, 99, 255, 0.2);
  color: var(--color-secondary-light);
  box-shadow: inset 0 0 0 1px var(--color-border-light);
}

.tag-label:hover {
  background: var(--color-secondary);
  color: var(--color-text);
}

.tag-active {
  background: var(--color-secondary);
  color: var(--color-text);
  box-shadow: inset 0 0 0 2px var(--color-secondary-light);
}

.post-date {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

/* ====== 侧边栏通用 ====== */
.sidebar-title {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border-light);
}

/* 博主信息卡 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  border-radius: 50%;
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

/* 标签云 */
.tag-cloud-card {
  padding: 18px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cloud-tag {
  font-family: var(--font-title);
  font-size: 8px;
  background: var(--color-bg);
  color: var(--color-text-light);
  padding: 5px 9px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 1px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.cloud-tag:hover {
  background: var(--color-secondary);
  color: var(--color-text);
}

.cloud-tag.active {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

/* 公告 */
.notice-card {
  padding: 18px;
}

.notice-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-primary-light);
  line-height: 1.5;
}

/* 最新文章 */
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
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.1s;
  border-radius: 0 2px 2px 0;
}

.recent-item:last-child {
  margin-bottom: 0;
}

.recent-item:hover {
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
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .blog-layout {
    flex-direction: column;
  }

  .blog-sidebar {
    width: 100%;
    position: static;
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 600px) {
  .post-title {
    font-size: 16px;
  }

  .post-desc {
    font-size: 13px;
  }

  .post-header {
    flex-direction: column;
    gap: 4px;
  }

  .post-views {
    font-size: 12px;
  }
}
</style>
