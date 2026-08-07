<script setup>
/**
 * 像素风确认弹窗组件（可复用）
 * 用法：<ConfirmModal v-if="show" title="标题" message="内容" @confirm="..." @cancel="..." />
 */
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false } // 是否为危险操作（红色按钮）
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="pixel-fade">
      <div v-if="show" class="confirm-overlay" @click.self="emit('cancel')">
        <div class="confirm-modal">
          <!-- 标题栏 -->
          <div class="confirm-header">
            <span class="confirm-icon">{{ danger ? '⚠️' : '🤔' }}</span>
            <h3 class="confirm-title">{{ title }}</h3>
          </div>

          <!-- 内容区 -->
          <div class="confirm-body">
            <p class="confirm-message">{{ message }}</p>
          </div>

          <!-- 按钮区 -->
          <div class="confirm-footer">
            <button
              class="confirm-btn confirm-btn-cancel"
              @click="emit('cancel')"
            >{{ cancelText }}</button>
            <button
              class="confirm-btn"
              :class="danger ? 'confirm-btn-danger' : 'confirm-btn-primary'"
              @click="emit('confirm')"
            >{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.confirm-modal {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  border-radius: 2px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
}

/* ====== 头部 ====== */
.confirm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 2px solid var(--color-border-light);
  background: var(--color-bg);
}

.confirm-icon {
  font-size: 20px;
}

.confirm-title {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
}

/* ====== 内容 ====== */
.confirm-body {
  padding: 24px 20px;
  text-align: center;
}

.confirm-message {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.6;
}

/* ====== 按钮 ====== */
.confirm-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 2px solid var(--color-border-light);
  background: var(--color-bg);
}

.confirm-btn {
  flex: 1;
  font-family: var(--font-title);
  font-size: 10px;
  padding: 10px 16px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.confirm-btn:hover {
  transform: translate(2px, 2px);
}

.confirm-btn-cancel {
  background: var(--color-border-light);
  color: var(--color-text);
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 3px var(--color-border);
}

.confirm-btn-cancel:hover {
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 1px var(--color-border);
}

.confirm-btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
}

.confirm-btn-primary:hover {
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

.confirm-btn-danger {
  background: #c0392b;
  color: #fff;
  box-shadow:
    inset 0 0 0 2px #e74c3c,
    0 0 0 3px var(--color-border);
}

.confirm-btn-danger:hover {
  box-shadow:
    inset 0 0 0 2px #e74c3c,
    0 0 0 1px var(--color-border);
}

/* ====== 过渡动画 ====== */
.pixel-fade-enter-active,
.pixel-fade-leave-active {
  transition: opacity 0.15s ease;
}

.pixel-fade-enter-active .confirm-modal,
.pixel-fade-leave-active .confirm-modal {
  animation: pixel-pop 0.15s ease;
}

@keyframes pixel-pop {
  0% {
    transform: scale(0.9) translate(-2px, -2px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
}

.pixel-fade-enter-from,
.pixel-fade-leave-to {
  opacity: 0;
}

/* ====== 透明主题 ====== */
:deep(.theme-transparent) .confirm-overlay {
  background: rgba(0, 0, 0, 0.5);
}

:deep(.theme-transparent) .confirm-modal {
  background: rgba(255, 255, 255, calc(var(--glass-opacity, 0.15) + 0.8));
  border: 1px solid rgba(255, 255, 255, 0.5);
}

:deep(.theme-transparent) .confirm-header,
:deep(.theme-transparent) .confirm-footer {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.theme-transparent) .confirm-title,
:deep(.theme-transparent) .confirm-message {
  /* [FIX] 背景接近不透明白色，保持深色文字 */
  color: #1a1a1a;
  text-shadow: none;
}
</style>
