<script setup>
/**
 * 像素按钮组件
 * 用法：<PixelButton @click="...">点击</PixelButton>
 *      <PixelButton to="/about">跳转</PixelButton>  -> 渲染为 router-link
 *      <PixelButton href="https://...">外链</PixelButton>
 */
defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' } // primary | secondary
})
</script>

<template>
  <router-link
    v-if="to"
    :to="to"
    class="pixel-btn"
    :class="{ 'pixel-btn-secondary': variant === 'secondary' }"
  >
    <slot />
  </router-link>
  <a
    v-else-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="pixel-btn"
    :class="{ 'pixel-btn-secondary': variant === 'secondary' }"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    class="pixel-btn"
    :class="{ 'pixel-btn-secondary': variant === 'secondary' }"
  >
    <slot />
  </button>
</template>

<style scoped>
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
  transition: none;
  text-decoration: none;
  line-height: 1.4;
}

.pixel-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  color: var(--color-text-inverse);
}

.pixel-btn:active {
  transform: translate(3px, 3px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

.pixel-btn-secondary {
  background: var(--color-secondary);
  box-shadow:
    inset 0 0 0 2px var(--color-secondary-light),
    0 0 0 3px var(--color-border);
}

.pixel-btn-secondary:hover {
  box-shadow:
    inset 0 0 0 2px var(--color-secondary-light),
    0 0 0 2px var(--color-border);
}
</style>
