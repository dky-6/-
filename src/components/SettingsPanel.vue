<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const {
  themeMode,
  customColors,
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
} = useTheme()

const localColors = ref({ ...customColors.value })
const activeTab = ref('normal')

const isNormalMode = computed(() => themeMode.value === 'normal')
const isTransparentMode = computed(() => themeMode.value === 'transparent')

function close() {
  emit('update:visible', false)
}

function switchMode(mode) {
  setThemeMode(mode)
}

function applyColorChange(key, value) {
  localColors.value[key] = value
  setColors({ [key]: value })
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  // 限制文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (event) => {
    setBgImage(event.target.result)
  }
  reader.readAsDataURL(file)
}

function handleOpacityChange(e) {
  setGlassOpacity(parseFloat(e.target.value))
}

// 预设背景图片（使用渐变或简单图案）
const presetBackgrounds = [
  { name: '渐变紫粉', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '渐变日出', value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)' },
  { name: '渐变海洋', value: 'linear-gradient(135deg, #2e3192 0%, #1b9ce2 100%)' },
  { name: '渐变森林', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { name: '渐变日落', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: '渐变极光', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 50%, #6a11cb 100%)' }
]

function applyPresetBackground(bg) {
  setBgImage(bg.value)
}

function setAvatarType(type) {
  setAvatarConfig({ type })
}

function setAvatarContent(content) {
  setAvatarConfig({ content })
}

function onAvatarFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    setAvatarConfig({ type: 'image', content: event.target.result })
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel-fade">
      <div v-if="visible" class="settings-overlay" @click.self="close">
        <div class="settings-panel">
          <div class="panel-header">
            <h2 class="panel-title">⚙️ 主题设置</h2>
            <button class="close-btn" @click="close">✕</button>
          </div>

          <!-- 模式切换 -->
          <div class="mode-switch">
            <button
              class="mode-btn"
              :class="{ active: isNormalMode }"
              @click="switchMode('normal')"
            >
              🎨 常规模式
            </button>
            <button
              class="mode-btn"
              :class="{ active: isTransparentMode }"
              @click="switchMode('transparent')"
            >
              💎 透明模式
            </button>
          </div>

          <!-- 常规模式设置 -->
          <div v-if="isNormalMode" class="mode-content">
            <div class="section">
              <h3 class="section-title">预设主题</h3>
              <div class="preset-list">
                <button
                  v-for="preset in presetThemes"
                  :key="preset.name"
                  class="preset-btn"
                  @click="applyPreset(preset)"
                >
                  <div class="preset-colors">
                    <span class="color-dot" :style="{ background: preset.primary }"></span>
                    <span class="color-dot" :style="{ background: preset.secondary }"></span>
                    <span class="color-dot" :style="{ background: preset.bg }"></span>
                  </div>
                  <span class="preset-name">{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">自定义颜色</h3>
              <div class="color-picker">
                <div class="color-item">
                  <label>主色调</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.primary"
                      @input="applyColorChange('primary', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.primary }}</span>
                  </div>
                </div>
                <div class="color-item">
                  <label>主色亮色</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.primaryLight"
                      @input="applyColorChange('primaryLight', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.primaryLight }}</span>
                  </div>
                </div>
                <div class="color-item">
                  <label>主色暗色</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.primaryDark"
                      @input="applyColorChange('primaryDark', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.primaryDark }}</span>
                  </div>
                </div>
                <div class="color-item">
                  <label>辅助色</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.secondary"
                      @input="applyColorChange('secondary', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.secondary }}</span>
                  </div>
                </div>
                <div class="color-item">
                  <label>背景色</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.bg"
                      @input="applyColorChange('bg', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.bg }}</span>
                  </div>
                </div>
                <div class="color-item">
                  <label>卡片背景</label>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="localColors.bgCard"
                      @input="applyColorChange('bgCard', $event.target.value)"
                      class="color-input"
                    />
                    <span class="color-value">{{ localColors.bgCard }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 透明模式设置 -->
          <div v-if="isTransparentMode" class="mode-content">
            <div class="section">
              <h3 class="section-title">预设背景</h3>
              <div class="preset-bg-list">
                <button
                  v-for="bg in presetBackgrounds"
                  :key="bg.name"
                  class="preset-bg-btn"
                  :style="{ background: bg.value }"
                  @click="applyPresetBackground(bg)"
                >
                  {{ bg.name }}
                </button>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">自定义背景</h3>
              <div class="upload-area">
                <label class="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                    class="file-input"
                  />
                  📁 选择图片
                </label>
                <p class="upload-hint">支持 JPG、PNG 格式，最大 5MB</p>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">玻璃透明度</h3>
              <div class="opacity-control">
                <label>透明度</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  :value="glassOpacity"
                  @input="handleOpacityChange"
                  class="opacity-slider"
                />
                <span class="opacity-value">{{ Math.round(glassOpacity * 100) }}%</span>
              </div>
              <p class="hint">数值越低越透明，背景图片完整清晰可见</p>
            </div>

            <div class="preview-section">
              <h3 class="section-title">效果预览</h3>
              <div class="glass-preview">
                <div class="preview-card">
                  <span>💎 玻璃卡片</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 时钟形式切换（通用） -->
          <div class="mode-content">
            <div class="section">
              <h3 class="section-title">时钟形式</h3>
              <div class="clock-style-switch">
                <button
                  class="clock-style-btn"
                  :class="{ active: clockStyle === 'analog' }"
                  @click="setClockStyle('analog')"
                >
                  🕐 模拟时钟
                </button>
                <button
                  class="clock-style-btn"
                  :class="{ active: clockStyle === 'digital' }"
                  @click="setClockStyle('digital')"
                >
                  🔢 数字时钟
                </button>
              </div>
            </div>

            <!-- 头像配置 -->
            <div class="section">
              <h3 class="section-title">头像设置</h3>
              <div class="avatar-style-switch">
                <button
                  class="avatar-style-btn"
                  :class="{ active: avatarConfig.type === 'pixel' }"
                  @click="setAvatarType('pixel')"
                >
                  🎨 像素
                </button>
                <button
                  class="avatar-style-btn"
                  :class="{ active: avatarConfig.type === 'char' }"
                  @click="setAvatarType('char')"
                >
                  🔤 字符
                </button>
                <button
                  class="avatar-style-btn"
                  :class="{ active: avatarConfig.type === 'image' }"
                  @click="setAvatarType('image')"
                >
                  🖼️ 图片
                </button>
              </div>

              <!-- 字符模式输入 -->
              <div v-if="avatarConfig.type === 'char'" class="avatar-content-input">
                <label>字符/Emoji</label>
                <input
                  type="text"
                  :value="avatarConfig.content"
                  @input="setAvatarContent($event.target.value)"
                  class="avatar-text-input"
                  maxlength="4"
                  placeholder="👤"
                />
              </div>

              <!-- 图片模式上传 -->
              <div v-if="avatarConfig.type === 'image'" class="avatar-upload">
                <label class="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    @change="onAvatarFileChange"
                    class="file-input"
                  />
                  📁 上传头像
                </label>
                <p class="upload-hint">支持 JPG、PNG，最大 5MB</p>
              </div>

              <!-- 预览 -->
              <div class="avatar-preview-row">
                <span class="preview-label">预览：</span>
                <div class="avatar-preview">
                  <div
                    class="preview-box"
                    :class="{
                      'avatar-circle': avatarConfig.type !== 'pixel',
                      'avatar-image': avatarConfig.type === 'image',
                      'avatar-char': avatarConfig.type === 'char'
                    }"
                  >
                    <template v-if="avatarConfig.type === 'pixel'">
                      <div class="avatar-grid-preview">
                        <span v-for="i in 64" :key="i" class="p-pixel" :class="{
                          'bg': avatarConfig.pixelPattern.includes(i),
                          'eye': avatarConfig.eyeIndices.includes(i),
                          'mouth': avatarConfig.mouthIndices.includes(i)
                        }"></span>
                      </div>
                    </template>
                    <template v-else-if="avatarConfig.type === 'image'">
                      <img v-if="avatarConfig.content" :src="avatarConfig.content" alt="avatar preview" />
                      <span v-else>🖼️</span>
                    </template>
                    <template v-else>
                      <span class="char-text">{{ avatarConfig.content || '👤' }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-panel {
  width: 420px;
  max-height: 85vh;
  background: var(--color-bg-card);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-bottom: 3px solid var(--color-border);
}

.panel-title {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-text-inverse);
}

.close-btn {
  width: 28px;
  height: 28px;
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.close-btn:hover {
  background: var(--color-secondary);
}

/* 模式切换 */
.mode-switch {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
}

.mode-btn {
  flex: 1;
  padding: 10px 16px;
  background: var(--color-bg);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  transition: none;
}

.mode-btn.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* 模式内容 */
.mode-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border);
}

/* 预设主题 */
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-bg);
  color: var(--color-text);
  border: none;
  box-shadow:
    inset 0 0 0 1px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
}

