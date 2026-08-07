<script setup>
import PixelBox from '../components/PixelBox.vue'
import PixelButton from '../components/PixelButton.vue'

// ====== 个人信息配置 ======
const profile = {
  name: '像素旅人',
  bio: '一个在像素世界里写代码的旅行者。喜欢用最简单的方块拼出有趣的东西，相信技术与艺术可以完美融合。',
  skills: ['Vue', 'JavaScript', 'Node.js', 'Python', '像素画', '游戏开发', '摄影'],
  socials: [
    { name: 'GitHub', icon: '⌥', url: 'https://github.com' },
    { name: 'Twitter', icon: '✦', url: 'https://twitter.com' },
    { name: 'Email', icon: '✉', url: 'mailto:hello@pixel.blog' },
    { name: 'RSS', icon: '❖', url: '#' }
  ],
  // [NEW] Bilibili 链接（可在此配置个人空间地址）
  bilibili: {
    name: 'B站',
    // 修改为你的 Bilibili 个人空间链接
    url: 'https://space.bilibili.com/'
  }
}
</script>

<template>
  <div class="page-container about">
    <h1 class="page-title">▶ 关于</h1>

    <!-- 头像 + 简介 -->
    <PixelBox class="profile-card">
      <div class="profile-top">
        <div class="big-avatar">
          <div class="avatar-face">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="mouth"></div>
            <div class="blush left"></div>
            <div class="blush right"></div>
          </div>
        </div>
        <h2 class="name">{{ profile.name }}</h2>
      </div>
      <p class="bio">{{ profile.bio }}</p>
    </PixelBox>

    <!-- 技能标签 -->
    <PixelBox class="skills-card">
      <h3 class="section-title">▸ 技能标签</h3>
      <div class="skill-tags">
        <span v-for="skill in profile.skills" :key="skill" class="skill-tag">{{ skill }}</span>
      </div>
    </PixelBox>

    <!-- 社交链接 -->
    <PixelBox class="social-card">
      <h3 class="section-title">▸ 社交链接</h3>
      <div class="social-links">
        <a
          v-for="s in profile.socials"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <span class="social-icon">{{ s.icon }}</span>
          <span class="social-name">{{ s.name }}</span>
        </a>
        <!-- [NEW] Bilibili 像素风格链接 -->
        <a
          :href="profile.bilibili.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link social-bilibili"
          title="Bilibili 个人空间"
        >
          <!-- 像素风格 Bilibili 电视机图标 -->
          <span class="social-icon bilibili-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <rect x="3" y="7" width="18" height="13" fill="currentColor" rx="1"/>
              <rect x="6" y="4" width="2" height="4" fill="currentColor"/>
              <rect x="16" y="4" width="2" height="4" fill="currentColor"/>
              <rect x="9" y="11" width="2" height="4" fill="#FFFFFF"/>
              <rect x="13" y="11" width="2" height="4" fill="#FFFFFF"/>
            </svg>
          </span>
          <span class="social-name">{{ profile.bilibili.name }}</span>
        </a>
      </div>
    </PixelBox>

    <!-- 装饰 -->
    <PixelBox class="deco-card">
      <p class="deco-text">"Stay pixel, stay curious."</p>
    </PixelBox>
  </div>
</template>

<style scoped>
.about {
  max-width: 640px;
}

.profile-card {
  text-align: center;
  margin-bottom: 20px;
}

.profile-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* 大号像素头像 */
.big-avatar {
  width: 96px;
  height: 96px;
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 4px var(--color-primary-light),
    0 0 0 4px var(--color-border);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-face {
  position: relative;
  width: 64px;
  height: 64px;
}

.eye {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-text);
  top: 20px;
}
.eye.left { left: 12px; }
.eye.right { right: 12px; }

.mouth {
  position: absolute;
  width: 24px;
  height: 4px;
  background: var(--color-text);
  bottom: 16px;
  left: 20px;
}

.blush {
  position: absolute;
  width: 8px;
  height: 4px;
  background: var(--color-secondary-light);
  top: 32px;
  opacity: 0.8;
}
.blush.left { left: 4px; }
.blush.right { right: 4px; }

.name {
  font-family: var(--font-title);
  font-size: 16px;
  color: var(--color-text);
}

.bio {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-light);
}

.skills-card,
.social-card {
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  font-family: var(--font-body);
  font-size: 15px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 6px 14px;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
}

.skill-tag:nth-child(even) {
  background: var(--color-secondary);
  box-shadow:
    inset 0 0 0 2px var(--color-secondary-light),
    0 0 0 2px var(--color-border);
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 8px 14px;
  text-decoration: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  transition: none;
}

.social-link:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-inverse);
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

.social-icon {
  font-family: var(--font-title);
  font-size: 14px;
}

.social-name {
  font-family: var(--font-body);
  font-size: 15px;
}

/* [NEW] Bilibili 链接专属样式 - 像素风粉蓝色 */
.social-bilibili {
  background: var(--color-bg);
  color: #FB7299;
  border-color: var(--color-border);
}

.social-bilibili:hover {
  background: #FB7299;
  color: #FFFFFF;
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px #FFB6C1,
    0 0 0 1px var(--color-border);
}

.bilibili-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  line-height: 1;
}

.bilibili-icon svg {
  display: block;
  shape-rendering: crispEdges;
}

.deco-card {
  text-align: center;
}

.deco-text {
  font-family: var(--font-title);
  font-size: 11px;
  color: var(--color-text-light);
  font-style: italic;
}
</style>
