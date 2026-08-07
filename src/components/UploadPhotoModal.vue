<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  albumTitle: { type: String, default: '' },
  albumId: { type: String, default: '' }
})

const emit = defineEmits(['close', 'submit'])

const MAX_FILES = 9

const files = ref([]) // { id, url, file, description, tags, takenDate }
const dragOver = ref(false)
const fileInputRef = ref(null)

let fileIdCounter = 0

// 初始化
watch(() => props.show, (val) => {
  if (val) {
    files.value = []
    fileIdCounter = 0
  }
})

const canSubmit = computed(() => files.value.length > 0)

// 处理文件选择
function handleFileChange(e) {
  const selectedFiles = Array.from(e.target.files)
  addFiles(selectedFiles)
  e.target.value = ''
}

// 拖拽
function handleDragOver(e) {
  e.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  dragOver.value = false
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

// 添加文件
function addFiles(newFiles) {
  const remaining = MAX_FILES - files.value.length
  const toAdd = newFiles.slice(0, remaining)

  for (const file of toAdd) {
    if (!file.type.startsWith('image/')) continue
    const url = URL.createObjectURL(file)
    files.value.push({
      id: `file-${++fileIdCounter}`,
      url,
      file,
      description: '',
      tags: '',
      takenDate: new Date().toISOString().slice(0, 10)
    })
  }
}

// 移除文件
function removeFile(id) {
  const idx = files.value.findIndex(f => f.id === id)
  if (idx !== -1) {
    URL.revokeObjectURL(files.value[idx].url)
    files.value.splice(idx, 1)
  }
}

// 标签转为数组
function parseTags(tagStr) {
  if (!tagStr) return []
  return tagStr.split(/[,，]/).map(t => t.trim()).filter(Boolean)
}

// 提交
function handleSubmit() {
  if (!canSubmit.value) return
  const photoDataList = files.value.map(f => ({
    url: f.url,
    description: f.description,
    tags: parseTags(f.tags),
    takenDate: f.takenDate
  }))
  emit('submit', photoDataList)
  handleClose()
}

function handleClose() {
  // 清理 URL
  files.value.forEach(f => URL.revokeObjectURL(f.url))
  files.value = []
  emit('close')
}

function triggerFileInput() {
  fileInputRef.value?.click()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-box" @click.stop>
          <!-- 标题 -->
          <div class="modal-header">
            <h3>📷 添加照片到「{{ albumTitle }}」</h3>
            <button class="close-btn" @click="handleClose">✕</button>
          </div>

          <!-- 主体 -->
          <div class="modal-body">
            <!-- 上传区域 -->
            <div
              class="upload-zone"
              :class="{ 'drag-over': dragOver }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              @click="triggerFileInput"
            >
              <div class="upload-icon">📁</div>
              <p class="upload-text">点击选择图片 或 拖拽到此处</p>
              <p class="upload-hint">支持多选，最多 {{ MAX_FILES }} 张</p>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                class="file-hidden"
                @change="handleFileChange"
              />
            </div>

            <!-- 预览列表 -->
            <div v-if="files.length" class="preview-list">
              <div
                v-for="(file, idx) in files"
                :key="file.id"
                class="preview-item"
              >
                <!-- 缩略图 -->
                <div class="preview-thumb">
                  <img :src="file.url" alt="预览" />
                  <button class="remove-btn" @click="removeFile(file.id)">×</button>
                  <span class="thumb-index">{{ idx + 1 }}</span>
                </div>

                <!-- 表单 -->
                <div class="preview-form">
                  <div class="form-row">
                    <input
                      v-model="file.description"
                      type="text"
                      class="pixel-input"
                      placeholder="照片描述..."
                    />
                  </div>
                  <div class="form-row-row">
                    <div class="form-row-row-item">
                      <span class="row-label">日期</span>
                      <input
                        v-model="file.takenDate"
                        type="date"
                        class="pixel-input pixel-input-sm"
                      />
                    </div>
                    <div class="form-row-row-item">
                      <span class="row-label">标签</span>
                      <input
                        v-model="file.tags"
                        type="text"
                        class="pixel-input pixel-input-sm"
                        placeholder="旅行,日落"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="modal-footer">
            <span class="file-count">已选 {{ files.length }} 张</span>
            <div class="btn-group">
              <button class="pixel-btn btn-cancel" @click="handleClose">取消</button>
              <button
                class="pixel-btn btn-submit"
                :disabled="!canSubmit"
                @click="handleSubmit"
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-box {
  width: 100%;
  max-width: 600px;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

/* ====== Header ====== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg);
  border-bottom: 3px solid var(--color-border);
}

.modal-header h3 {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 14px;
  font-family: var(--font-title);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--color-secondary);
  color: var(--color-text-inverse);
}

/* ====== Body ====== */
.modal-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====== 上传区域 ====== */
.upload-zone {
  border: 3px dashed var(--color-border);
  background: var(--color-bg);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}

.upload-zone:hover,
.drag-over {
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-text {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  margin: 0 0 4px;
}

.upload-hint {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
  margin: 0;
}

.file-hidden {
  display: none;
}

/* ====== 预览列表 ====== */
.preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
}

.preview-thumb {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 2px var(--color-border);
  overflow: hidden;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.thumb-index {
  position: absolute;
  bottom: 2px;
  left: 2px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-title);
  font-size: 10px;
  padding: 1px 4px;
}

.remove-btn {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  background: var(--color-secondary);
  color: var(--color-text-inverse);
  font-size: 12px;
  font-family: var(--font-title);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 2px var(--color-border);
}

.remove-btn:hover {
  background: var(--color-secondary-hover);
}

/* ====== 预览表单 ====== */
.preview-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-row {
  width: 100%;
}

.form-row-row {
  display: flex;
  gap: 8px;
}

.form-row-row-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.row-label {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-light);
  white-space: nowrap;
}

/* ====== 输入框 ====== */
.pixel-input {
  width: 100%;
  padding: 6px 10px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 13px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 1px var(--color-border);
  outline: none;
  transition: box-shadow 0.15s;
}

.pixel-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 1px var(--color-border);
}

.pixel-input-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* ====== Footer ====== */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--color-bg);
  border-top: 3px solid var(--color-border);
}

.file-count {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

.btn-group {
  display: flex;
  gap: 12px;
}

.pixel-btn {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 8px 20px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
}

.pixel-btn:hover:not(:disabled) {
  transform: translate(1px, 1px);
}

.pixel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--color-bg-card);
  color: var(--color-text);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
}

.btn-cancel:hover {
  background: var(--color-bg-hover);
}

.btn-submit {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 2px var(--color-border);
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

/* ====== 动画 ====== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.15s;
}

.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: translateY(-20px);
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .preview-item {
    flex-direction: column;
  }
  .preview-thumb {
    width: 100%;
    height: 160px;
  }
  .form-row-row {
    flex-direction: column;
  }
  .form-row-row-item {
    flex-direction: row;
  }
}

/* ====== 主题透明 ====== */
.theme-transparent .modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
</style>
