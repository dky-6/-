<script setup>
/**
 * 文档上传弹窗组件
 * - 拖拽 / 点击上传 .md 文件
 * - 自动从 Markdown 提取标题（# 一级标题）和描述（第一段）
 * - 表单：标题、分类、标签、描述、日期
 * - 上传成功后关闭弹窗并通知父组件
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDocsStore } from '../stores/docs.js'
import { parseMarkdown } from '../utils/markdown.js'

const emit = defineEmits(['close', 'uploaded'])

const docsStore = useDocsStore()

const form = ref({
  title: '',
  category: '前端',
  tags: [],
  description: '',
  date: new Date().toISOString().slice(0, 10),
  content: ''
})

const tagInput = ref('')
const isDragging = ref(false)
const errorMsg = ref('')
const fileInputRef = ref(null)

const categories = ['前端', '后端', '设计']
const presetTags = ['Vue3', 'CSS', 'JavaScript', 'SpringBoot', 'Java', 'Node.js', 'MySQL', '设计', '像素风', '构建']

// 处理文件读取
function handleFile(file) {
  errorMsg.value = ''
  if (!file) return
  if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
    errorMsg.value = '请上传 .md 格式的文件'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const raw = e.target.result
    form.value.content = raw

    // 使用现有工具解析 frontmatter
    const { frontmatter, body } = parseMarkdown(raw)

    // 自动提取标题：优先 frontmatter -> # 一级标题 -> 文件名
    if (frontmatter.title) {
      form.value.title = frontmatter.title
    } else {
      const h1Match = body.match(/^#\s+(.+)$/m)
      form.value.title = h1Match ? h1Match[1].trim() : file.name.replace(/\.md$|\.markdown$/i, '')
    }

    // 自动提取分类
    if (frontmatter.category && categories.includes(frontmatter.category)) {
      form.value.category = frontmatter.category
    }

    // 自动提取日期
    if (frontmatter.date) {
      form.value.date = frontmatter.date
    }

    // 自动提取描述：第一段非标题非空行的文本
    const lines = body.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))
    const firstPara = lines.find(l => !l.startsWith('```') && !l.startsWith('|') && !l.startsWith('>'))
    form.value.description = firstPara ? firstPara.trim().slice(0, 120) : ''
  }
  reader.readAsText(file)
}

// 拖拽事件
function onDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  handleFile(file)
}

// 点击上传
function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e) {
  handleFile(e.target.files[0])
}

// 标签处理
function addTag(tag) {
  const t = tag.trim()
  if (t && !form.value.tags.includes(t)) {
    form.value.tags.push(t)
  }
  tagInput.value = ''
}

function removeTag(idx) {
  form.value.tags.splice(idx, 1)
}

function onTagInputKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    if (tagInput.value.trim()) addTag(tagInput.value)
  }
}

function togglePresetTag(tag) {
  const idx = form.value.tags.indexOf(tag)
  if (idx === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(idx, 1)
  }
}

// 提交
function handleSubmit() {
  errorMsg.value = ''
  if (!form.value.title.trim()) {
    errorMsg.value = '请填写标题'
    return
  }
  if (!form.value.content.trim()) {
    errorMsg.value = '请上传 Markdown 文件'
    return
  }

  const newDoc = docsStore.addDocument({
    title: form.value.title,
    category: form.value.category,
    tags: form.value.tags,
    description: form.value.description,
    date: form.value.date,
    content: form.value.content
  })

  emit('uploaded', newDoc)
  emit('close')
}

// ESC 关闭
function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- 头部 -->
      <div class="modal-header">
        <h2 class="modal-title">▶ 上传文档</h2>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <!-- 拖拽区 -->
      <div
        class="drop-zone"
        :class="{ dragging: isDragging }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".md,.markdown"
          class="file-hidden"
          @change="onFileChange"
        />
        <div class="drop-icon">📄</div>
        <p class="drop-text" v-if="!form.title">拖拽 .md 文件到此处，或点击选择</p>
        <p class="drop-text" v-else>✅ {{ form.title }}.md 已加载</p>
      </div>

      <!-- 表单 -->
      <div class="form-body">
        <!-- 标题 -->
        <div class="form-row">
          <label class="form-label">标题</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="文档标题"
          />
        </div>

        <!-- 分类 -->
        <div class="form-row">
          <label class="form-label">分类</label>
          <div class="category-picker">
            <button
              v-for="cat in categories"
              :key="cat"
              class="cat-pick-btn"
              :class="{ active: form.category === cat }"
              @click="form.category = cat"
            >{{ cat }}</button>
          </div>
        </div>

        <!-- 标签 -->
        <div class="form-row">
          <label class="form-label">标签</label>
          <div class="tags-display" v-if="form.tags.length">
            <span
              v-for="(tag, idx) in form.tags"
              :key="idx"
              class="tag-chip"
            >
              {{ tag }}
              <button class="tag-remove" @click="removeTag(idx)">✕</button>
            </span>
          </div>
          <input
            v-model="tagInput"
            type="text"
            class="form-input"
            placeholder="输入标签后按回车添加"
            @keydown="onTagInputKeydown"
          />
          <div class="preset-tags">
            <button
              v-for="tag in presetTags"
              :key="tag"
              class="preset-tag"
              :class="{ selected: form.tags.includes(tag) }"
              @click="togglePresetTag(tag)"
            >{{ tag }}</button>
          </div>
        </div>

        <!-- 描述 -->
        <div class="form-row">
          <label class="form-label">描述</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            rows="2"
            placeholder="文档简介"
          ></textarea>
        </div>

        <!-- 日期 -->
        <div class="form-row">
          <label class="form-label">日期</label>
          <input
            v-model="form.date"
            type="date"
            class="form-input"
          />
        </div>

        <!-- 错误提示 -->
        <p v-if="errorMsg" class="error-msg">⚠ {{ errorMsg }}</p>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <button class="modal-btn modal-btn-cancel" @click="$emit('close')">取消</button>
        <button class="modal-btn modal-btn-submit" @click="handleSubmit">上传</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  border-radius: 2px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ====== 头部 ====== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid var(--color-border-light);
}

.modal-title {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
}

.modal-close {
  background: var(--color-border-light);
  border: none;
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 2px;
}

.modal-close:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
}

/* ====== 拖拽区 ====== */
.drop-zone {
  margin: 16px 20px;
  padding: 28px 20px;
  text-align: center;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.1s;
}

