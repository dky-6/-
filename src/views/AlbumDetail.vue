<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePhotosStore } from '../stores/photos'
import PixelBox from '../components/PixelBox.vue'
import ImageViewer from '../components/ImageViewer.vue'
import UploadPhotoModal from '../components/UploadPhotoModal.vue'
import CreateAlbumModal from '../components/CreateAlbumModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const photosStore = usePhotosStore()

const albumId = computed(() => route.params.id)
const album = computed(() => photosStore.getAlbumById(albumId.value))

// 私密相册密码验证
const showPasswordGate = ref(false)
const passwordInput = ref('')
const passwordVerified = ref(false)
const passwordError = ref('')

// 视图模式
const viewMode = ref('grid') // 'grid' | 'list'

// 弹窗控制
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showDeletePhotoConfirm = ref(false)
const deletingPhotoId = ref(null)

// 图片预览
const viewerShow = ref(false)
const viewerIndex = ref(0)

// Toast
const showToast = ref(false)
const toastMessage = ref('')

// ====== 密码验证 ======
function handleSubmitPassword() {
  if (passwordInput.value === album.value.password) {
    passwordVerified.value = true
    showPasswordGate.value = false
    passwordError.value = ''
  } else {
    passwordError.value = '密码错误，请重试'
  }
}

// ====== 检查私密相册 ======
watch(album, (val) => {
  if (val?.isPrivate && !passwordVerified.value) {
    showPasswordGate.value = true
  }
}, { immediate: true })

// ====== 查看器 ======
function openViewer(index) {
  viewerIndex.value = index
  viewerShow.value = true
}

function closeViewer() {
  viewerShow.value = false
}

function changeViewer(index) {
  viewerIndex.value = index
}

// ====== 上传照片 ======
function handleUploadSubmit(photoDataList) {
  photosStore.addPhotos(albumId.value, photoDataList)
  showToastMessage(`成功添加 ${photoDataList.length} 张照片！`)
}

// ====== 删除照片 ======
function requestDeletePhoto(photoId) {
  deletingPhotoId.value = photoId
  showDeletePhotoConfirm.value = true
}

function confirmDeletePhoto() {
  if (deletingPhotoId.value) {
    photosStore.deletePhoto(albumId.value, deletingPhotoId.value)
    showToastMessage('照片已删除')
  }
  deletingPhotoId.value = null
  showDeletePhotoConfirm.value = false
}

// ====== 评论 ======
function handleAddComment(photoId, text) {
  if (photoId && text) {
    photosStore.addPhotoComment(albumId.value, photoId, text)
  }
}

function handleDeleteComment(photoId, commentId) {
  if (photoId && commentId) {
    photosStore.deletePhotoComment(albumId.value, photoId, commentId)
  }
}

// ====== 编辑相册 ======
function handleEditSubmit(data) {
  photosStore.updateAlbumInfo(albumId.value, data)
  showToastMessage('相册已更新')
}

// ====== 删除相册 ======
function handleDeleteAlbum() {
  showDeleteConfirm.value = true
}

function confirmDeleteAlbum() {
  photosStore.deleteAlbum(albumId.value)
  showDeleteConfirm.value = false
  showToastMessage('相册已删除')
  setTimeout(() => {
    router.push('/photos')
  }, 1000)
}

// ====== 切换视图 ======
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// ====== Toast ======
function showToastMessage(msg) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// ====== 返回 ======
function goBack() {
  router.push('/photos')
}

onMounted(() => {
  if (album.value?.isPrivate && !passwordVerified.value) {
    showPasswordGate.value = true
  }
})
</script>

