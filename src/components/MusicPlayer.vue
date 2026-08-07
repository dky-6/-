<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// ====== 播放列表配置 ======
const playlist = [
  { title: '孤独患者', artist: '陈奕迅', src: '/music/song1.mp3' },
  { title: '想念是会呼吸的痛', artist: '梁静茹', src: '/music/song2.mp3' },
  { title: '林俊杰', artist: '林俊杰', src: '/music/song3.mp3' },
  { title: '随机曲目', artist: '未知', src: '/music/song4.mp3' }
]

// ====== 响应式状态 ======
const audioRef = ref(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playToken = ref(0)

// ====== 计算属性 ======
const currentTrack = computed(() => playlist[currentIndex.value])

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const formattedTime = computed(() => {
  const m = Math.floor(currentTime.value / 60)
  const s = Math.floor(currentTime.value % 60)
  return `${m}:${String(s).padStart(2, '0')}`
})

const formattedDuration = computed(() => {
  const m = Math.floor(duration.value / 60)
  const s = Math.floor(duration.value % 60)
  return `${m}:${String(s).padStart(2, '0')}`
})

// ====== 核心方法 ======
function stopAndReset() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
}

async function play() {
  const token = ++playToken.value
  isLoading.value = true
  try {
    await audioRef.value.play()
    if (token === playToken.value) {
      isPlaying.value = true
      isLoading.value = false
    }
  } catch (err) {
    if (token === playToken.value) {
      isPlaying.value = false
      isLoading.value = false
    }
  }
}

function pause() {
  playToken.value++
  if (audioRef.value) {
    audioRef.value.pause()
  }
  isPlaying.value = false
}

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function nextTrack() {
  playToken.value++
  stopAndReset()
  currentIndex.value = (currentIndex.value + 1) % playlist.length
}

function prevTrack() {
  playToken.value++
  stopAndReset()
  currentIndex.value = (currentIndex.value - 1 + playlist.length) % playlist.length
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

function onEnded() {
  nextTrack()
}

function onError() {
  isPlaying.value = false
  isLoading.value = false
}

function seek(e) {
  if (!audioRef.value || duration.value === 0) return
  const rect = e.target.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  audioRef.value.currentTime = ratio * duration.value
}

watch(currentIndex, async () => {
  currentTime.value = 0
  duration.value = 0
  isPlaying.value = false
  await nextTick()
  if (audioRef.value) {
    audioRef.value.load()
    setTimeout(() => {
      play()
    }, 200)
  }
})

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.load()
  }
})

onUnmounted(() => {
  playToken.value++
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<template>
  <div class="vinyl-player">
    <audio
      ref="audioRef"
      :src="currentTrack.src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @error="onError"
    />

    <!-- 黑胶唱片 -->
    <div class="vinyl-disc" :class="{ spinning: isPlaying }">
      <div class="vinyl-grooves"></div>
      <div class="vinyl-label">
        <span class="vinyl-icon">🎵</span>
      </div>
      <div class="vinyl-center"></div>
    </div>

    <!-- 唱臂 -->
    <div class="tonearm" :class="{ playing: isPlaying }">
      <div class="tonearm-base"></div>
      <div class="tonearm-rod"></div>
      <div class="tonearm-head"></div>
    </div>

    <!-- 歌曲信息 -->
    <div class="track-info">
      <div class="track-title">{{ currentTrack.title }}</div>
      <div class="track-artist">{{ currentTrack.artist }}</div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar" @click="seek">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- 时间 -->
    <div class="time-row">
      <span>{{ formattedTime }}</span>
      <span class="time-sep">/</span>
      <span>{{ formattedDuration }}</span>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button class="ctrl-btn" @click="prevTrack" title="上一曲">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <rect x="4" y="5" width="3" height="14" fill="currentColor"/>
          <polygon points="20,5 10,12 20,19" fill="currentColor"/>
        </svg>
      </button>
      <button class="ctrl-btn play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="isPlaying" viewBox="0 0 24 24" width="20" height="20">
          <rect x="6" y="5" width="4" height="14" fill="currentColor"/>
          <rect x="14" y="5" width="4" height="14" fill="currentColor"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20">
          <polygon points="6,4 20,12 6,20" fill="currentColor"/>
        </svg>
      </button>
      <button class="ctrl-btn" @click="nextTrack" title="下一曲">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <polygon points="4,5 14,12 4,19" fill="currentColor"/>
          <rect x="17" y="5" width="3" height="14" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.vinyl-player {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 4px;
  position: relative;
  overflow: hidden;
}

/* 黑胶唱片 */
.vinyl-disc {
  width: clamp(80px, 40%, 110px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: radial-gradient(circle, #2a2a2a 0%, #1a1a1a 60%, #0d0d0d 100%);
  position: relative;
  box-shadow:
    0 0 0 4px var(--color-border),
    0 0 0 6px var(--color-primary-dark),
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    0 4px 12px rgba(0, 0, 0, 0.3);
  animation: spin 4s linear infinite;
  animation-play-state: paused;
}

.vinyl-disc.spinning {
  animation-play-state: running;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-grooves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    transparent 0px,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 3px
  );
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 38%;
  height: 38%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.vinyl-icon {
  font-size: 14px;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #333;
  box-shadow: 0 0 0 2px #555;
}

/* 唱臂 */
.tonearm {
  position: absolute;
  top: 4px;
  right: calc(50% - clamp(40px, 20%, 55px));
  width: 36px;
  height: 46px;
  transform-origin: top right;
  transform: rotate(-25deg);
  transition: transform 0.5s ease;
  z-index: 10;
  pointer-events: none;
}

.tonearm.playing {
  transform: rotate(0deg);
}

.tonearm-base {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary-dark);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

.tonearm-rod {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-text-light) 0%, var(--color-text) 100%);
  border-radius: 2px;
  transform-origin: right center;
  transform: rotate(30deg);
}

.tonearm-head {
  position: absolute;
  top: 20px;
  left: 2px;
  width: 7px;
  height: 10px;
  background: var(--color-text);
  border-radius: 0 0 2px 2px;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.3);
}

/* 歌曲信息 */
.track-info {
  text-align: center;
  width: 100%;
  margin-top: 2px;
}

.track-title {
  font-family: var(--font-title);
  font-size: 11px;
  font-weight: bold;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-light);
  margin-top: 2px;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 5px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 1px var(--color-border);
  border-radius: 1px;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.1s linear;
}

/* 时间 */
.time-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  font-family: var(--font-code);
  font-size: 10px;
  color: var(--color-text-light);
}

.time-sep {
  opacity: 0.5;
}

/* 控制按钮 */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ctrl-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 1px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.ctrl-btn:hover {
  background: var(--color-primary-light);
}

.play-btn {
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.play-btn:hover {
  background: var(--color-primary-light);
}
</style>
