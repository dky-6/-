<script setup>
/**
 * 文章详情页 [NEW] - 双栏布局
 * 左侧：文章完整内容（Markdown 渲染 + 代码块复制）
 * 右侧：侧边栏（博主信息 + 目录 + 公告 + 最新文章）
 */
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import PixelBox from '../components/PixelBox.vue'
import Sidebar from '../components/Sidebar.vue'
import { useBlogStore } from '../stores/blog.js' // [NEW] 博客 store
import { useDocsStore } from '../stores/docs.js' // 兼容文档模块

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const docsStore = useDocsStore()

// [FIX] 优先从 blog store 查找，找不到则回退到 docs store
const post = computed(() => {
  return blogStore.getById(route.params.id) || docsStore.getById(route.params.id)
})

// 判断当前文章是否来自博客模块
const isBlogPost = computed(() => !!blogStore.getById(route.params.id))

const renderedHtml = ref('')
const contentRef = ref(null)

// [FIX] 根据文章来源选择上一篇/下一篇
const adjacent = computed(() => {
  if (isBlogPost.value) {
    return blogStore.getAdjacent(route.params.id)
  }
  // docs 文章的上一篇/下一篇
  const sorted = [...docsStore.documents].sort((a, b) => new Date(b.date) - new Date(a.date))
  const idx = sorted.findIndex(d => d.id === route.params.id)
  const prev = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null
  const next = idx > 0 ? sorted[idx - 1] : null
  return { prev, next }
})
const prevPost = computed(() => adjacent.value.prev)
const nextPost = computed(() => adjacent.value.next)

// 配置 marked：自定义 renderer，为标题添加 id，代码块使用自定义渲染
const renderer = new marked.Renderer()

let headingCounter = 0

// [FIX] 为标题添加 id 用于 TOC 锚点跳转（marked v12 位置参数）
renderer.heading = function (text, level) {
  const id = `heading-${headingCounter++}`
  const sizes = { 1: 'h1', 2: 'h2', 3: 'h3' }
  const tag = sizes[level] || 'h3'
  return `<${tag} id="${id}" class="md-heading md-heading-${level}">${text}</${tag}>`
}

// [FIX] 代码块自定义渲染：包装为 CodeBlock 风格（语言标签 + 复制按钮）
renderer.code = function (code, infostring) {
  const language = (infostring || '').trim()
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let highlighted = escaped
  if (language && hljs.getLanguage(language)) {
    try {
      highlighted = hljs.highlight(code, { language }).value
    } catch (_) {
      // fallthrough
    }
  } else {
    try {
      highlighted = hljs.highlightAuto(code).value
    } catch (_) {
      // keep escaped
    }
  }

  const langLabel = language || 'code'
  return `<div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-lang-label">${langLabel}</span>
      <button class="code-copy-btn" onclick="copyCode(this)">复制</button>
    </div>
    <pre><code class="language-${language}">${highlighted}</code></pre>
  </div>`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer
})

function renderContent(content) {
  headingCounter = 0
  return marked.parse(content)
}

// 全局复制函数（挂载到 window）
function copyCode(btn) {
  const wrapper = btn.closest('.code-block-wrapper')
  const code = wrapper?.querySelector('code')?.textContent || ''

  function showCopied() {
    btn.textContent = '✓ 已复制'
    setTimeout(() => { btn.textContent = '复制' }, 2000)
  }

  function fallbackCopy() {
    const ta = document.createElement('textarea')
    ta.value = code
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch (_) {
      // ignore
    }
    document.body.removeChild(ta)
    showCopied()
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(showCopied).catch(fallbackCopy)
  } else {
    fallbackCopy()
  }
}

