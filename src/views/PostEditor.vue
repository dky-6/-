<script setup>
/**
 * 博客编辑器 [NEW]
 * - 左侧 Markdown 写作区 + 右侧实时预览
 * - 元数据表单：标题、分类、标签、摘要、封面图
 * - 发布后调用 blogStore.addPost，跳转到文章详情
 * - 支持工具栏：粗体/斜体/链接/代码/标题 等快捷插入
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import PixelBox from '../components/PixelBox.vue'
import { useBlogStore } from '../stores/blog.js'

const router = useRouter()
const blogStore = useBlogStore()

// ====== 表单数据 ======
const form = ref({
  title: '',
  category: '前端',
  tags: [],
  description: '',
  cover: '',
  content: ''
})

const tagInput = ref('')
const errorMsg = ref('')
const isPublishing = ref(false)
const fileInputRef = ref(null)

// 预设分类（基于现有数据动态生成 + 通用分类）
const presetCategories = computed(() => {
  const cats = blogStore.categories.filter(c => c !== '全部')
  // 确保基础分类存在
  const base = ['前端', '后端', '运维', '数据库', '设计']
  return [...new Set([...base, ...cats])]
})

// 预设标签（取自现有文章）
const presetTags = computed(() => blogStore.allTags.slice(0, 12))

// ====== Markdown 实时预览 ======
const previewHtml = computed(() => {
  if (!form.value.content.trim()) {
    return '<p class="preview-empty">在左侧输入 Markdown，右侧将实时预览渲染效果 ✨</p>'
  }
  try {
    marked.setOptions({ breaks: true, gfm: true })
    return marked.parse(form.value.content)
  } catch (e) {
    return '<p class="preview-error">Markdown 解析出错</p>'
  }
})

// ====== 字数统计 ======
const wordCount = computed(() => {
  const text = form.value.content.replace(/[#*`>\-\[\]\(\)]/g, '').trim()
  return text ? text.length : 0
})

// ====== 标签管理 ======
function addTag() {
  const tag = tagInput.value.trim().replace(/^#/, '').trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(index) {
  form.value.tags.splice(index, 1)
}

function togglePresetTag(tag) {
  const idx = form.value.tags.indexOf(tag)
  if (idx === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(idx, 1)
  }
}

// 标签输入框回车添加
function onTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && !tagInput.value && form.value.tags.length) {
    form.value.tags.pop()
  }
}

// ====== 封面图上传 ======
function triggerCoverUpload() {
  fileInputRef.value?.click()
}

function handleCoverFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMsg.value = '请上传图片文件'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = '封面图不能超过 2MB'
    return
  }
  errorMsg.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.cover = ev.target.result
  }
  reader.readAsDataURL(file)
  // 清空 input 允许重复选择同一文件
  e.target.value = ''
}

function removeCover() {
  form.value.cover = ''
}

// ====== 工具栏快捷插入 ======
function insertText(before, after = '', placeholder = '') {
  const textarea = document.getElementById('md-textarea')
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.content
  const selected = text.slice(start, end) || placeholder
  const newText = text.slice(0, start) + before + selected + after + text.slice(end)
  form.value.content = newText
  // 恢复光标位置
  requestAnimationFrame(() => {
    textarea.focus()
    const newStart = start + before.length
    textarea.setSelectionRange(newStart, newStart + selected.length)
  })
}

const toolbarButtons = [
  { label: 'H1', action: () => insertText('## ', '', '标题'), title: '二级标题' },
  { label: 'H2', action: () => insertText('### ', '', '小标题'), title: '三级标题' },
  { label: 'B', action: () => insertText('**', '**', '粗体'), title: '粗体' },
  { label: 'I', action: () => insertText('*', '*', '斜体'), title: '斜体' },
  { label: '""', action: () => insertText('> ', '', '引用'), title: '引用' },
  { label: '<>', action: () => insertText('`', '`', 'code'), title: '行内代码' },
  { label: '{}', action: () => insertText('\n```js\n', '\n```\n', '// 代码块'), title: '代码块' },
  { label: '🔗', action: () => insertText('[', '](https://)', '链接文字'), title: '链接' },
  { label: '🖼', action: () => insertText('![', '](https://)', '图片描述'), title: '图片' },
  { label: '•', action: () => insertText('- ', '', '列表项'), title: '无序列表' },
  { label: '1.', action: () => insertText('1. ', '', '列表项'), title: '有序列表' },
  { label: '|—|', action: () => insertText('\n| 列1 | 列2 |\n| --- | --- |\n| 值1 | 值2 |\n', '', ''), title: '表格' }
]

// ====== 插入模板 ======
function insertTemplate() {
  if (form.value.content.trim()) {
    if (!confirm('当前编辑器已有内容，是否覆盖为模板？')) return
  }
  form.value.content = `# 文章标题

在这里写一段引人入胜的开篇介绍，让读者快速了解文章主旨。

## 第一部分

正文内容……

\`\`\`js
// 代码示例
function hello() {
  console.log('Hello, Pixel Blog!')
}
\`\`\`

## 第二部分

| 项目 | 说明 |
| --- | --- |
| A | 描述 A |
| B | 描述 B |

- 要点一
- 要点二
- 要点三

> 引用一段值得回味的话。

## 总结

写到这里就该收尾了。`
}

// ====== 发布 / 保存草稿 ======
function publish() {
  errorMsg.value = ''
  if (!form.value.title.trim()) {
    errorMsg.value = '请输入文章标题'
    return
  }
  if (!form.value.content.trim()) {
    errorMsg.value = '请输入文章内容'
    return
  }
  // 自动从内容生成摘要（如果未填）
  if (!form.value.description.trim()) {
    const plain = form.value.content
      .replace(/^---[\s\S]*?---/, '') // 去 frontmatter
      .replace(/```[\s\S]*?```/g, '') // 去代码块
      .replace(/[#>*`\-\[\]\(\)!]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    form.value.description = plain.slice(0, 120) + (plain.length > 120 ? '...' : '')
  }

  isPublishing.value = true
  try {
    const newPost = blogStore.addPost({
      title: form.value.title,
      category: form.value.category,
      tags: form.value.tags,
      description: form.value.description,
      cover: form.value.cover,
      content: form.value.content
    })
    // 发布成功 → 跳转到文章详情
    router.push(`/post/${newPost.id}`)
  } catch (e) {
    errorMsg.value = '发布失败：' + (e.message || '未知错误')
    isPublishing.value = false
  }
}

function cancel() {
  if (form.value.title.trim() || form.value.content.trim()) {
    if (!confirm('内容未保存，确定要离开吗？')) return
  }
  router.back()
}

// ====== 键盘快捷键：Ctrl/Cmd + S 发布 ======
function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    publish()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="page-container post-editor-page">
    <!-- 顶部操作栏 -->
    <div class="editor-topbar">
      <button class="topbar-btn back-btn" @click="cancel">◀ 返回</button>
      <h1 class="topbar-title">✎ 写博客</h1>
      <div class="topbar-actions">
        <button class="topbar-btn template-btn" @click="insertTemplate">📋 模板</button>
        <button
          class="topbar-btn publish-btn"
          :disabled="isPublishing"
          @click="publish"
        >{{ isPublishing ? '发布中...' : '🚀 发布' }}</button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div class="error-banner" v-if="errorMsg">
      <span class="error-icon">⚠</span>
      <span class="error-text">{{ errorMsg }}</span>
      <button class="error-close" @click="errorMsg = ''">✕</button>
    </div>

    <!-- 元数据表单 -->
    <PixelBox class="meta-form">
      <!-- 标题 -->
      <div class="form-row">
        <label class="form-label">标题 <span class="required">*</span></label>
        <input
          v-model="form.title"
          type="text"
          class="form-input title-input"
          placeholder="为你的文章起个响亮的标题..."
          maxlength="100"
        />
      </div>

      <!-- 分类 + 摘要 -->
      <div class="form-row form-row-double">
        <div class="form-col">
          <label class="form-label">分类</label>
          <select v-model="form.category" class="form-input form-select">
            <option v-for="cat in presetCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-col">
          <label class="form-label">发布日期</label>
          <input
            :value="new Date().toISOString().slice(0, 10)"
            type="text"
            class="form-input"
            disabled
          />
        </div>
      </div>

      <!-- 标签 -->
      <div class="form-row">
        <label class="form-label">标签</label>
        <div class="tags-input-wrapper">
          <div class="tags-list">
            <span
              v-for="(tag, i) in form.tags"
              :key="tag"
              class="tag-chip"
            >
              #{{ tag }}
              <button class="tag-remove" @click="removeTag(i)">✕</button>
            </span>
          </div>
          <input
            v-model="tagInput"
            type="text"
            class="form-input tag-input"
            placeholder="输入标签后回车（最多 5 个）"
            @keydown="onTagKeydown"
            @blur="addTag"
          />
        </div>
        <div class="preset-tags" v-if="presetTags.length">
          <span class="preset-label">推荐：</span>
          <button
            v-for="tag in presetTags"
            :key="tag"
            class="preset-tag"
            :class="{ active: form.tags.includes(tag) }"
            @click="togglePresetTag(tag)"
          >{{ tag }}</button>
        </div>
      </div>

      <!-- 摘要 -->
      <div class="form-row">
        <label class="form-label">摘要</label>
        <textarea
          v-model="form.description"
          class="form-input form-textarea summary-textarea"
          placeholder="一句话介绍文章内容（留空将自动从正文提取）"
          rows="2"
          maxlength="200"
        ></textarea>
      </div>

      <!-- 封面图 -->
      <div class="form-row">
        <label class="form-label">封面图（可选）</label>
        <div class="cover-area">
          <div class="cover-preview" v-if="form.cover">
            <img :src="form.cover" alt="封面预览" class="cover-img" />
            <button class="cover-remove" @click="removeCover">✕ 移除</button>
          </div>
          <button class="cover-upload-btn" v-else @click="triggerCoverUpload">
            <span class="upload-icon">📷</span>
            <span class="upload-text">点击上传封面</span>
            <span class="upload-hint">建议尺寸 1200×630，最大 2MB</span>
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleCoverFile"
          />
        </div>
      </div>
    </PixelBox>

    <!-- Markdown 编辑器：左写作 + 右预览 -->
    <div class="editor-wrapper">
      <!-- 工具栏 -->
      <div class="editor-toolbar">
        <button
          v-for="btn in toolbarButtons"
          :key="btn.label"
          class="toolbar-btn"
          :title="btn.title"
          @click="btn.action"
        >{{ btn.label }}</button>
        <span class="toolbar-info">{{ wordCount }} 字</span>
      </div>

      <div class="editor-split">
        <!-- 左侧：写作区 -->
        <div class="editor-pane editor-pane-left">
          <div class="pane-header">
            <span class="pane-title">📝 写作</span>
            <span class="pane-hint">支持 Markdown 语法 · Ctrl+S 发布</span>
          </div>
          <textarea
            id="md-textarea"
            v-model="form.content"
            class="md-textarea"
            placeholder="# 开始你的故事..."
            spellcheck="false"
          ></textarea>
        </div>

        <!-- 右侧：预览区 -->
        <div class="editor-pane editor-pane-right">
          <div class="pane-header">
            <span class="pane-title">👁 实时预览</span>
          </div>
          <div class="md-preview markdown-body" v-html="previewHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-editor-page {
  max-width: 1280px;
  padding-bottom: 48px;
}

/* ====== 顶部操作栏 ====== */
.editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.topbar-title {
  font-family: var(--font-title);
  font-size: 16px;
  color: var(--color-text);
  text-shadow: 2px 2px 0 var(--color-primary);
  flex: 1;
  text-align: center;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.topbar-btn {
  font-family: var(--font-title);
  font-size: 11px;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 8px 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.topbar-btn:hover {
  transform: translate(1px, 1px);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 1px var(--color-border);
}

.topbar-btn:active {
  transform: translate(2px, 2px);
}

.publish-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.publish-btn:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.publish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ====== 错误提示 ====== */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  padding: 10px 16px;
  margin-bottom: 16px;
  font-family: var(--font-body);
  font-size: 15px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.error-icon {
  font-size: 18px;
}

.error-text {
  flex: 1;
}

.error-close {
  background: transparent;
  border: none;
  color: var(--color-text-inverse);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 8px;
}

/* ====== 元数据表单 ====== */
.meta-form {
  padding: 20px 24px;
  margin-bottom: 20px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row-double {
  display: flex;
  gap: 16px;
}

.form-col {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-text);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.required {
  color: var(--color-primary-dark);
}

.form-input {
  width: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 15px;
  padding: 8px 12px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  transition: none;
}

.form-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.title-input {
  font-size: 18px;
  font-weight: bold;
  padding: 10px 14px;
}

.form-select {
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, var(--color-text) 50%),
                    linear-gradient(135deg, var(--color-text) 50%, transparent 50%);
  background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 32px;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: var(--font-body);
}

/* ====== 标签输入 ====== */
.tags-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 0;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-secondary);
  color: var(--color-text);
  padding: 4px 8px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 2px var(--color-secondary-light);
}

