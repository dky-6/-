<script setup>
/**
 * 文档列表页
 * - 集成搜索栏（实时模糊搜索）
 * - 集成上传弹窗（+ 上传文档）
 * - 分类筛选联动 URL（?category=frontend）
 * - 分类 + 搜索叠加过滤
 * - 新上传文档带 NEW 角标（3 天内）
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import PixelBox from '../components/PixelBox.vue'
import PixelButton from '../components/PixelButton.vue'
import SearchBar from '../components/SearchBar.vue'
import UploadModal from '../components/UploadModal.vue'
import { useDocsStore, categoryMap, keyToCategory } from '../stores/docs.js'

const route = useRoute()
const router = useRouter()
const docsStore = useDocsStore()

// ====== 分类筛选（联动 URL） ======
const categories = ['全部', '前端', '后端', '设计']

const activeCategory = computed({
  get() {
    const key = route.query.category || 'all'
    return keyToCategory[key] || '全部'
  },
  set(catName) {
    const key = categoryMap[catName] || 'all'
    router.replace({ query: { ...route.query, category: key } })
  }
})

function selectCategory(catName) {
  activeCategory.value = catName
}

// ====== 按分类筛选的列表（供搜索栏二次过滤） ======
const categoryFiltered = computed(() => {
  return docsStore.filteredByCategory(activeCategory.value)
})

// ====== 搜索关键词 ======
const searchKeyword = ref('')
function handleSearch(kw) {
  searchKeyword.value = kw
}

// ====== 最终展示列表：先按分类，再按关键词 ======
const displayList = computed(() => {
  if (!searchKeyword.value.trim()) return categoryFiltered.value
  return docsStore.searchByKeyword(searchKeyword.value, categoryFiltered.value)
})

// ====== 分类计数 ======
const categoryCount = computed(() => {
  const counts = { '全部': docsStore.documents.length }
  for (const cat of ['前端', '后端', '设计']) {
    counts[cat] = docsStore.documents.filter(d => d.category === cat).length
  }
  return counts
})

// ====== 上传弹窗 ======
const showUploadModal = ref(false)
function openUploadModal() {
  showUploadModal.value = true
}

// ====== 监听 ?action=create 自动打开上传弹窗 ======
watch(
  () => route.query.action,
  (action) => {
    if (action === 'create') {
      showUploadModal.value = true
      // 清除 query，避免回退时重复触发
      router.replace({ query: { ...route.query, action: undefined } })
    }
  },
  { immediate: true }
)
function onUploaded(newDoc) {
  // 上传成功后跳转到新文档详情
  router.push(`/post/${newDoc.id}`)
}

// ====== NEW 角标判断 ======
function showNewBadge(doc) {
  return docsStore.isNew(doc)
}
</script>

<template>
  <div class="page-container docs">
    <h1 class="page-title">▶ 文档</h1>

    <!-- 顶部工具栏：搜索栏 + 上传按钮 -->
    <div class="toolbar">
      <SearchBar
        :source-list="categoryFiltered"
        @search="handleSearch"
        class="toolbar-search"
      />
      <PixelButton @click="openUploadModal" class="upload-btn">+ 上传文档</PixelButton>
    </div>

    <!-- 分类导航 -->
    <PixelBox class="category-nav">
      <button
        v-for="cat in categories"
        :key="cat"
        class="cat-btn"
        :class="{ active: activeCategory === cat }"
        @click="selectCategory(cat)"
      >{{ cat }} ({{ categoryCount[cat] }})</button>
    </PixelBox>

    <!-- 文档卡片列表 -->
    <div class="post-grid" v-if="displayList.length">
      <PixelBox
        v-for="post in displayList"
        :key="post.id"
        class="post-card"
      >
        <RouterLink :to="`/post/${post.id}`" class="post-link">
          <!-- NEW 角标 -->
          <span v-if="showNewBadge(post)" class="new-badge">NEW</span>
          <div class="post-card-body">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-desc">{{ post.description }}</p>
            <div class="post-footer">
              <div class="post-tags">
                <span class="tag">{{ post.category }}</span>
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="tag tag-secondary"
                >{{ tag }}</span>
              </div>
              <span class="post-date">{{ post.date }}</span>
            </div>
          </div>
        </RouterLink>
      </PixelBox>
    </div>

    <!-- 空状态 -->
    <PixelBox v-else class="empty">
      <div class="empty-icon">░▒▓</div>
      <p class="empty-text" v-if="searchKeyword.trim()">没有匹配 "{{ searchKeyword }}" 的文档</p>
      <p class="empty-text" v-else>该分类下还没有文档</p>
      <p class="empty-hint">点击右上角 "+ 上传文档" 添加新内容</p>
    </PixelBox>

    <!-- 上传弹窗 -->
    <UploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="onUploaded"
    />
  </div>
</template>

<style scoped>
.docs {
  max-width: 900px;
}

/* ====== 工具栏 ====== */
.toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.toolbar-search {
  flex: 1;
}

.upload-btn {
  white-space: nowrap;
  flex-shrink: 0;
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

/* ====== 文档卡片 ====== */
.post-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  padding: 0;
  position: relative;
  overflow: hidden;
}

.post-link {
  display: block;
  text-decoration: none;
  color: var(--color-text);
}

.post-card-body {
  padding: 16px 20px;
}

.post-link:hover .post-title {
  color: var(--color-primary-light);
}

/* NEW 角标 */
.new-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 4px 10px;
  border-radius: 0 0 0 2px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  z-index: 1;
  animation: new-pulse 1.5s ease-in-out infinite;
}

@keyframes new-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.post-title {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 6px;
  line-height: 1.4;
}

.post-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1.5;
  margin-bottom: 10px;
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
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  padding: 3px 7px;
  border-radius: 2px;
}

.tag-secondary {
  background: var(--color-secondary);
}

.post-date {
  font-family: var(--font-code);
  font-size: 14px;
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
  margin-bottom: 6px;
}

.empty-hint {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .toolbar {
    flex-direction: column;
  }
  .upload-btn {
    width: 100%;
    text-align: center;
  }
  .post-title {
    font-size: 15px;
  }
  .post-desc {
    font-size: 13px;
  }
}
</style>
