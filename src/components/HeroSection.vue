<script setup>
/**
 * HeroSection - 首页英雄区
 * 全屏展示品牌形象、中英文轮流打字机动画、滚动引导
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  brandName: { type: String, default: 'PIXEL·BLOG' }
})

const emit = defineEmits(['scroll-down'])

const displayedChars = ref([])
const showCursor = ref(false)
const containerVisible = ref(false)
const heroRef = ref(null)

// 中英文欢迎语轮流切换
const texts = ['欢迎', 'Welcome']
let textIndex = 0
let charIndex = 0

let typewriterTimer = null
let waitTimer = null

// 容器淡入后开始打字
function startAnimation() {
  setTimeout(() => {
    containerVisible.value = true
    setTimeout(() => {
      startTypewriter()
    }, 500)
  }, 500)
}

function startTypewriter() {
  showCursor.value = true
  const currentText = texts[textIndex]
  charIndex = 0
  displayedChars.value = []
  typeNext(currentText)
}

function typeNext(currentText) {
  if (charIndex < currentText.length) {
    displayedChars.value.push({
      char: currentText[charIndex],
      id: `${textIndex}-${charIndex}`
    })
    charIndex++
    typewriterTimer = setTimeout(() => typeNext(currentText), 100)
  } else {
    // 打字完成，等待 5-8 秒后切换到下一种语言
    const waitTime = 5000 + Math.random() * 3000
    waitTimer = setTimeout(() => {
      textIndex = (textIndex + 1) % texts.length
      startTypewriter()
    }, waitTime)
  }
}

function handleScrollDown() {
  emit('scroll-down')
}

function onWheel(e) {
  if (e.deltaY > 30) {
    e.preventDefault()
    handleScrollDown()
  }
}

onMounted(() => {
  startAnimation()
  window.addEventListener('wheel', onWheel, { passive: false })
})

onBeforeUnmount(() => {
  clearTimeout(typewriterTimer)
  clearTimeout(waitTimer)
  window.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <section ref="heroRef" class="hero-section">
    <!-- 像素星星装饰 -->
    <div class="pixel-stars">
      <span v-for="i in 20" :key="i" class="star" :style="{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 2 + 's'
      }">✦</span>
    </div>

    <!-- 品牌标识 -->
    <div class="hero-content">
      <div class="brand-block">
        <!-- 像素 Logo 装饰 -->
        <div class="pixel-logo">
          <div class="logo-grid">
            <span v-for="i in 16" :key="i" class="pixel" :class="{
              active: [1,2,4,5,7,8,9,11,12,14,15].includes(i)
            }"></span>
          </div>
        </div>

        <h1 class="brand-name">{{ brandName }}</h1>

        <!-- iPhone 开机风格打字机 -->
        <div
          class="tagline-wrapper"
          :class="{ 'container-visible': containerVisible }"
        >
          <span
            v-for="item in displayedChars"
            :key="item.id"
            class="tagline-char"
          >{{ item.char }}</span>
          <span
            v-if="showCursor"
            class="tagline-cursor"
            :class="{ blink: showCursor }"
          ></span>
        </div>

        <p class="hero-subtitle">全栈开发者 · 像素爱好者</p>
      </div>
    </div>

    <!-- 滚动引导 -->
    <button class="scroll-indicator" @click="handleScrollDown" aria-label="向下滚动">
      <span class="scroll-text">探索</span>
      <span class="scroll-arrow">▼</span>
    </button>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-bg);
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 107, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(108, 99, 255, 0.1) 0%, transparent 50%);
}

/* ====== 像素星星 ====== */
.pixel-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  font-size: 14px;
  color: var(--color-primary);
  opacity: 0.5;
  animation: twinkle 3s ease-in-out infinite;
}

.star:nth-child(odd) {
  color: var(--color-secondary);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* ====== 品牌内容 ====== */
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 20px;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 像素 Logo */
.pixel-logo {
  margin-bottom: 8px;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(4, 12px);
  grid-template-rows: repeat(4, 12px);
  gap: 2px;
}

.pixel {
  width: 12px;
  height: 12px;
  background: transparent;
}

.pixel.active {
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary-light);
}

/* 品牌名称 */
.brand-name {
  font-family: var(--font-title);
  font-size: clamp(28px, 6vw, 48px);
  color: var(--color-text);
  letter-spacing: 4px;
  text-shadow:
    4px 4px 0 var(--color-primary),
    -2px -2px 0 var(--color-secondary);
  margin: 0;
}

/* ====== iPhone 开机风格打字机 ====== */
.tagline-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 36px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.tagline-wrapper.container-visible {
  opacity: 1;
  transform: translateY(0);
}

.tagline-char {
  display: inline-block;
  font-family: var(--font-body);
  font-size: clamp(18px, 3vw, 26px);
  color: var(--color-text-light);
  letter-spacing: 2px;
  opacity: 0;
  transform: translateY(4px);
  animation: char-appear 0.18s ease forwards;
}

@keyframes char-appear {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 像素方块光标 */
.tagline-cursor {
  display: inline-block;
  width: 10px;
  height: 1em;
  background: var(--color-primary);
  margin-left: 2px;
  animation: cursor-blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 副标题 */
.hero-subtitle {
  font-family: var(--font-code);
  font-size: 18px;
  color: var(--color-text-light);
  margin: 0;
  letter-spacing: 3px;
}

/* ====== 滚动指示器 ====== */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  font-family: var(--font-title);
  font-size: 10px;
  padding: 8px 16px;
  transition: color 0.2s;
  animation: bounce 2s ease-in-out infinite;
}

.scroll-indicator:hover {
  color: var(--color-primary);
}

.scroll-text {
  letter-spacing: 2px;
}

.scroll-arrow {
  font-size: 16px;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

/* ====== 透明主题适配 ====== */
.theme-transparent .hero-section {
  background: transparent;
}

.theme-transparent .brand-name {
  /* [FIX] */ color: #FFFFFF;
  text-shadow:
    3px 3px 0 rgba(0, 0, 0, 0.5), /* [FIX] */
    -2px -2px 0 rgba(255, 107, 107, 0.6);
}

.theme-transparent .tagline-char {
  /* [FIX] */ color: #E0E0E0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .tagline-cursor {
  /* [FIX] */ background: #FFFFFF;
}

.theme-transparent .hero-subtitle {
  /* [FIX] */ color: #CCCCCC;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .scroll-indicator {
  /* [FIX] */ color: #E0E0E0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* [FIX] */
}

.theme-transparent .pixel.active {
  background: #FF6B6B;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .hero-section {
    min-height: 500px;
  }

  .logo-grid {
    grid-template-columns: repeat(4, 10px);
    grid-template-rows: repeat(4, 10px);
    gap: 2px;
  }

  .pixel {
    width: 10px;
    height: 10px;
  }

  .brand-block {
    gap: 16px;
  }

  .scroll-indicator {
    bottom: 24px;
  }
}
</style>