.preset-btn:hover {
  transform: translate(1px, 1px);
}

.preset-colors {
  display: flex;
  gap: 4px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 2px;
}

/* 自定义颜色 */
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-item label {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text-light);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 48px;
  height: 36px;
  padding: 0;
  border: 2px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 1px;
}

.color-value {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
}

/* 预设背景 */
.preset-bg-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.preset-bg-btn {
  height: 48px;
  padding: 8px;
  color: #fff;
  font-family: var(--font-title);
  font-size: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s;
}

.preset-bg-btn:hover {
  transform: scale(1.02);
  border-color: #fff;
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  display: inline-block;
  padding: 12px 20px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-title);
  font-size: 12px;
  text-align: center;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.upload-btn:hover {
  transform: translate(1px, 1px);
}

.file-input {
  display: none;
}

.upload-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-light);
}

/* 透明度控制 */
.opacity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.opacity-control label {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text-light);
  min-width: 50px;
}

.opacity-slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 20px;
  background: var(--color-primary);
  border: 2px solid var(--color-border);
  cursor: pointer;
}

.opacity-value {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  min-width: 45px;
  text-align: right;
}

.hint {
  margin-top: 8px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--color-text-light);
  font-style: italic;
}

/* 预览区域 */
.preview-section {
  margin-top: 8px;
}

