<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-text">© {{ year }} PIXEL·BLOG · Made with ♥ in pixel world</p>
      <p class="footer-sub">POWERED BY VUE 3 + VITE</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 20px;
  text-align: center;
}

.footer-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
}

.footer-sub {
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-text-light);
  margin-top: 6px;
  opacity: 0.7;
}
</style>
