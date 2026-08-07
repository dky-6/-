<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  interval: {
    type: Number,
    default: 3000
  }
})

const albums = ref([])
const currentAlbumIndex = ref(0)
const currentImageIndex = ref(0)
const isTransitioning = ref(false)
let timer = null

const currentAlbum = computed(() => albums.value[currentAlbumIndex.value])

const currentImage = computed(() => {
  if (!currentAlbum.value) return ''
  return currentAlbum.value.images[currentImageIndex.value]
})

onMounted(() => {
  // 使用 Vite import.meta.glob 加载 albums.json
  const modules = import.meta.glob('../content/photos/albums.json', { eager: true, query: '?raw', import: 'default' })
  for (const path in modules) {
    try {
      albums.value = JSON.parse(modules[path])
    } catch (e) {
      albums.value = []
    }
  }

  if (albums.value.length > 0) {
    timer = setInterval(nextImage, props.interval)
  }
})

function nextImage() {
  isTransitioning.value = true
  setTimeout(() => {
    if (!currentAlbum.value) return
    if (currentImageIndex.value < currentAlbum.value.images.length - 1) {
      currentImageIndex.value++
    } else {
      currentImageIndex.value = 0
      if (currentAlbumIndex.value < albums.value.length - 1) {
        currentAlbumIndex.value++
      } else {
        currentAlbumIndex.value = 0
      }
    }
    isTransitioning.value = false
  }, 400)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="mini-album">
    <div class="album-header">
      <span class="album-title">📷 相册</span>
      <span v-if="currentAlbum" class="album-name">{{ currentAlbum.name }}</span>
    </div>

    <div class="album-frame">
      <div class="album-image-wrapper" :class="{ transitioning: isTransitioning }">
        <img
          v-if="currentImage"
          :src="currentImage"
          :alt="currentAlbum?.name"
          class="album-image"
        />
        <div v-else class="album-placeholder">
          <span>🖼️</span>
        </div>
      </div>
    </div>

    <div class="album-footer">
      <span v-if="currentAlbum" class="image-counter">
        {{ currentImageIndex + 1 }} / {{ currentAlbum.images.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.mini-album {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-border);
  flex-shrink: 0;
}

.album-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  font-weight: bold;
}

.album-name {
  font-family: var(--font-code);
  font-size: 10px;
  color: var(--color-text-light);
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-frame {
  width: 100%;
  flex: 1;
  min-height: 0;
  border: 3px solid var(--color-border);
  background: var(--color-bg);
  padding: 4px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.album-image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: opacity 0.4s ease;
}

.album-image-wrapper.transitioning {
  opacity: 0;
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  image-rendering: pixelated;
}

.album-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--color-text-light);
  background: rgba(255, 107, 107, 0.08);
}

.album-footer {
  display: flex;
  justify-content: center;
  margin-top: 4px;
  flex-shrink: 0;
}

.image-counter {
  font-family: var(--font-code);
  font-size: 10px;
  color: var(--color-text-light);
}
</style>
