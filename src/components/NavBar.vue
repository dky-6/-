<script setup>
import { useRoute } from 'vue-router'

const emit = defineEmits(['open-settings'])

const route = useRoute()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/blog', label: '博客' }, // [NEW] 新增博客导航项
  { path: '/docs', label: '文档' },
  { path: '/tweets', label: '说说' },
  { path: '/photos', label: '照片集' },
  { path: '/about', label: '关于' }
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  // [NEW] /post/:id 属于博客模块，激活博客导航
  if (path === '/blog') {
    return route.path.startsWith('/blog') || route.path.startsWith('/post')
  }
  return route.path.startsWith(path)
}

function openSettings() {
  emit('open-settings')
}
</script>

<template>
  <header class="navbar nav-bar">
    <div class="nav-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">▣</span>
        <span class="logo-text">PIXEL·BLOG</span>
      </router-link>
      <nav class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <button class="settings-btn" @click="openSettings" title="主题设置">
        ⚙️
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-text);
}

.logo-icon {
  color: var(--color-primary-dark);
  font-size: 20px;
}

.logo-text {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text);
}

.nav-menu {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-item {
  font-family: var(--font-title);
  font-size: 13px;
  color: var(--color-text-light);
  padding: 6px 12px;
  text-decoration: none;
  border-radius: 2px;
  transition: none;
}

.nav-item:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.nav-item.active {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

/* 设置按钮 */
.settings-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  font-size: 18px;
  flex-shrink: 0;
}

.settings-btn:hover {
  background: var(--color-secondary);
  transform: translate(1px, 1px);
}

.settings-btn:active {
  transform: translate(2px, 2px);
}

@media (max-width: 600px) {
  .nav-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .nav-menu {
    width: 100%;
    justify-content: flex-start;
  }
  .nav-item {
    font-size: 11px;
    padding: 5px 8px;
  }
}
</style>

<!-- ====== 英雄区透明模式（body.hero-visible） ====== -->
<style>
body.hero-visible .navbar.nav-bar {
  background: transparent;
  box-shadow: none;
  border-bottom: none;
  transition: background 0.3s, box-shadow 0.3s;
}

body.hero-visible .navbar.nav-bar .logo-text {
  color: var(--color-text);
  text-shadow: 2px 2px 0 var(--color-primary);
}

body.hero-visible .navbar.nav-bar .logo-icon {
  color: var(--color-primary);
}

body.hero-visible .navbar.nav-bar .nav-item {
  color: var(--color-text-light);
}

body.hero-visible .navbar.nav-bar .nav-item:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

body.hero-visible .navbar.nav-bar .settings-btn {
  background: var(--color-primary);
}

/* 透明主题 + 英雄区 */
:root.theme-transparent body.hero-visible .navbar.nav-bar {
  background: rgba(255, 255, 255, calc(var(--glass-opacity, 0.15) + 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

:root.theme-transparent body.hero-visible .navbar.nav-bar .logo-text,
:root.theme-transparent body.hero-visible .navbar.nav-bar .nav-item {
  color: #FFFFFF;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
</style>
