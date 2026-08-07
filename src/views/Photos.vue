<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePhotosStore } from '../stores/photos'
import PixelBox from '../components/PixelBox.vue'
import CreateAlbumModal from '../components/CreateAlbumModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const photosStore = usePhotosStore()

// 排序
const sortBy = ref('newest') // 'newest' | 'photos' | 'updated'

// 弹窗控制
const showCreateModal = ref(false)
const showDeleteConfirm = ref(false)
const deletingAlbumId = ref(null)

// 监听 ?action=create 自动打开创建相册弹窗
watch(
  () => route.query.action,
  (action) => {
    if (action === 'create') {
      showCreateModal.value = true
      router.replace({ query: { ...route.query, action: undefined } })
    }
  },
  { immediate: true }
)

// Toast
const showToast = ref(false)
const toastMessage = ref('')

// ====== 排序逻辑 ======
const displayedAlbums = computed(() => {
  const sorted = [...photosStore.albums]
  switch (sortBy.value) {
    case 'photos':
      return sorted.sort((a, b) => b.photos.length - a.photos.length)
    case 'updated':
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

// ====== 打开相册 ======
function openAlbum(albumId) {
  router.push(`/photos/${albumId}`)
}

// ====== 创建相册 ======
function handleCreate(data) {
  photosStore.createAlbum(data.title, data.description, data.isPrivate, data.password)
  showToastMessage('相册创建成功！')
}

// ====== 删除相册 ======
function requestDelete(albumId) {
  deletingAlbumId.value = albumId
  showDeleteConfirm.value = true
}

// 获取删除相册标题
const deletingAlbumTitle = computed(() => {
  if (!deletingAlbumId.value) return ''
  const album = photosStore.albums.find(a => a.id === deletingAlbumId.value)
  return album?.title || ''
})

function confirmDelete() {
  if (deletingAlbumId.value) {
    photosStore.deleteAlbum(deletingAlbumId.value)
    showToastMessage('相册已删除')
  }
  deletingAlbumId.value = null
  showDeleteConfirm.value = false
}

// ====== Toast ======
function showToastMessage(msg) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<template>
  <div class="page-container photos">
    <h1 class="page-title">▶ 照片集</h1>

    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="stats-info">
        <span class="stat-item">📸 共 <span class="stat-val">{{ photosStore.albumCount }}</span> 个相册</span>
        <span class="stat-divider">·</span>
        <span class="stat-item">🖼️ <span class="stat-val">{{ photosStore.photoCount }}</span> 张照片</span>
      </div>

      <div class="top-actions">
        <!-- 排序下拉 -->
        <select v-model="sortBy" class="sort-select">
          <option value="newest">最新创建</option>
          <option value="photos">最多照片</option>
          <option value="updated">最近更新</option>
        </select>

        <!-- 创建按钮 -->
        <button class="pixel-btn create-btn" @click="showCreateModal = true">
          ＋ 创建相册
        </button>
      </div>
    </div>

    <!-- 相册网格 -->
    <div v-if="displayedAlbums.length" class="album-grid">
      <div
        v-for="album in displayedAlbums"
        :key="album.id"
        class="album-card"
        @click="openAlbum(album.id)"
      >
        <!-- 封面 -->
        <div class="album-cover">
          <img :src="album.cover" :alt="album.title" loading="lazy" />
          <div class="album-overlay">
            <span class="view-btn">查看相册 ▶</span>
          </div>
          <span v-if="album.isPrivate" class="private-tag">🔒 私密</span>
        </div>

        <!-- 信息 -->
        <div class="album-info">
          <h3 class="album-name">{{ album.title }}</h3>
          <p v-if="album.description" class="album-desc">{{ album.description }}</p>
          <div class="album-meta">
            <span class="photo-count">🖼️ {{ album.photos.length }} 张</span>
            <button
              class="delete-btn"
              @click.stop="requestDelete(album.id)"
              title="删除相册"
            >🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <PixelBox v-else class="empty-state">
      <div class="empty-icon">📂</div>
      <p>还没有相册，点击上方按钮创建第一个吧！</p>
      <button class="pixel-btn create-btn" @click="showCreateModal = true">
        ＋ 创建相册
      </button>
    </PixelBox>

    <!-- 创建相册弹窗 -->
    <CreateAlbumModal
      :show="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleCreate"
    />

    <!-- 删除确认弹窗 -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="删除相册"
      :message="`确定要删除相册「${deletingAlbumTitle}」吗？这将同时删除相册中的所有照片。`"
      :danger="true"
      @cancel="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="showToast" class="pixel-toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.photos {
  max-width: 1100px;
}

/* ====== 顶部操作栏 ====== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.stats-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text);
}

.stat-val {
  font-family: var(--font-title);
  font-size: 15px;
  color: var(--color-primary);
}

.stat-divider {
  color: var(--color-text-light);
}

.top-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 排序下拉 */
.sort-select {
  font-family: var(--font-code);
  font-size: 13px;
  padding: 8px 12px;
  background: var(--color-bg-card);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

/* 创建按钮 */
.create-btn {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 3px var(--color-border);
  cursor: pointer;
  transition: transform 0.1s;
}

.create-btn:hover {
  transform: translate(1px, 1px);
  background: var(--color-primary-hover);
}

/* ====== 相册网格 ====== */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.album-card {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.album-card:hover {
  transform: translateY(-4px);
}

/* 封面 */
.album-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--color-bg);
  box-shadow: inset 0 -3px 0 var(--color-border);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s;
  image-rendering: pixelated;
}

.album-card:hover .album-cover img {
  transform: scale(1.08);
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.view-btn {
  font-family: var(--font-title);
  font-size: 13px;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  padding: 10px 20px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 3px var(--color-border);
}

.private-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-family: var(--font-code);
  font-size: 11px;
  background: var(--color-bg-card);
  color: var(--color-text);
  padding: 4px 8px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
}

/* 信息 */
.album-info {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.album-name {
  font-family: var(--font-title);
  font-size: 16px;
  color: var(--color-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-desc {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 33px;
}

.album-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.photo-count {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

.delete-btn {
  width: 28px;
  height: 28px;
  background: var(--color-bg-card);
  color: var(--color-text-light);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s;
}

.album-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  color: var(--color-secondary);
}

/* ====== 空状态 ====== */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.empty-state p {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 20px;
}

/* ====== Toast ====== */
.pixel-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-family: var(--font-title);
  font-size: 13px;
  padding: 12px 24px;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  z-index: 200;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .top-actions {
    justify-content: space-between;
  }
  .album-grid {
    grid-template-columns: 1fr;
  }
}

/* ====== 主题透明 ====== */
.theme-transparent .album-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

.theme-transparent .album-cover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