<template>
  <div class="page-container album-detail">
    <!-- 返回按钮 -->
    <div class="back-bar">
      <button class="pixel-btn back-btn" @click="goBack">◀ 返回相册列表</button>
    </div>

    <!-- 私密相册密码门 -->
    <Teleport to="body">
      <div v-if="showPasswordGate && album?.isPrivate" class="password-gate">
        <div class="password-box">
          <div class="lock-icon">🔒</div>
          <h3>私密相册</h3>
          <p class="lock-desc">此相册为私密相册，请输入密码访问</p>
          <input
            v-model="passwordInput"
            type="password"
            class="pixel-input password-input"
            placeholder="请输入密码"
            @keydown.enter="handleSubmitPassword"
          />
          <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
          <button class="pixel-btn btn-submit" @click="handleSubmitPassword">解锁</button>
          <button class="pixel-btn btn-back" @click="goBack">返回</button>
        </div>
      </div>
    </Teleport>

    <!-- 相册头部 -->
    <template v-if="album && (!album.isPrivate || passwordVerified)">
      <PixelBox class="album-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="album-title">
              {{ album.title }}
              <span v-if="album.isPrivate" class="private-badge">🔒 私密</span>
            </h1>
            <p class="album-desc">{{ album.description }}</p>
            <div class="album-meta">
              <span>📅 创建于 {{ new Date(album.createdAt).toLocaleDateString('zh-CN') }}</span>
              <span>📝 更新于 {{ new Date(album.updatedAt).toLocaleDateString('zh-CN') }}</span>
              <span>🖼️ {{ album.photos.length }} 张照片</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="pixel-btn action-btn" @click="toggleViewMode">
              {{ viewMode === 'grid' ? '☰ 列表' : '▦ 网格' }}
            </button>
            <button class="pixel-btn action-btn" @click="showEditModal = true">✏️ 编辑</button>
            <button class="pixel-btn action-btn btn-danger" @click="handleDeleteAlbum">🗑️ 删除</button>
          </div>
        </div>
      </PixelBox>

      <!-- 照片展示 -->
      <div class="photo-section">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid' && album.photos.length" class="photo-grid">
          <div
            v-for="(photo, idx) in album.photos"
            :key="photo.id"
            class="photo-card"
            @click="openViewer(idx)"
          >
            <div class="photo-thumb">
              <img :src="photo.url" :alt="photo.description" loading="lazy" />
              <div class="photo-overlay">
                <span v-if="photo.tags.length" class="photo-tag">{{ photo.tags[0] }}</span>
                <button class="photo-del" @click.stop="requestDeletePhoto(photo.id)">🗑️</button>
              </div>
            </div>
            <div v-if="photo.description" class="photo-caption">{{ photo.description }}</div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else-if="viewMode === 'list' && album.photos.length" class="photo-list">
          <div
            v-for="(photo, idx) in album.photos"
            :key="photo.id"
            class="photo-list-item"
            @click="openViewer(idx)"
          >
            <div class="list-thumb">
              <img :src="photo.url" :alt="photo.description" loading="lazy" />
            </div>
            <div class="list-info">
              <p v-if="photo.description" class="list-desc">{{ photo.description }}</p>
              <div class="list-meta">
                <span v-if="photo.takenDate" class="list-date">📅 {{ photo.takenDate }}</span>
                <span v-if="photo.tags.length" class="list-tags">
                  <span v-for="tag in photo.tags" :key="tag" class="list-tag">#{{ tag }}</span>
                </span>
                <span class="list-comments">💬 {{ photo.comments.length }}</span>
              </div>
            </div>
            <button class="list-del" @click.stop="requestDeletePhoto(photo.id)">🗑️</button>
          </div>
        </div>

        <!-- 空状态 -->
        <PixelBox v-else class="empty-state">
          <div class="empty-icon">📷</div>
          <p>这个相册还没有照片</p>
          <button class="pixel-btn btn-primary" @click="showUploadModal = true">📷 添加第一张照片</button>
        </PixelBox>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <button class="pixel-btn btn-add-photo" @click="showUploadModal = true">
          📷 添加照片
        </button>
        <span class="photo-count">共 {{ album.photos.length }} 张照片</span>
      </div>
    </template>

    <!-- 相册不存在 -->
    <PixelBox v-else-if="!album" class="not-found">
      <div class="empty-icon">❓</div>
      <p>相册不存在</p>
      <button class="pixel-btn" @click="goBack">返回列表</button>
    </PixelBox>

    <!-- 图片预览灯箱（带元数据） -->
    <ImageViewer
      :show="viewerShow"
      :images="album?.photos || []"
      :index="viewerIndex"
      :showMetadata="true"
      @close="closeViewer"
      @change="changeViewer"
      @add-comment="handleAddComment"
      @delete-comment="handleDeleteComment"
    />

    <!-- 上传照片弹窗 -->
    <UploadPhotoModal
      v-if="album"
      :show="showUploadModal"
      :albumTitle="album.title"
      :albumId="album.id"
      @close="showUploadModal = false"
      @submit="handleUploadSubmit"
    />

    <!-- 编辑相册弹窗 -->
    <CreateAlbumModal
      v-if="album"
      :show="showEditModal"
      mode="edit"
      :album="album"
      @close="showEditModal = false"
      @submit="handleEditSubmit"
    />

    <!-- 删除照片确认 -->
    <ConfirmModal
      :show="showDeletePhotoConfirm"
      title="删除照片"
      message="确定要删除这张照片吗？此操作无法撤销。"
      @cancel="showDeletePhotoConfirm = false"
      @confirm="confirmDeletePhoto"
    />

    <!-- 删除相册确认 -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="删除相册"
      :message="`确定要删除相册「${album?.title}」吗？这将同时删除相册中的所有照片，且无法恢复。`"
      :danger="true"
      @cancel="showDeleteConfirm = false"
      @confirm="confirmDeleteAlbum"
    />

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="showToast" class="pixel-toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.album-detail {
  max-width: 1000px;
}

/* ====== 返回按钮 ====== */
.back-bar {
  margin-bottom: 16px;
}