.tag-remove {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  color: var(--color-primary-light);
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-top: 4px;
}

.preset-label {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

.preset-tag {
  font-family: var(--font-title);
  font-size: 8px;
  background: var(--color-bg);
  color: var(--color-text-light);
  padding: 3px 7px;
  border: none;
  box-shadow: inset 0 0 0 1px var(--color-border-light);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.preset-tag:hover {
  background: var(--color-secondary);
  color: var(--color-text);
}

.preset-tag.active {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

/* ====== 封面图 ====== */
.cover-area {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cover-preview {
  position: relative;
  display: inline-block;
}

.cover-img {
  max-width: 320px;
  max-height: 180px;
  display: block;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  object-fit: cover;
}

.cover-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  border: none;
  padding: 4px 8px;
  font-family: var(--font-title);
  font-size: 8px;
  cursor: pointer;
  box-shadow: 0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.cover-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 240px;
  height: 140px;
  background: var(--color-bg);
  border: none;
  cursor: pointer;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  transition: none;
}

.cover-upload-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.upload-icon {
  font-size: 32px;
}

.upload-text {
  font-family: var(--font-title);
  font-size: 10px;
}

.upload-hint {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

.cover-upload-btn:hover .upload-hint {
  color: var(--color-text-inverse);
  opacity: 0.8;
}

/* ====== Markdown 编辑器 ====== */
.editor-wrapper {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg);
  border-bottom: 2px solid var(--color-border);
}

.toolbar-btn {
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-bg-card);
  color: var(--color-text);
  padding: 5px 9px;
  border: none;
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
  min-width: 28px;
}

.toolbar-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

.toolbar-info {
  margin-left: auto;
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

.editor-split {
  display: flex;
  height: 540px;
}

.editor-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--color-bg);
  border-bottom: 2px solid var(--color-border-light);
}

.pane-title {
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-primary-light);
  letter-spacing: 1px;
}

