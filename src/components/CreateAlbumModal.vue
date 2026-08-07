<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  album: { type: Object, default: null }
})

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const description = ref('')
const isPrivate = ref(false)
const password = ref('')

// 编辑模式：预填充
watch(() => props.show, (val) => {
  if (val && props.mode === 'edit' && props.album) {
    title.value = props.album.title
    description.value = props.album.description
    isPrivate.value = props.album.isPrivate || false
    password.value = props.album.password || ''
  } else if (val && props.mode === 'create') {
    title.value = ''
    description.value = ''
    isPrivate.value = false
    password.value = ''
  }
})

const canSubmit = computed(() => title.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    isPrivate: isPrivate.value,
    password: isPrivate.value ? password.value : ''
  })
  handleClose()
}

function handleClose() {
  emit('close')
}

function onKey(e) {
  if (e.key === 'Escape') handleClose()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-box" @click.stop>
          <!-- 标题 -->
          <div class="modal-header">
            <h3>{{ mode === 'edit' ? '✏️ 编辑相册' : '📁 创建新相册' }}</h3>
            <button class="close-btn" @click="handleClose">✕</button>
          </div>

          <!-- 表单 -->
          <div class="modal-body">
            <!-- 相册名称 -->
            <div class="form-group">
              <label>相册名称 *</label>
              <input
                v-model="title"
                type="text"
                class="pixel-input"
                placeholder="输入相册名称"
                maxlength="50"
              />
              <span class="input-count">{{ title.length }}/50</span>
            </div>

            <!-- 相册描述 -->
            <div class="form-group">
              <label>相册描述</label>
              <textarea
                v-model="description"
                class="pixel-textarea"
                placeholder="简单描述这个相册"
                rows="3"
              ></textarea>
            </div>

            <!-- 私密设置 -->
            <div class="form-group form-checkbox">
              <label class="checkbox-label">
                <input
                  v-model="isPrivate"
                  type="checkbox"
                  class="pixel-checkbox"
                />
                <span class="checkbox-box"></span>
                设为私密相册 🔒
              </label>
            </div>

            <!-- 密码（私密时显示） -->
            <div v-if="isPrivate" class="form-group">
              <label>访问密码 *</label>
              <input
                v-model="password"
                type="password"
                class="pixel-input"
                placeholder="设置访问密码"
              />
            </div>
          </div>

          <!-- 按钮 -->
          <div class="modal-footer">
            <button class="pixel-btn btn-cancel" @click="handleClose">取消</button>
            <button
              class="pixel-btn btn-submit"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              {{ mode === 'edit' ? '保存' : '创建' }}
            </button>
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
  max-width: 480px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

/* ====== 输入框 ====== */
.pixel-input,
.pixel-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  outline: none;
  transition: box-shadow 0.15s;
  resize: vertical;
}

.pixel-input:focus,
.pixel-textarea:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.input-count {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-light);
  text-align: right;
}

/* ====== Checkbox ====== */
.form-checkbox {
  flex-direction: row !important;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  margin: 0 !important;
}

.pixel-checkbox {
  display: none;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  display: inline-block;
  position: relative;
}

.pixel-checkbox:checked + .checkbox-box::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  font-size: 16px;
  font-family: var(--font-title);
  color: var(--color-primary);
}

/* ====== Footer ====== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: var(--color-bg);
  border-top: 3px solid var(--color-border);
}

.pixel-btn {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 10px 24px;
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

/* ====== 主题透明 ====== */
.theme-transparent .modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
</style>
