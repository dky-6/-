<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import FlipDigit from './FlipDigit.vue'

const { clockStyle } = useTheme()

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 500)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function pad(n) {
  return String(n).padStart(2, '0')
}

const hoursTens = computed(() => Math.floor(now.value.getHours() / 10))
const hoursUnits = computed(() => now.value.getHours() % 10)
const minsTens = computed(() => Math.floor(now.value.getMinutes() / 10))
const minsUnits = computed(() => now.value.getMinutes() % 10)
const secsTens = computed(() => Math.floor(now.value.getSeconds() / 10))
const secsUnits = computed(() => now.value.getSeconds() % 10)

const digitalDate = computed(() => {
  const d = now.value
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} 星期${week[d.getDay()]}`
})

const hourDeg = computed(() => {
  const d = now.value
  return (d.getHours() % 12) * 30 + d.getMinutes() * 0.5
})
const minuteDeg = computed(() => {
  const d = now.value
  return d.getMinutes() * 6 + d.getSeconds() * 0.1
})
const secondDeg = computed(() => {
  const d = now.value
  return d.getSeconds() * 6
})

const ticks = Array.from({ length: 12 }, (_, i) => i)
</script>

<template>
  <div class="clock-widget">
    <!-- 模拟时钟 -->
    <div v-if="clockStyle === 'analog'" class="analog-clock">
      <div class="clock-face">
        <div
          v-for="n in ticks"
          :key="n"
          class="tick"
          :style="{ transform: `rotate(${n * 30}deg)` }"
        >
          <span class="tick-mark" :class="{ major: n % 3 === 0 }"></span>
        </div>
        <span class="clock-number" style="top: 6px; left: 50%; transform: translateX(-50%);">12</span>
        <span class="clock-number" style="right: 8px; top: 50%; transform: translateY(-50%);">3</span>
        <span class="clock-number" style="bottom: 6px; left: 50%; transform: translateX(-50%);">6</span>
        <span class="clock-number" style="left: 8px; top: 50%; transform: translateY(-50%);">9</span>
        <div class="hand hour-hand" :style="{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }"></div>
        <div class="hand minute-hand" :style="{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }"></div>
        <div class="hand second-hand" :style="{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }"></div>
        <div class="center-dot"></div>
      </div>
    </div>

    <!-- 数字时钟（翻页动画） -->
    <div v-else class="digital-clock">
      <div class="flip-row">
        <FlipDigit :value="hoursTens" />
        <FlipDigit :value="hoursUnits" />
        <span class="flip-separator">:</span>
        <FlipDigit :value="minsTens" />
        <FlipDigit :value="minsUnits" />
        <span class="flip-separator">:</span>
        <FlipDigit :value="secsTens" />
        <FlipDigit :value="secsUnits" />
      </div>
      <div class="digital-date">{{ digitalDate }}</div>
    </div>
  </div>
</template>

<style scoped>
.clock-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ====== 模拟时钟 ====== */
.analog-clock {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.clock-face {
  position: relative;
  width: calc(100% - 16px);
  max-width: 140px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 2px 8px rgba(0, 0,0,0.2);
}

.tick {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform-origin: center;
  pointer-events: none;
}

.tick-mark {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: var(--color-text-light);
}

.tick-mark.major {
  height: 10px;
  width: 3px;
  background: var(--color-text);
}

.clock-number {
  position: absolute;
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text);
  font-weight: bold;
}

.hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: bottom center;
  border-radius: 2px;
}

.hour-hand {
  width: 4px;
  height: 28%;
  background: var(--color-text);
}

.minute-hand {
  width: 3px;
  height: 38%;
  background: var(--color-text);
}

.second-hand {
  width: 2px;
  height: 44%;
  background: var(--color-primary);
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text);
  border: 2px solid var(--color-bg);
}

/* ====== 数字时钟（翻页） ====== */
.digital-clock {
  text-align: center;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 10px;
}

.flip-row {
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: center;
}

.flip-separator {
  font-family: var(--font-code);
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  color: var(--color-primary);
  text-shadow: 2px 2px 0 var(--color-bg);
  animation: colon-blink 1s step-end infinite;
  line-height: 1;
}

@keyframes colon-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.4; }
}

.digital-date {
  font-family: var(--font-body);
  font-size: clamp(11px, 2vw, 14px);
  color: var(--color-text-light);
}
</style>
