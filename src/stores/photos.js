import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ====== 随机评论头像 ====== */
const avatarPool = ['👾', '🎮', '💻', '🎨', '⚡', '🔥', '🌟', '🚀', '💎', '🌈']

/* ====== 3 个示例相册 ====== */
const sampleAlbums = [
  {
    id: 'album-1',
    title: '像素风景',
    description: '记录旅途中的像素风风景，用镜头捕捉大自然的美好瞬间。',
    cover: 'https://picsum.photos/seed/pixel-landscape/600/400',
    photos: [
      {
        id: 'photo-1-1',
        url: 'https://picsum.photos/seed/pixel-1/800/600',
        description: '日落时分的山脉',
        tags: ['风景', '日落', '山脉'],
        takenDate: '2026-07-15',
        comments: [
          { id: 'cmt-1', avatar: '🌟', username: '像素旅人', text: '太美了！', time: '2026-07-16' }
        ]
      },
      {
        id: 'photo-1-2',
        url: 'https://picsum.photos/seed/pixel-2/800/600',
        description: '晨雾中的森林小径',
        tags: ['森林', '晨雾'],
        takenDate: '2026-07-18',
        comments: []
      },
      {
        id: 'photo-1-3',
        url: 'https://picsum.photos/seed/pixel-3/800/600',
        description: '星空下的小镇',
        tags: ['星空', '夜景', '小镇'],
        takenDate: '2026-07-22',
        comments: []
      },
      {
        id: 'photo-1-4',
        url: 'https://picsum.photos/seed/pixel-4/800/600',
        description: '海边的像素小屋',
        tags: ['海边', '建筑'],
        takenDate: '2026-07-25',
        comments: []
      }
    ],
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-25T14:30:00',
    isPrivate: false,
    password: ''
  },
  {
    id: 'album-2',
    title: '美食探索',
    description: '收集各地美食的像素风照片，记录味蕾上的惊喜。',
    cover: 'https://picsum.photos/seed/pixel-food/600/400',
    photos: [
      {
        id: 'photo-2-1',
        url: 'https://picsum.photos/seed/food-1/800/600',
        description: '日式拉面',
        tags: ['日式', '拉面'],
        takenDate: '2026-08-01',
        comments: []
      },
      {
        id: 'photo-2-2',
        url: 'https://picsum.photos/seed/food-2/800/600',
        description: '像素风汉堡',
        tags: ['西式', '汉堡'],
        takenDate: '2026-08-03',
        comments: [
          { id: 'cmt-2', avatar: '🍔', username: '吃货', text: '看起来好好吃！', time: '2026-08-03' }
        ]
      },
      {
        id: 'photo-2-3',
        url: 'https://picsum.photos/seed/food-3/800/600',
        description: '精致寿司拼盘',
        tags: ['日式', '寿司'],
        takenDate: '2026-08-05',
        comments: []
      }
    ],
    createdAt: '2026-07-20T10:00:00',
    updatedAt: '2026-08-05T18:00:00',
    isPrivate: false,
    password: ''
  },
  {
    id: 'album-3',
    title: '私人收藏',
    description: '一些私人收藏的照片，仅供自己查看。',
    cover: 'https://picsum.photos/seed/pixel-private/600/400',
    photos: [
      {
        id: 'photo-3-1',
        url: 'https://picsum.photos/seed/private-1/800/600',
        description: '珍贵的旧照片',
        tags: ['回忆'],
        takenDate: '2026-06-01',
        comments: []
      },
      {
        id: 'photo-3-2',
        url: 'https://picsum.photos/seed/private-2/800/600',
        description: '特殊的礼物',
        tags: ['礼物'],
        takenDate: '2026-06-15',
        comments: []
      },
      {
        id: 'photo-3-3',
        url: 'https://picsum.photos/seed/private-3/800/600',
        description: '美好的时刻',
        tags: ['纪念'],
        takenDate: '2026-07-01',
        comments: []
      },
      {
        id: 'photo-3-4',
        url: 'https://picsum.photos/seed/private-4/800/600',
        description: '远方的风景',
        tags: ['旅行'],
        takenDate: '2026-07-20',
        comments: []
      },
      {
        id: 'photo-3-5',
        url: 'https://picsum.photos/seed/private-5/800/600',
        description: '城市夜景',
        tags: ['城市', '夜景'],
        takenDate: '2026-07-30',
        comments: []
      },
      {
        id: 'photo-3-6',
        url: 'https://picsum.photos/seed/private-6/800/600',
        description: '海边日落',
        tags: ['海边', '日落'],
        takenDate: '2026-08-01',
        comments: []
      }
    ],
    createdAt: '2026-06-01T08:00:00',
    updatedAt: '2026-08-06T12:00:00',
    isPrivate: true,
    password: '123456'
  }
]

