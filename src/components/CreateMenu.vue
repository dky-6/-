<script setup>
/**
 * 创作菜单（浮动按钮 FAB）
 * - 固定在页面右下角
 * - 点击展开像素风菜单：写文档 / 发说说 / 传照片
 * - 点击菜单外区域自动关闭
 * - 跳转目标页时携带 ?action=create，由目标页自动触发对应创建流程
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const open = ref(false)
const rootRef = ref(null)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

// 点击外部关闭
function handleOutsideClick(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    open.value = false
  }
}

// ESC 关闭
function handleKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick)
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('keydown', handleKeydown)
})

// 跳转到对应页面，并携带 action=create
const menuItems = [
  { key: 'doc', icon: '📝', label: '写文档', desc: '新建博客文章', path: '/docs' },
  { key: 'tweet', icon: '💬', label: '发说说', desc: '发布新鲜事', path: '/tweets' },
  { key: 'photo', icon: '📸', label: '传照片', desc: '创建相册或上传', path: '/photos' }
]

function go(item) {
  router.push({ path: item.path, query: { action: 'create' } })
  open.value = false
}
</script>

<template>
  <div class="create-menu" ref="rootRef">
    <!-- 菜单面板 -->
    <Transition name="menu-pop">
      <div v-if="open" class="menu-panel">
        <div
          v-for="(item, idx) in menuItems"
          :key="item.key"
          class="menu-item"
          :style="{ '--item-delay': idx * 0.06 + 's' }"
          @click="go(item)"
        >
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-text">
            <span class="item-label">{{ item.label }}</span>
            <span class="item-desc">{{ item.desc }}</span>
          </span>
          <span class="item-arrow">▶</span>
        </div>
      </div>
    </Transition>

    <!-- 创作按钮 -->
    <button class="fab" :class="{ open }" @click="toggle" aria-label="创作">
      <span class="fab-icon">{{ open ? '✕' : '✏️' }}</span>
      <span class="fab-label">{{ open ? '关闭' : '创作' }}</span>
    </button>
  </div>
</template>

<style scoped>
.create-menu {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

/* ====== 创作按钮 ====== */
.fab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    4px 4px 0 var(--color-border);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.fab:hover {
  background: var(--color-primary-hover);
}

.fab:active {
  transform: translate(4px, 4px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 var(--color-border);
}

.fab.open {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    4px 4px 0 var(--color-border);
}

.fab-icon {
  font-size: 16px;
  line-height: 1;
}

/* ====== 菜单面板 ====== */
.menu-panel {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border),
    6px 6px 0 var(--color-border);
  padding: 8px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 2px var(--color-border-light);
  transition: background 0.12s ease, transform 0.06s ease;
}

.menu-item:hover {
  background: var(--color-primary-dark);
  transform: translateX(2px);
}

.menu-item:hover .item-label,
.menu-item:hover .item-desc,
.menu-item:hover .item-arrow {
  color: var(--color-text-inverse);
}

.menu-item:hover .item-desc {
  opacity: 0.8;
}

.item-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.item-label {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text);
}

.item-desc {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1;
}

.item-arrow {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

/* ====== 展开动画 ====== */
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.menu-pop-enter-active .menu-item,
.menu-pop-leave-active .menu-item {
  transition: opacity 0.18s ease var(--item-delay, 0s), transform 0.18s ease var(--item-delay, 0s);
}

.menu-pop-enter-from .menu-item,
.menu-pop-leave-to .menu-item {
  opacity: 0;
  transform: translateX(20px);
}

/* ====== 透明主题适配 ====== */
.theme-transparent .fab {
  background: rgba(255, 107, 107, 0.85);
}

.theme-transparent .fab.open {
  background: rgba(58, 55, 80, 0.7);
}

.theme-transparent .menu-panel {
  background: rgba(58, 55, 80, 0.78);
  backdrop-filter: blur(4px);
}

.theme-transparent .menu-item {
  background: rgba(0, 0, 0, 0.25);
}

.theme-transparent .item-label {
  /* [FIX] */ color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .item-desc {
  /* [FIX] */ color: #E0E0E0;
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .create-menu {
    right: 16px;
    bottom: 16px;
  }

  .fab {
    padding: 12px 16px;
    font-size: 11px;
  }

  .menu-panel {
    min-width: 200px;
  }
}
</style>