.pane-hint {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

.editor-pane-left {
  border-right: 2px solid var(--color-border);
}

.md-textarea {
  flex: 1;
  width: 100%;
  background: var(--color-bg-card);
  color: var(--color-text);
  border: none;
  outline: none;
  resize: none;
  padding: 16px 20px;
  font-family: var(--font-code);
  font-size: 16px;
  line-height: 1.7;
  tab-size: 2;
}

.md-textarea::placeholder {
  color: var(--color-text-light);
  opacity: 0.6;
}

.md-preview {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text);
  background: var(--color-bg-card);
}

.preview-empty {
  color: var(--color-text-light);
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
}

.preview-error {
  color: var(--color-primary-dark);
  text-align: center;
  padding: 20px;
}

/* Markdown 预览样式 */
.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  font-family: var(--font-body);
  font-weight: bold;
  margin: 20px 0 10px;
  color: var(--color-primary-light);
}

.md-preview :deep(h1) {
  font-size: 22px;
  border-bottom: 2px solid var(--color-border-light);
  padding-bottom: 4px;
}

.md-preview :deep(h2) {
  font-size: 19px;
}

.md-preview :deep(h3) {
  font-size: 17px;
  color: var(--color-text);
}

.md-preview :deep(p) {
  margin: 10px 0;
}