watch(
  () => post.value,
  (p) => {
    if (p) {
      renderedHtml.value = renderContent(p.content)
    } else {
      renderedHtml.value = ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.copyCode = copyCode
  // [NEW] 仅博客文章增加浏览量
  if (route.params.id && isBlogPost.value) {
    blogStore.incrementViews(route.params.id)
  }
})

onBeforeUnmount(() => {
  delete window.copyCode
})

function goBack() {
  router.push('/blog') // [FIX] 返回博客列表
}
</script>

<template>
  <div class="page-container post-detail-page">
    <!-- 找到文章 -->
    <template v-if="post">
      <div class="post-layout">
        <!-- ====== 左侧：文章主内容 ====== -->
        <main class="post-main">
          <PixelBox class="article-box">
            <!-- 文章头部 -->
            <div class="article-header">
              <h1 class="article-title">{{ post.title }}</h1>
              <div class="article-meta">
                <span class="meta-item">📅 {{ post.date }}</span>
                <span class="meta-sep">·</span>
                <span v-if="post.updatedDate" class="meta-item">🔄 {{ post.updatedDate }}</span>
                <span v-if="post.updatedDate" class="meta-sep">·</span>
                <router-link to="/blog" class="meta-link">{{ post.category }}</router-link>
                <span class="meta-sep">·</span>
                <span class="meta-item">👁 {{ post.views || 0 }}</span>
              </div>
              <div class="article-tags" v-if="post.tags && post.tags.length">
                <span v-for="tag in post.tags" :key="tag" class="article-tag">#{{ tag }}</span>
              </div>
              <p class="article-summary" v-if="post.description">{{ post.description }}</p>
            </div>

            <!-- 正文 -->
            <div
              ref="contentRef"
              class="markdown-body"
              v-html="renderedHtml"
            ></div>

            <!-- 底部：上一篇/下一篇 + 版权 -->
            <div class="article-footer">
              <div class="post-nav">
                <div class="post-nav-item prev" v-if="prevPost">
                  <span class="nav-label">◀ 上一篇</span>
                  <router-link :to="`/post/${prevPost.id}`" class="nav-title">{{ prevPost.title }}</router-link>
                </div>
                <div class="post-nav-spacer" v-else></div>
                <div class="post-nav-item next" v-if="nextPost">
                  <span class="nav-label">下一篇 ▶</span>
                  <router-link :to="`/post/${nextPost.id}`" class="nav-title">{{ nextPost.title }}</router-link>
                </div>
                <div class="post-nav-spacer" v-else></div>
              </div>
              <div class="copyright">
                <p>📝 本文采用 <strong>CC BY-NC 4.0</strong> 许可协议</p>
                <p>© 2026 PIXEL·BLOG · 转载请注明出处</p>
              </div>
            </div>
          </PixelBox>
        </main>

        <!-- ====== 右侧：侧边栏 ====== -->
        <Sidebar :content="post.content" />
      </div>
    </template>

    <!-- 未找到文章 -->
    <template v-else>
      <PixelBox class="empty-box">
        <div class="empty-icon">░▒▓█</div>
        <p class="empty-text">未找到该文章</p>
        <button class="pixel-btn" @click="goBack">返回博客列表</button>
      </PixelBox>
    </template>
  </div>
</template>

<style scoped>
.post-detail-page {
  max-width: 1280px;
}

.post-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* ====== 左侧主内容 ====== */
.post-main {
  flex: 1;
  min-width: 0;
}

.article-box {
  padding: 28px 32px;
}

/* ====== 文章头部 ====== */
.article-header {
  padding-bottom: 20px;
  border-bottom: 3px solid var(--color-border);
  margin-bottom: 28px;
}

.article-title {
  font-family: var(--font-body);
  font-size: 26px;
  font-weight: bold;
  color: var(--color-text);
  line-height: 1.4;
  margin-bottom: 12px;
  text-shadow: 2px 2px 0 var(--color-primary);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
  margin-bottom: 10px;
}

.meta-item {
  color: var(--color-text-light);
}

.meta-sep {
  color: var(--color-border-light);
}

.meta-link {
  color: var(--color-primary-light);
  text-decoration: none;
}

.meta-link:hover {
  text-decoration: underline;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.article-tag {
  font-family: var(--font-title);
  font-size: 8px;
  color: var(--color-secondary-light);
  background: rgba(108, 99, 255, 0.15);
  padding: 3px 8px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px var(--color-border-light);
}

.article-summary {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-light);
  line-height: 1.6;
  padding: 12px 16px;
  background: var(--color-bg);
  border-left: 4px solid var(--color-primary);
  border-radius: 2px;
}

/* ====== 正文 Markdown ====== */
.markdown-body {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-text);
}

.markdown-body :deep(.md-heading) {
  font-family: var(--font-body);
  font-weight: bold;
  margin: 28px 0 14px;
  color: var(--color-primary-light);
  scroll-margin-top: 80px;
}

.markdown-body :deep(.md-heading-1) {
  font-size: 22px;
  border-bottom: 2px solid var(--color-border-light);
  padding-bottom: 6px;
}

.markdown-body :deep(.md-heading-2) {
  font-size: 19px;
}

