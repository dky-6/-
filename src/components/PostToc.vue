<script setup>
/**
 * PostToc - 文章目录组件 [NEW]
 * 从 Markdown 内容自动提取标题，生成带序号的层级目录
 * 支持点击跳转 + 滚动高亮
 */
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  content: { type: String, default: '' }
})

const headings = ref([])
const activeId = ref('')
let observer = null

// 从 Markdown 中提取标题
function extractHeadings(markdown) {
  const result = []
  const lines = markdown.split('\n')
  // 计数器，用于自动编号
  const counters = [0, 0, 0]
  let inCodeBlock = false // [FIX] 标记是否在代码块内

  for (const line of lines) {
    // [FIX] 检测代码块开始/结束（``` 或 ~~~）
    if (/^(`{3}|~{3})/.test(line.trim())) {
      inCodeBlock = !inCodeBlock
      continue
    }
    // [FIX] 跳过代码块内的行（避免误识别 # 注释为标题）
    if (inCodeBlock) continue

    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (!match) continue
    const level = match[1].length
    const text = match[2].replace(/[`*_~]/g, '').trim()
    if (!text) continue

    // 编号逻辑
    counters[level - 1]++
    // 重置下级编号
    for (let i = level; i < 3; i++) counters[i] = 0

    const num = counters.slice(0, level).join('.')
    const id = `heading-${result.length}`

    result.push({ id, level, text, num })
  }
  return result
}

// 跳转到指定标题
function scrollToHeading(h) {
  const el = document.getElementById(h.id)
  if (el) {
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 设置 IntersectionObserver 监听滚动高亮
function setupObserver() {
  if (observer) observer.disconnect()

  nextTick(() => {
    const els = headings.value
      .map(h => document.getElementById(h.id))
      .filter(Boolean)

    if (!els.length) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    els.forEach(el => observer.observe(el))
  })
}

watch(
  () => props.content,
  () => {
    headings.value = extractHeadings(props.content)
    setupObserver()
  },
  { immediate: false }
)

onMounted(() => {
  headings.value = extractHeadings(props.content)
  setupObserver()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <nav class="post-toc" v-if="headings.length">
    <h3 class="toc-title">📑 目录</h3>
    <ul class="toc-list">
      <li
        v-for="h in headings"
        :key="h.id"
        class="toc-item"
        :class="[
          `toc-level-${h.level}`,
          { active: activeId === h.id }
        ]"
        @click="scrollToHeading(h)"
      >
        <span class="toc-num">{{ h.num }}</span>
        <span class="toc-text">{{ h.text }}</span>
      </li>
    </ul>
  </nav>
  <div v-else class="post-toc-empty">
    <h3 class="toc-title">📑 目录</h3>
    <p class="toc-empty-text">暂无目录</p>
  </div>
</template>

<style scoped>
.post-toc {
  position: relative;
}

.toc-title {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border-light);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.toc-list::-webkit-scrollbar {
  width: 4px;
}

.toc-list::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
}

.toc-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.1s;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1.4;
}

.toc-level-1 {
  font-size: 15px;
  font-weight: bold;
  color: var(--color-text);
}

.toc-level-2 {
  padding-left: 20px;
}

.toc-level-3 {
  padding-left: 32px;
  font-size: 13px;
}

.toc-num {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-primary-light);
  flex-shrink: 0;
}

.toc-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.toc-item.active {
  background: var(--color-primary-dark);
  border-left-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.toc-item.active .toc-num {
  color: var(--color-text-inverse);
}

.post-toc-empty {
  text-align: center;
}

.toc-empty-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-light);
}
</style>
