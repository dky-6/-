<script setup>
/**
 * 像素风搜索栏组件
 * - 实时模糊搜索（标题 + 描述 + 标签）
 * - 下拉面板展示结果，高亮匹配关键词
 * - 无结果时显示像素风占位提示
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs.js'

const props = defineProps({
  // 当前已按分类筛选的列表
  sourceList: { type: Array, default: () => [] }
})

const emit = defineEmits(['search'])

const router = useRouter()
const docsStore = useDocsStore()

const keyword = ref('')
const isFocused = ref(false)
const searchBarRef = ref(null)

// 搜索结果（基于传入的 sourceList 做二次模糊搜索）
const searchResults = computed(() => {
  const list = props.sourceList.length ? props.sourceList : docsStore.documents
  if (!keyword.value.trim()) return []
  return docsStore.searchByKeyword(keyword.value, list)
})

// 高亮匹配关键词
function highlight(text) {
  if (!keyword.value.trim() || !text) return text
  const kw = keyword.value.trim()
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const reg = new RegExp(`(${escaped})`, 'gi')
  return text.replace(reg, '<mark class="search-highlight">$1</mark>')
}

function handleInput() {
  emit('search', keyword.value)
}

function goToPost(id) {
  keyword.value = ''
  isFocused.value = false
  router.push(`/post/${id}`)
}

function handleFocus() {
  isFocused.value = true
}

function handleClickOutside(e) {
  if (searchBarRef.value && !searchBarRef.value.contains(e.target)) {
    isFocused.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// 暴露清空方法给父组件
defineExpose({
  clear: () => { keyword.value = '' }
})
</script>

<template>
  <div class="search-bar" ref="searchBarRef">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="搜索文档..."
        @input="handleInput"
        @focus="handleFocus"
      />
      <button
        v-if="keyword"
        class="search-clear"
        @click="keyword = ''; handleInput()"
      >✕</button>
    </div>

    <!-- 下拉搜索结果面板 -->
    <div
      v-if="isFocused && keyword.trim()"
      class="search-dropdown"
    >
      <div v-if="searchResults.length" class="result-list">
        <div
          v-for="item in searchResults"
          :key="item.id"
          class="result-item"
          @click="goToPost(item.id)"
        >
          <div class="result-title" v-html="highlight(item.title)"></div>
          <div class="result-desc" v-html="highlight(item.description)"></div>
          <div class="result-meta">
            <span class="result-tag">{{ item.category }}</span>
            <span class="result-date">{{ item.date }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-result">
        <span class="no-result-icon">░▒▓</span>
        <p>没有找到匹配的文档</p>
        <span class="no-result-hint">试试其他关键词？</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  padding: 0 12px;
}

.search-icon {
  font-size: 14px;
  opacity: 0.7;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 16px;
  padding: 10px 8px;
}

.search-input::placeholder {
  color: var(--color-text-light);
  opacity: 0.6;
}

.search-clear {
  background: var(--color-border-light);
  border: none;
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 2px;
  line-height: 1;
}

.search-clear:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
}

/* ====== 下拉面板 ====== */
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border),
    0 4px 12px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.result-list {
  padding: 4px;
}

.result-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.1s;
}

.result-item:hover {
  background: var(--color-primary-dark);
}

.result-item:hover .result-title,
.result-item:hover .result-desc,
.result-item:hover .result-tag,
.result-item:hover .result-date {
  color: var(--color-text-inverse);
}

.result-title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 4px;
}

.result-desc {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-light);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

.result-tag {
  font-family: var(--font-title);
  font-size: 8px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  padding: 2px 6px;
  border-radius: 2px;
}

.result-date {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

/* ====== 高亮关键词 ====== */
:deep(.search-highlight) {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0 2px;
  border-radius: 1px;
  font-weight: bold;
}

.result-item:hover :deep(.search-highlight) {
  background: var(--color-border);
  color: var(--color-text-inverse);
}

/* ====== 无结果占位 ====== */
.no-result {
  text-align: center;
  padding: 32px 20px;
}

.no-result-icon {
  font-family: var(--font-code);
  font-size: 20px;
  color: var(--color-primary);
  letter-spacing: 4px;
}

.no-result p {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text);
  margin: 12px 0 4px;
}

.no-result-hint {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .search-input {
    font-size: 14px;
    padding: 8px 6px;
  }
}
</style>