.md-preview :deep(ul),
.md-preview :deep(ol) {
  margin: 10px 0;
  padding-left: 24px;
}

.md-preview :deep(li) {
  margin: 4px 0;
}

.md-preview :deep(code) {
  font-family: var(--font-code);
  background: rgba(255, 107, 107, 0.12);
  color: var(--color-primary-light);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 0.9em;
}

.md-preview :deep(pre) {
  background: var(--color-code-bg);
  color: var(--color-code-text);
  padding: 12px 16px;
  margin: 12px 0;
  overflow-x: auto;
  box-shadow: inset 0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.md-preview :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.md-preview :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  background: rgba(255, 107, 107, 0.1);
  padding: 8px 14px;
  margin: 12px 0;
  color: var(--color-text-light);
  border-radius: 2px;
}

.md-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  border-radius: 2px;
  overflow: hidden;
}

.md-preview :deep(th),
.md-preview :deep(td) {
  padding: 6px 10px;
  border: 1px solid var(--color-border-light);
  text-align: left;
}

.md-preview :deep(th) {
  background: var(--color-bg);
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-primary-light);
}

.md-preview :deep(a) {
  color: var(--color-primary-light);
  text-decoration: none;
  border-bottom: 1px dashed var(--color-primary-light);
}

.md-preview :deep(img) {
  max-width: 100%;
  border-radius: 2px;
  box-shadow: 0 0 0 2px var(--color-border);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .editor-split {
    flex-direction: column;
    height: auto;
  }

  .editor-pane-left {
    border-right: none;
    border-bottom: 2px solid var(--color-border);
  }

  .editor-pane {
    height: 360px;
  }

  .form-row-double {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .topbar-title {
    font-size: 12px;
  }

  .topbar-btn {
    font-size: 9px;
    padding: 6px 10px;
  }

  .meta-form {
    padding: 16px;
  }

  .toolbar-btn {
    font-size: 8px;
    padding: 4px 6px;
    min-width: 24px;
  }
}
</style>
