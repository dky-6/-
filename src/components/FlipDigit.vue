<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true }
})

const current = ref(props.value)
const previous = ref(props.value)
const animating = ref(false)
const phase = ref(0) // 0 idle, 1 top-flipping-out, 2 bottom-flipping-in

let t1 = null
let t2 = null

watch(() => props.value, (newVal, oldVal) => {
  if (newVal === oldVal) return
  previous.value = oldVal
  current.value = newVal
  animating.value = true
  phase.value = 1
  clearTimeout(t1)
  clearTimeout(t2)
  // First half: top flips out
  t1 = setTimeout(() => {
    phase.value = 2
    // Second half: bottom flips in
    t2 = setTimeout(() => {
      animating.value = false
      phase.value = 0
    }, 320)
  }, 320)
})

onUnmounted(() => {
  clearTimeout(t1)
  clearTimeout(t2)
})
</script>

<template>
  <div class="flip-digit">
    <div class="flip-card">
      <!-- Static top (always shows current top half) -->
      <div class="flip-top">
        <span class="digit">{{ current }}</span>
      </div>
      <!-- Static bottom (shows previous bottom half until new bottom flips in) -->
      <div class="flip-bottom">
        <span class="digit">{{ animating && phase === 2 ? current : previous }}</span>
      </div>
      <!-- Animated top: flips out showing previous -->
      <div class="flip-anim-top" :class="{ 'flip-out': animating && phase === 1 }">
        <span class="digit">{{ previous }}</span>
      </div>
      <!-- Animated bottom: flips in showing current -->
      <div class="flip-anim-bottom" :class="{ 'flip-in': animating && phase === 2 }">
        <span class="digit">{{ current }}</span>
      </div>
      <div class="flip-center-line"></div>
    </div>
  </div>
</template>

<style scoped>
.flip-digit {
  display: inline-block;
  width: clamp(18px, 4.5vw, 32px);
  height: clamp(28px, 7vw, 44px);
  perspective: 200px;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.flip-top,
.flip-bottom,
.flip-anim-top,
.flip-anim-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
  overflow: hidden;
  background: var(--color-bg-card);
  display: flex;
  justify-content: center;
  align-items: center;
}

.flip-top {
  top: 0;
  align-items: flex-end;
  border-bottom: 1px solid var(--color-border-light);
  z-index: 2;
}

.flip-top .digit {
  transform: translateY(50%);
}

.flip-bottom {
  bottom: 0;
  align-items: flex-start;
  z-index: 1;
}

.flip-bottom .digit {
  transform: translateY(-50%);
}

.flip-anim-top {
  top: 0;
  transform-origin: bottom center;
  z-index: 4;
  border-bottom: 1px solid var(--color-border-light);
  transform: rotateX(0deg);
  transition: transform 0.32s ease-in;
  backface-visibility: hidden;
  align-items: flex-end;
}

.flip-anim-top .digit {
  transform: translateY(50%);
}

.flip-anim-top.flip-out {
  transform: rotateX(-90deg);
}

.flip-anim-bottom {
  bottom: 0;
  transform-origin: top center;
  z-index: 3;
  transform: rotateX(90deg);
  transition: transform 0.32s ease-out;
  backface-visibility: hidden;
  align-items: flex-start;
}

.flip-anim-bottom .digit {
  transform: translateY(-50%);
}

.flip-anim-bottom.flip-in {
  transform: rotateX(0deg);
}

.flip-center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border-light);
  z-index: 5;
  pointer-events: none;
}

.digit {
  font-family: var(--font-code);
  font-size: clamp(20px, 5vw, 34px);
  font-weight: bold;
  color: var(--color-primary);
  line-height: 1;
  text-shadow: 2px 2px 0 var(--color-bg);
}
</style>
