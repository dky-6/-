<script setup>
/**
 * 像素边框卡片组件
 * 用法：<PixelBox>内容</PixelBox>
 */
</script>

<template>
  <div class="pixel-box">
    <slot />
  </div>
</template>

<style scoped>
.pixel-box {
  background: var(--color-bg-card);
  padding: 20px 24px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
}
</style>