.drop-zone.dragging {
  background: var(--color-primary-dark);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.drop-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.drop-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
}

.file-hidden {
  display: none;
}

/* ====== 表单 ====== */
.form-body {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-primary-light);
}

.form-input,
.form-textarea {
  background: var(--color-bg);
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 15px;
  padding: 8px 12px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-text-light);
  opacity: 0.5;
}

/* ====== 分类选择 ====== */
.category-picker {
  display: flex;
  gap: 8px;
}

.cat-pick-btn {
  font-family: var(--font-title);
  font-size: 9px;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 6px 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.cat-pick-btn.active {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

/* ====== 标签 ====== */
.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 13px;
  background: var(--color-secondary);
  color: var(--color-text-inverse);
  padding: 3px 8px;
  border-radius: 2px;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--color-text-inverse);
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}

.tag-remove:hover {
  opacity: 1;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.preset-tag {
  font-family: var(--font-body);
  font-size: 12px;
  background: var(--color-bg);
  color: var(--color-text-light);
  padding: 2px 8px;
  border: none;
  box-shadow: inset 0 0 0 1px var(--color-border-light);
  border-radius: 2px;
  cursor: pointer;
}

.preset-tag.selected {
  background: var(--color-secondary-light);
  color: var(--color-text-inverse);
}

/* ====== 错误提示 ====== */
.error-msg {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-primary-light);
}

/* ====== 底部按钮 ====== */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  margin-top: 8px;
  border-top: 2px solid var(--color-border-light);
}

.modal-btn {
  font-family: var(--font-title);
  font-size: 11px;
  padding: 8px 20px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.modal-btn-cancel {
  background: var(--color-border-light);
  color: var(--color-text);
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
}

.modal-btn-cancel:hover {
  background: var(--color-bg);
}

.modal-btn-submit {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.modal-btn-submit:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

/* ====== 响应式 ====== */
@media (max-width: 500px) {
  .modal-content {
    max-height: 95vh;
  }
  .form-input,
  .form-textarea {
    font-size: 14px;
  }
}
</style>