.markdown-body :deep(.md-heading-3) {
  font-size: 17px;
  color: var(--color-text);
}

.markdown-body :deep(p) {
  margin: 12px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 12px 0;
  padding-left: 28px;
}

.markdown-body :deep(li) {
  margin: 6px 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  background: rgba(255, 107, 107, 0.1);
  padding: 10px 16px;
  margin: 16px 0;
  color: var(--color-text-light);
  border-radius: 2px;
}

/* 表格 */
.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  border-radius: 2px;
  overflow: hidden;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid var(--color-border-light);
}

.markdown-body :deep(th) {
  background: var(--color-bg);
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-primary-light);
}

.markdown-body :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.15);
}

/* 图片 */
.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 2px;
  box-shadow: 0 0 0 3px var(--color-border);
  margin: 12px 0;
}

/* 行内代码 */
.markdown-body :deep(code) {
  font-family: var(--font-code);
  background: rgba(255, 107, 107, 0.12);
  color: var(--color-primary-light);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 0.9em;
}

/* 代码块（自定义渲染） */
.markdown-body :deep(.code-block-wrapper) {
  margin: 16px 0;
  background: var(--color-code-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.markdown-body :deep(.code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid var(--color-border-light);
}

.markdown-body :deep(.code-lang-label) {
  font-family: var(--font-title);
  font-size: 8px;
  color: var(--color-primary-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.markdown-body :deep(.code-copy-btn) {
  font-family: var(--font-title);
  font-size: 8px;
  background: transparent;
  color: var(--color-text-light);
  border: 2px solid var(--color-border-light);
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.1s;
}

.markdown-body :deep(.code-copy-btn:hover) {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-light);
}

.markdown-body :deep(.code-block-wrapper pre) {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  background: transparent;
  box-shadow: none;
}

.markdown-body :deep(.code-block-wrapper code) {
  background: transparent;
  color: var(--color-code-text);
  padding: 0;
  font-family: var(--font-code);
  font-size: 16px;
  line-height: 1.5;
}

/* highlight.js 像素风配色 */
.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-built_in) {
  color: #FF6B6B;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-attr) {
  color: #7CFC00;
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-literal) {
  color: #FFD700;
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote) {
  color: #6C63FF;
  font-style: italic;
}

.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-section),
.markdown-body :deep(.hljs-name) {
  color: #FF8E8E;
}

.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-template-variable) {
  color: #FFD700;
}

.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-class .hljs-title) {
  color: #8E86FF;
}

.markdown-body :deep(.hljs-tag) {
  color: #B8B0A4;
}

.markdown-body :deep(.hljs-attribute) {
  color: #FF8E8E;
}

/* 链接 */
.markdown-body :deep(a) {
  color: var(--color-primary-light);
  text-decoration: none;
  border-bottom: 1px dashed var(--color-primary-light);
}

.markdown-body :deep(a:hover) {
  color: var(--color-primary);
  border-bottom-style: solid;
}

/* ====== 文章底部 ====== */
.article-footer {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 3px solid var(--color-border);
}

.post-nav {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.post-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.post-nav-item.next {
  text-align: right;
}

.post-nav-spacer {
  flex: 1;
}

.nav-label {
  font-family: var(--font-title);
  font-size: 8px;
  color: var(--color-text-light);
}

.nav-title {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-primary-light);
  text-decoration: none;
  line-height: 1.3;
}

.nav-title:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.copyright {
  text-align: center;
  padding: 16px;
  background: var(--color-bg);
  border-radius: 2px;
  box-shadow: inset 0 0 0 2px var(--color-border-light);
}

.copyright p {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  margin: 4px 0;
}

/* ====== 空状态 ====== */
.empty-box {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon {
  font-family: var(--font-code);
  font-size: 24px;
  color: var(--color-primary);
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.empty-text {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text-light);
  margin-bottom: 16px;
}

.pixel-btn {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 8px 20px;
  font-family: var(--font-title);
  font-size: 12px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.pixel-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .post-layout {
    flex-direction: column;
  }

  .article-box {
    padding: 20px 16px;
  }

  .article-title {
    font-size: 20px;
  }

  .markdown-body {
    font-size: 15px;
  }

  .post-nav {
    flex-direction: column;
    gap: 12px;
  }

  .post-nav-item.next {
    text-align: left;
  }

  .post-nav-spacer {
    display: none;
  }
}
</style>