.glass-preview {
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid var(--color-border);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text);
}

/* 动画 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}

/* 时钟形式切换 */
.clock-style-switch {
  display: flex;
  gap: 8px;
}

.clock-style-btn {
  flex: 1;
  padding: 10px 12px;
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text-light);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.clock-style-btn:hover {
  background: var(--color-primary-light);
}

.clock-style-btn.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-dark);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

/* 头像样式切换 */
.avatar-style-switch {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.avatar-style-btn {
  flex: 1;
  padding: 8px 6px;
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text-light);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.avatar-style-btn:hover {
  background: var(--color-primary-light);
}

.avatar-style-btn.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-dark);
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}

.avatar-content-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.avatar-content-input label {
  font-family: var(--font-title);
  font-size: 10px;
  color: var(--color-text-light);
}

.avatar-text-input {
  padding: 8px 10px;
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 2px;
  outline: none;
}

.avatar-text-input:focus {
  border-color: var(--color-primary);
}

.avatar-upload {
  margin-bottom: 14px;
}

.avatar-preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 2px solid var(--color-border);
}

.preview-label {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text-light);
}

.avatar-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-box {
  width: 56px;
  height: 56px;
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-box.avatar-circle {
  border-radius: 50%;
  padding: 0;
  background: var(--color-bg);
  box-shadow:
    0 0 0 2px var(--color-border),
    inset 0 0 0 2px var(--color-primary);
}

.preview-box.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.preview-box.avatar-char {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.preview-box .char-text {
  font-size: 22px;
  font-family: var(--font-title);
  color: var(--color-text-inverse);
}

.avatar-grid-preview {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
  gap: 1px;
}

.p-pixel {
  background: var(--color-primary);
}

.p-pixel.bg {
  background: var(--color-primary-dark);
}

.p-pixel.eye,
.p-pixel.mouth {
  background: var(--color-text-inverse);
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

/* 滚动条 */
.mode-content::-webkit-scrollbar {
  width: 8px;
}

.mode-content::-webkit-scrollbar-track {
  background: var(--color-bg);
}

.mode-content::-webkit-scrollbar-thumb {
  background: var(--color-primary-dark);
  border: 1px solid var(--color-bg);
}

/* 响应式 */
@media (max-width: 480px) {
  .settings-panel {
    width: calc(100% - 32px);
    max-height: 90vh;
  }
}
</style>