export const usePhotosStore = defineStore('photos', () => {
  // ====== State ======
  const albums = ref(sampleAlbums.map(a => JSON.parse(JSON.stringify(a))))
  const currentAlbumId = ref(null)
  const viewMode = ref('grid')
  let albumIdCounter = 100
  let photoIdCounter = 1000
  let commentIdCounter = 5000

  // ====== Getters ======
  const getAlbumById = computed(() => (id) => {
    return albums.value.find(a => a.id === id) || null
  })

  const albumCount = computed(() => albums.value.length)

  const photoCount = computed(() => {
    return albums.value.reduce((sum, a) => sum + a.photos.length, 0)
  })

  const sortedAlbums = computed(() => {
    return [...albums.value].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })

  // ====== Actions ======
  // 创建相册
  function createAlbum(title, description, isPrivate = false, password = '') {
    const now = new Date().toISOString()
    const newAlbum = {
      id: `album-${++albumIdCounter}`,
      title,
      description,
      cover: `https://picsum.photos/seed/new-album-${albumIdCounter}/600/400`,
      photos: [],
      createdAt: now,
      updatedAt: now,
      isPrivate,
      password
    }
    albums.value.unshift(newAlbum)
    return newAlbum
  }

  // 删除相册
  function deleteAlbum(id) {
    const idx = albums.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      albums.value.splice(idx, 1)
      if (currentAlbumId.value === id) currentAlbumId.value = null
      return true
    }
    return false
  }

  // 添加照片
  function addPhoto(albumId, photoData) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      const newPhoto = {
        id: `photo-${++photoIdCounter}`,
        url: photoData.url,
        description: photoData.description || '',
        tags: photoData.tags || [],
        takenDate: photoData.takenDate || new Date().toISOString().slice(0, 10),
        comments: []
      }
      album.photos.push(newPhoto)
      album.updatedAt = new Date().toISOString()
      // 如果没有封面，自动设为封面
      if (album.photos.length === 1) {
        album.cover = newPhoto.url.replace('/800/600', '/600/400')
      }
      return newPhoto
    }
    return null
  }

  // 批量添加照片
  function addPhotos(albumId, photoDataList) {
    const results = []
    for (const data of photoDataList) {
      results.push(addPhoto(albumId, data))
    }
    return results
  }

  // 删除照片
  function deletePhoto(albumId, photoId) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      const idx = album.photos.findIndex(p => p.id === photoId)
      if (idx !== -1) {
        album.photos.splice(idx, 1)
        album.updatedAt = new Date().toISOString()
        // 如果删除的是封面照片
        if (album.cover.includes(photoId)) {
          album.cover = album.photos.length ? album.photos[0].url.replace('/800/600', '/600/400') : 'https://picsum.photos/seed/empty/600/400'
        }
        return true
      }
    }
    return false
  }

  // 更新相册封面
  function updateAlbumCover(albumId, photoUrl) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      album.cover = photoUrl.replace('/800/600', '/600/400')
      album.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  // 更新相册信息
  function updateAlbumInfo(albumId, data) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      if (data.title !== undefined) album.title = data.title
      if (data.description !== undefined) album.description = data.description
      if (data.isPrivate !== undefined) album.isPrivate = data.isPrivate
      if (data.password !== undefined) album.password = data.password
      album.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  // 切换公开/私密
  function togglePrivate(albumId) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      album.isPrivate = !album.isPrivate
      album.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  // 添加照片评论
  function addPhotoComment(albumId, photoId, text) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      const photo = album.photos.find(p => p.id === photoId)
      if (photo && text.trim()) {
        const avatar = avatarPool[Math.floor(Math.random() * avatarPool.length)]
        const newComment = {
          id: `cmt-${++commentIdCounter}`,
          avatar,
          username: '像素旅人',
          text: text.trim(),
          time: new Date().toISOString().slice(0, 10)
        }
        photo.comments.push(newComment)
        return newComment
      }
    }
    return null
  }

  // 删除照片评论
  function deletePhotoComment(albumId, photoId, commentId) {
    const album = albums.value.find(a => a.id === albumId)
    if (album) {
      const photo = album.photos.find(p => p.id === photoId)
      if (photo) {
        const idx = photo.comments.findIndex(c => c.id === commentId)
        if (idx !== -1) {
          photo.comments.splice(idx, 1)
          return true
        }
      }
    }
    return false
  }

  // 设置当前相册
  function setCurrentAlbum(id) {
    currentAlbumId.value = id
  }

  // 设置视图模式
  function setViewMode(mode) {
    viewMode.value = mode
  }

  return {
    albums,
    currentAlbumId,
    viewMode,
    getAlbumById,
    albumCount,
    photoCount,
    sortedAlbums,
    createAlbum,
    deleteAlbum,
    addPhoto,
    addPhotos,
    deletePhoto,
    updateAlbumCover,
    updateAlbumInfo,
    togglePrivate,
    addPhotoComment,
    deletePhotoComment,
    setCurrentAlbum,
    setViewMode
  }
})
