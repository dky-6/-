<script setup>
/**
 * CodeBlock - 像素风代码块组件 [NEW]
 * 带语言标签 + 复制按钮
 */
import { ref } from 'vue'

const props = defineProps({
  code: { type: String, required: true },
  lang: { type: String, default: '' }
})

const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = props.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ lang || 'code' }}</span>
      <button class="copy-btn" @click="copyCode">
        {{ copied ? '✓ 已复制' : '复制' }}
      </button>
    </div>
    <pre><code :class="lang ? `language-${lang}` : ''"><slot /></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  margin: 16px 0;
  background: var(--color-code-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid var(--color-border-light);
}

.code-lang {
  font-family: var(--font-title);
  font-size: 8px;
  color: var(--color-primary-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.copy-btn {
  font-family: var(--font-title);
  font-size: 8px;
  background: transparent;
  color: var(--color-text-light);
  border: 2px solid var(--color-border-light);
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.1s;
}

.copy-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-light);
}

pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
}

code {
  font-family: var(--font-code);
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-code-text);
}
</style>
