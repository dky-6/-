import { ref, watch } from 'vue'

const STORAGE_KEY = 'pixel-blog-theme'

// 主题模式：'normal' | 'transparent'
const themeMode = ref('normal')

// 自定义主题色（常规模式）
const customColors = ref({
  primary: '#7B8D6E',
  primaryLight: '#A0B892',
  primaryDark: '#5A6D4E',
  secondary: '#8B7355',
  bg: '#C4B59A',
  bgCard: '#E8DDD0'
})

// 透明模式背景图
const bgImage = ref('')

// 玻璃态透明度
const glassOpacity = ref(0.15)

// 时钟形式：'analog' | 'digital'
const clockStyle = ref('analog')

// 头像配置
const avatarConfig = ref({
  type: 'pixel', // 'pixel' | 'image' | 'char'
  content: '🧑‍💻', // image url or character
  pixelPattern: [19,20,21,22,27,28,35,36,43,44,51,52], // highlighted pixel indices
  eyeIndices: [30, 34],
  mouthIndices: [49, 50, 57, 58]
})

// 初始化标志
let initialized = false

// 预设主题色
const presetThemes = [
  { name: '泰拉瑞亚绿', primary: '#7B8D6E', primaryLight: '#A0B892', primaryDark: '#5A6D4E', secondary: '#8B7355', bg: '#C4B59A', bgCard: '#E8DDD0' },
  { name: '樱花粉', primary: '#E8A5C2', primaryLight: '#F5C6DA', primaryDark: '#C07A9E', secondary: '#D4A5B8', bg: '#FDF2F8', bgCard: '#FFF5F9' },
  { name: '深海蓝', primary: '#4A6FA5', primaryLight: '#6B8FC5', primaryDark: '#34547E', secondary: '#5B7BA8', bg: '#E8EDF5', bgCard: '#F0F4FA' },
  { name: '日落橙', primary: '#E8915A', primaryLight: '#F5B07E', primaryDark: '#C06E38', secondary: '#D4875A', bg: '#FDF0E4', bgCard: '#FFF5EC' },
  { name: '薰衣草紫', primary: '#9B8EC4', primaryLight: '#B8ABD9', primaryDark: '#7569A0', secondary: '#A89BC4', bg: '#EDE8F5', bgCard: '#F5F2FA' },
  { name: '森林墨绿', primary: '#4A7C59', primaryLight: '#6B9C78', primaryDark: '#345C40', secondary: '#5B8C6A', bg: '#E4EDE5', bgCard: '#EDF3EF' }
]

// 保存到 localStorage
function saveTheme() {
  const data = {
    mode: themeMode.value,
    colors: customColors.value,
    bgImage: bgImage.value,
    glassOpacity: glassOpacity.value,
    clockStyle: clockStyle.value,
    avatarConfig: avatarConfig.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 从 localStorage 加载
function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      themeMode.value = data.mode || 'normal'
      if (data.colors) customColors.value = { ...customColors.value, ...data.colors }
      bgImage.value = data.bgImage || ''
      glassOpacity.value = data.glassOpacity ?? 0.6
      clockStyle.value = data.clockStyle || 'analog'
      if (data.avatarConfig) avatarConfig.value = { ...avatarConfig.value, ...data.avatarConfig }
    }
  } catch (e) {
    console.warn('加载主题失败:', e)
  }
}

// 应用主题到 CSS 变量
function applyTheme() {
  const root = document.documentElement

  if (themeMode.value === 'normal') {
    // 常规模式：浅色背景 + 深色文字（高对比度）
    root.style.setProperty('--color-primary', customColors.value.primary)
    root.style.setProperty('--color-primary-light', customColors.value.primaryLight)
    root.style.setProperty('--color-primary-dark', customColors.value.primaryDark)
    root.style.setProperty('--color-secondary', customColors.value.secondary)
    root.style.setProperty('--color-bg', customColors.value.bg)
    root.style.setProperty('--color-bg-card', customColors.value.bgCard)
    // [NEW] 明亮模式：深色文字确保在浅色背景上清晰可读
    root.style.setProperty('--color-text', '#1A1A1A')
    root.style.setProperty('--color-text-light', '#555555')
    root.style.setProperty('--color-text-inverse', '#FFFFFF')
    root.style.setProperty('--color-border', '#1A1A1A')
    root.style.setProperty('--color-border-light', 'rgba(0, 0, 0, 0.15)')
    root.classList.remove('theme-transparent')
  } else {
    // 透明模式：暗色/半透明背景 + 浅色文字（高对比度）
    root.classList.add('theme-transparent')
    // [NEW] 暗色模式：浅色文字确保在深色背景上清晰可读
    root.style.setProperty('--color-text', '#FFFFFF')
    root.style.setProperty('--color-text-light', '#E0E0E0')
    root.style.setProperty('--color-text-inverse', '#1A1824')
    root.style.setProperty('--color-border', '#FFFFFF')
    root.style.setProperty('--color-border-light', 'rgba(255, 255, 255, 0.3)')
    if (bgImage.value) {
      // 检查是否是渐变（以 linear-gradient 或 radial-gradient 开头）
      const isGradient = bgImage.value.startsWith('linear-gradient') ||
                          bgImage.value.startsWith('radial-gradient')
      if (isGradient) {
        root.style.setProperty('--bg-image', bgImage.value)
      } else if (bgImage.value.startsWith('data:')) {
        // Base64 图片
        root.style.setProperty('--bg-image', `url("${bgImage.value}")`)
      } else if (bgImage.value.startsWith('http')) {
        // URL 图片
        root.style.setProperty('--bg-image', `url("${bgImage.value}")`)
      } else {
        // 其他情况
        root.style.setProperty('--bg-image', bgImage.value)
      }
    }
    root.style.setProperty('--glass-opacity', glassOpacity.value)
  }
  
  saveTheme()
}

// 设置主题色
function setColors(colors) {
  customColors.value = { ...customColors.value, ...colors }
  applyTheme()
}

// 使用预设主题
function applyPreset(preset) {
  customColors.value = {
    primary: preset.primary,
    primaryLight: preset.primaryLight,
    primaryDark: preset.primaryDark,
    secondary: preset.secondary,
    bg: preset.bg,
    bgCard: preset.bgCard
  }
  applyTheme()
}

// 设置透明模式背景
function setBgImage(imageDataUrl) {
  bgImage.value = imageDataUrl
  applyTheme()
}

// 设置主题模式
function setThemeMode(mode) {
  themeMode.value = mode
  applyTheme()
}

// 设置玻璃态透明度
function setGlassOpacity(opacity) {
  glassOpacity.value = opacity
  applyTheme()
}

// 设置时钟形式
function setClockStyle(style) {
  clockStyle.value = style
  saveTheme()
}

// 设置头像配置
function setAvatarConfig(config) {
  avatarConfig.value = { ...avatarConfig.value, ...config }
  saveTheme()
}

export function useTheme() {
  // 确保只初始化一次
  if (!initialized) {
    loadTheme()
    applyTheme()
    initialized = true

    // 监听变化自动保存
    watch([themeMode, customColors, bgImage, glassOpacity], () => {
      saveTheme()
    }, { deep: true })
  }

  return {
    themeMode,
    customColors,
    bgImage,
    glassOpacity,
    clockStyle,
    avatarConfig,
    presetThemes,
    setColors,
    applyPreset,
    setBgImage,
    setThemeMode,
    setGlassOpacity,
    setClockStyle,
    setAvatarConfig
  }
}