.back-btn {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 10px 20px;
  background: var(--color-bg-card);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  cursor: pointer;
}

.back-btn:hover {
  transform: translate(1px, 1px);
  background: var(--color-bg-hover);
}

/* ====== 密码门 ====== */
.password-gate {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.password-box {
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 4px var(--color-border);
  padding: 32px 24px;
  text-align: center;
  max-width: 360px;
  width: 100%;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.password-box h3 {
  font-family: var(--font-title);
  font-size: 16px;
  color: var(--color-text);
  margin: 0 0 8px;
}

.lock-desc {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0 0 16px;
}

.password-input {
  width: 100%;
  padding: 12px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 14px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border),
    0 0 0 2px var(--color-border);
  outline: none;
  margin-bottom: 8px;
}

.password-input:focus {
  box-shadow:
    inset 0 0 0 2px var(--color-primary),
    0 0 0 2px var(--color-border);
}

.password-error {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-secondary);
  margin: 0 0 12px;
}

.btn-submit,
.btn-back {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  margin: 4px;
}

.btn-submit {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 2px var(--color-border);
}

.btn-back {
  background: var(--color-bg-card);
  color: var(--color-text);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
}

/* ====== 相册头部 ====== */
.album-header {
  margin-bottom: 20px;
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.header-info {
  flex: 1;
  min-width: 200px;
}

.album-title {
  font-family: var(--font-title);
  font-size: 20px;
  color: var(--color-text);
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.private-badge {
  font-family: var(--font-code);
  font-size: 10px;
  background: var(--color-bg);
  padding: 2px 6px;
  box-shadow: inset 0 0 0 2px var(--color-border);
}

.album-desc {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0 0 12px;
  line-height: 1.5;
}

.album-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  font-family: var(--font-title);
  font-size: 11px;
  padding: 8px 14px;
  background: var(--color-bg-card);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
}

.action-btn:hover {
  transform: translate(1px, 1px);
  background: var(--color-bg-hover);
}

.action-btn.btn-danger {
  color: var(--color-secondary);
}

.action-btn.btn-danger:hover {
  background: rgba(255, 0, 0, 0.1);
}

/* ====== 照片网格 ====== */
.photo-section {
  margin-bottom: 60px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.photo-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.photo-card:hover {
  transform: translateY(-3px);
}

.photo-thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 3px var(--color-border),
    0 0 0 3px var(--color-border);
  background: var(--color-bg);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
  image-rendering: pixelated;
}

.photo-card:hover .photo-thumb img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.15s;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-tag {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  padding: 2px 6px;
}

.photo-del {
  width: 28px;
  height: 28px;
  background: var(--color-bg-card);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.photo-del:hover {
  background: var(--color-secondary);
}

.photo-caption {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text);
  margin: 8px 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ====== 列表视图 ====== */
.photo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-list-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  cursor: pointer;
  transition: transform 0.15s;
  align-items: center;
}

.photo-list-item:hover {
  transform: translateX(4px);
}

.list-thumb {
  width: 100px;
  height: 75px;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: inset 0 0 0 2px var(--color-border);
}

.list-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-desc {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--color-text-light);
  align-items: center;
}

.list-tag {
  background: var(--color-bg);
  padding: 1px 5px;
  color: var(--color-primary);
}

.list-del {
  width: 36px;
  height: 36px;
  background: var(--color-bg-card);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.15s;
}

.photo-list-item:hover .list-del {
  opacity: 1;
}

.list-del:hover {
  background: var(--color-secondary);
}

/* ====== 空状态 ====== */
.empty-state,
.not-found {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p,
.not-found p {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 16px;
}

.btn-primary {
  font-family: var(--font-title);
  font-size: 12px;
  padding: 12px 28px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 3px var(--color-border);
  cursor: pointer;
}

.btn-primary:hover {
  transform: translate(1px, 1px);
}

/* ====== 底部操作栏 ====== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  box-shadow: 0 -3px 0 var(--color-border);
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  z-index: 100;
}

.btn-add-photo {
  font-family: var(--font-title);
  font-size: 13px;
  padding: 12px 28px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-dark),
    0 0 0 3px var(--color-border);
  cursor: pointer;
}

.btn-add-photo:hover {
  transform: translate(1px, 1px);
}

.photo-count {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text-light);
}

/* ====== Toast ====== */
.pixel-toast {
  position: fixed;
  bottom: 80px;
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
@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
  }
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .photo-list-item {
    flex-direction: column;
    align-items: stretch;
  }
  .list-thumb {
    width: 100%;
    height: 160px;
  }
  .bottom-bar {
    flex-direction: column;
    gap: 8px;
  }
}

/* ====== 主题透明 ====== */
.theme-transparent .photo-thumb,
.theme-transparent .photo-list-item {
  background: rgba(255, 255, 255, 0.1);
}
</style>
