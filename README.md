# 🎨 PIXEL·BLOG

> 一个基于 Vue 3 + Vite 构建的像素风格个人博客站，融合复古像素美学与现代前端技术。

![Vue](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.2-646cff?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-4.0-ffd859?logo=pinia&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue)

✨ 致敬 8-bit / 16-bit 复古游戏时代的像素艺术，用有限的像素，创造无限的可能。

---

## 📖 项目简介

**PIXEL·BLOG** 是一个像素风格（Pixel Art Style）的个人博客站点，采用现代前端技术栈打造。它不仅仅是一个博客，更是一个集博客发布、文档管理、说说分享、相册展示、签到打卡、音乐播放于一体的个人数字小站。

设计灵感来源于 Terraria（泰拉瑞亚）柔和像素风，结合 Game Boy 经典四色配色系统，营造出温暖、复古、充满童趣的视觉体验。

### ✨ 核心特色

- 🎮 **像素美学**：粗边框、双阴影、像素字体（Press Start 2P / VT323 / Pixelify Sans）
- 🌗 **双主题模式**：常规模式（浅色背景）与透明模式（背景图 + 半透明玻璃）
- 📝 **Markdown 写作**：内置编辑器，支持实时预览、代码高亮、目录生成
- 🎨 **可定制**：6 套预设主题色 + 自定义背景图 + 玻璃态透明度调节
- 💾 **本地持久化**：博客、文档、说说、签到、相册数据均通过 localStorage 持久化
- 📱 **响应式设计**：适配桌面端、平板、移动端

---

## 🛠️ 技术栈

| 分类 | 技术 | 说明 |
| :--- | :--- | :--- |
| 前端框架 | Vue 3.4 | Composition API + `<script setup>` |
| 构建工具 | Vite 5.2 | 极速 HMR 与构建 |
| 状态管理 | Pinia 4.0 | 类型友好、轻量级 |
| 路由 | Vue Router 4.3 | SPA 路由方案 |
| Markdown | marked 12 | Markdown 解析渲染 |
| 代码高亮 | highlight.js 11 | 200+ 语言高亮支持 |
| 字体 | Google Fonts | Press Start 2P / Pixelify Sans / VT323 |

---

## 📂 项目结构

```
my-pixel-blog/
├── public/                     # 静态资源
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── global.css      # 全局样式 + 主题变量
│   │       └── pixel-grid.css  # 像素网格背景
│   ├── components/             # 通用组件（26 个）
│   │   ├── NavBar.vue          # 导航栏
│   │   ├── Footer.vue          # 页脚
│   │   ├── PixelBox.vue        # 像素卡片容器
│   │   ├── PixelButton.vue     # 像素按钮
│   │   ├── SearchBar.vue       # 搜索栏
│   │   ├── Sidebar.vue         # 侧边栏
│   │   ├── HeroSection.vue     # 首页英雄区（打字机效果）
│   │   ├── MusicPlayer.vue     # 音乐播放器
│   │   ├── ClockWidget.vue     # 时钟（模拟/数字双模式）
│   │   ├── CalendarWidget.vue  # 日历组件
│   │   ├── Checkin.vue         # 每日签到 + 热力图
│   │   ├── SignHeatmap.vue     # 签到热力图
│   │   ├── CreateMenu.vue     # 浮动创建菜单（FAB）
│   │   ├── SettingsPanel.vue   # 主题设置面板
│   │   ├── PostToc.vue         # 文章目录（自动生成）
│   │   ├── CodeBlock.vue       # 代码块（带复制）
│   │   ├── ImageViewer.vue     # 图片查看器
│   │   ├── PhotoComment.vue    # 照片评论
│   │   ├── TweetCard.vue       # 说说卡片
│   │   ├── PostTweet.vue       # 发布说说
│   │   ├── UploadModal.vue     # 文档上传弹窗
│   │   ├── UploadPhotoModal.vue# 照片上传弹窗
│   │   ├── CreateAlbumModal.vue# 创建相册弹窗
│   │   ├── ConfirmModal.vue    # 确认弹窗
│   │   ├── FlipDigit.vue       # 翻牌数字
│   │   └── MiniAlbum.vue      # 迷你相册
│   ├── composables/
│   │   └── useTheme.js         # 主题管理（明/暗 + 自定义色 + 头像 + 时钟）
│   ├── content/                # 静态内容
│   │   ├── posts/              # Markdown 文档
│   │   ├── photos/             # 相册配置
│   │   └── tweets/             # 说说内容
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── stores/                 # Pinia 状态管理
│   │   ├── blog.js             # 博客（含 localStorage 持久化）
│   │   ├── docs.js             # 文档
│   │   ├── tweets.js           # 说说
│   │   ├── photos.js           # 相册
│   │   └── checkin.js          # 签到
│   ├── utils/
│   │   └── markdown.js         # Markdown 解析工具
│   ├── views/                  # 页面视图
│   │   ├── Home.vue            # 首页（双层结构：英雄区 + 内容聚合）
│   │   ├── Blog.vue            # 博客列表（双栏 + 分类标签筛选）
│   │   ├── PostDetail.vue      # 博客详情（双栏 + 目录 + 代码块）
│   │   ├── PostEditor.vue      # 博客编辑器（左写右预览）
│   │   ├── Docs.vue            # 文档列表
│   │   ├── Tweets.vue          # 说说
│   │   ├── Photos.vue          # 照片集
│   │   ├── AlbumDetail.vue     # 相册详情
│   │   └── About.vue           # 关于
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口
├── index.html                  # HTML 模板
├── vite.config.js              # Vite 配置
└── package.json                # 依赖与脚本
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18.0（推荐 20+）
- **npm** ≥ 9.0（或使用 pnpm / yarn）

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/dky-6/-.git
cd -

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173/
```

### 构建与部署

```bash
# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

构建产物将输出到 `dist/` 目录，可部署至任意静态文件托管服务（Vercel / Netlify / GitHub Pages / Cloudflare Pages 等）。

---

## 🧩 功能模块

### 🏠 首页（Home）

- **双层结构**：首屏英雄区（品牌 LOGO + 打字机标语）+ 滚动后内容聚合页
- **打字机效果**：iPhone 启动风格，0.5s 淡入 + 100ms/字 + 1s 光标闪烁
- **内容聚合**：博主信息卡（头像旋转动画）+ 文章动态 + 数据看板 + 签到 + 公告
- **音乐播放器**：内置播放控件，支持进度调节
- **像素时钟**：模拟时钟 / 数字时钟双模式，带翻牌动画
- **每日签到**：日历视图 + 连续天数统计 + 年度热力图

### 📝 博客（Blog）

- **列表页**：双栏布局（文章列表 + 侧边栏），按发布时间降序
- **筛选系统**：分类筛选 + 标签筛选 + 关键词搜索（可叠加）
- **文章详情**：Markdown 渲染 + 自动目录 + 代码块复制 + 上一篇/下一篇导航
- **博客编辑器**：左写右预览实时联动 + 工具栏 + 封面上传 + 标签管理
- **数据持久化**：用户发布的博客自动保存到 localStorage

### 📄 文档（Docs）

- Markdown 文件上传 + 自动提取标题/摘要
- 分类筛选 + 搜索 + NEW 角标（3 天内）
- 复用博客详情页渲染

### 💬 说说（Tweets）

- 发布说说（支持多行文本）
- 时间线展示
- 评论与点赞

### 📷 照片集（Photos）

- 相册创建与管理
- 照片上传 + 大图查看器
- 私密相册密码保护
- 照片评论

### ⚙️ 关于（About）

- 博主信息展示
- 技能标签
- 社交链接（GitHub / Twitter / Email / RSS / **Bilibili**）

---

## 🎨 主题系统

### 双主题模式

| 模式 | 背景 | 文字 | 适用场景 |
| :--- | :--- | :--- | :--- |
| 常规模式（normal） | 浅色背景 | 深色文字（#1A1A1A） | 白天 / 高对比度 |
| 透明模式（transparent） | 自定义背景图 + 半透明玻璃 | 浅色文字（#FFFFFF） | 夜间 / 个性化 |

### 6 套预设主题色

| 主题 | 主色 | 风格 |
| :--- | :--- | :--- |
| 泰拉瑞亚绿 | `#7B8D6E` | 自然柔和 |
| 樱花粉 | `#E8A5C2` | 温柔可爱 |
| 深海蓝 | `#4A6FA5` | 沉稳商务 |
| 日落橙 | `#E8915A` | 温暖活力 |
| 薰衣草紫 | `#9B8EC4` | 神秘优雅 |
| 森林墨绿 | `#4A7C59` | 沉静深邃 |

### 自定义配置

- 🎨 主题色自定义（主色/浅色/暗色/辅助色/背景色/卡片色）
- 🖼️ 透明模式背景图上传（支持 URL / Base64 / 渐变）
- 💧 玻璃态透明度调节（0.05 - 0.5）
- 🕐 时钟样式切换（模拟 / 数字）
- 👤 头像模式（像素绘制 / 图片 / 字符）

所有配置自动持久化到 `localStorage`，下次访问自动恢复。

---

## 🎯 像素风格规范

本项目严格遵循像素风格设计语言：

### 视觉规范

- **边框**：`2-3px solid` 粗边框，外层 `box-shadow: 0 0 0 3px var(--color-border)`
- **阴影**：双阴影（内描边 + 外描边），hover 时偏移 `translate(2px, 2px)`
- **圆角**：`border-radius: 2px`（保留方块感）
- **字体**：标题用 `Press Start 2P`，正文用 `Pixelify Sans`，代码用 `VT323`
- **抗锯齿**：`-webkit-font-smoothing: none` + `image-rendering: pixelated`

### 透明模式约束

- ❌ 不使用 `backdrop-filter: blur()`（保持背景图清晰）
- ✅ 组件背景使用半透明 `rgba(255, 255, 255, 0.15)`
- ✅ 文字使用 `text-shadow` 增强可读性
- ✅ hover 状态统一为深色背景 + 白色文字

---

## 📦 核心组件

### 基础组件

```vue
<!-- 像素卡片容器 -->
<PixelBox class="my-card">
  内容
</PixelBox>

<!-- 像素按钮（支持路由/外链/普通按钮） -->
<PixelButton @click="handleClick">点击</PixelButton>
<PixelButton to="/about">跳转</PixelButton>
<PixelButton href="https://example.com" variant="secondary">外链</PixelButton>
```

### 状态管理

```javascript
import { useBlogStore } from '@/stores/blog'

const blogStore = useBlogStore()

// 发布新博客（自动持久化）
blogStore.addPost({
  title: '我的新文章',
  category: '前端',
  tags: ['Vue', 'CSS'],
  content: '# Hello World'
})

// 获取列表
blogStore.sortedPosts.value    // 按时间降序
blogStore.latestPosts.value     // 最新 5 篇
blogStore.filterByCategory('前端')
```

### 主题管理

```javascript
import { useTheme } from '@/composables/useTheme'

const {
  themeMode,           // 'normal' | 'transparent'
  customColors,        // 自定义主题色
  setThemeMode,        // 切换模式
  applyPreset,         // 应用预设
  setBgImage,          // 设置背景图
  setGlassOpacity      // 玻璃透明度
} = useTheme()
```

---

## 🔧 配置说明

### Vite 配置

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  }
})
```

### 路由配置

```javascript
// src/router/index.js
const routes = [
  { path: '/',             name: 'home',         component: Home },
  { path: '/blog',         name: 'blog',         component: Blog },
  { path: '/post/:id',     name: 'post-detail',  component: PostDetail },
  { path: '/post-editor',  name: 'post-editor',  component: PostEditor },
  { path: '/docs',        name: 'docs',         component: Docs },
  { path: '/tweets',      name: 'tweets',       component: Tweets },
  { path: '/photos',      name: 'photos',       component: Photos },
  { path: '/photos/:id',  name: 'album-detail',  component: AlbumDetail },
  { path: '/about',       name: 'about',        component: About }
]
```

---

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
| :--- | :--- | :--- |
| Chrome | 90+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 支持（部分字体回退） |
| IE | - | ❌ 不支持 |

---

## 📝 开发说明

### 开发约定

1. **组件规范**：所有 Vue 组件使用 `<script setup>` + `<template>` 语法（Vite 运行时不包含模板编译器）
2. **样式规范**：使用 CSS 变量统一管理主题，新增组件必须使用 `var(--color-*)` 变量
3. **状态管理**：Pinia store 使用 Composition API 风格（`defineStore` + setup 函数）
4. **持久化**：用户创建的内容使用 `localStorage` 持久化，静态示例数据保留在 store 初始化中

### 添加新博客文章

**方式一：使用内置编辑器**

1. 访问 `/blog` → 点击右上角「✎ 写博客」按钮
2. 填写标题、分类、标签、摘要
3. 在左侧 Markdown 编辑器写作，右侧实时预览
4. 点击「🚀 发布」（或 Ctrl+S），文章自动保存并跳转到详情页

**方式二：修改 store 数据**

编辑 `src/stores/blog.js` 中的 `sampleBlogs` 数组，按以下格式添加：

```javascript
{
  id: 'my-new-post',
  title: '文章标题',
  category: '前端',
  tags: ['Vue', 'CSS'],
  description: '文章摘要',
  date: '2026-08-07',
  views: 0,
  cover: '',
  content: `# Markdown 内容`
}
```

### 修改社交链接

编辑 `src/views/About.vue` 中的 `profile` 对象：

```javascript
const profile = {
  socials: [
    { name: 'GitHub', icon: '⌥', url: 'https://github.com/你的用户名' },
    // ... 添加更多
  ],
  bilibili: {
    name: 'B站',
    url: 'https://space.bilibili.com/你的UID'
  }
}
```

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

- ✅ 自由使用、修改、分发
- ✅ 商业用途允许
- ⚠️ 需保留原始版权声明

---

## 🙏 致谢

### 灵感来源

- 🎮 **Terraria**（泰拉瑞亚）- 柔和像素风美学
- 🕹️ **Game Boy** - 经典四色配色系统
- 📝 **掘金 / 博客园** - 博客编辑器交互设计

### 技术支持

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐状态管理库
- [marked](https://marked.js.org/) - Markdown 解析器
- [highlight.js](https://highlightjs.org/) - 代码语法高亮
- [Google Fonts](https://fonts.google.com/) - 像素字体资源

---

## 📮 联系方式

- **GitHub**: [dky-6](https://github.com/dky-6)
- **Bilibili**: [个人空间](https://space.bilibili.com/)

---

<div align="center">

**🎨 Made with ♥ in pixel world**

`© 2026 PIXEL·BLOG · POWERED BY VUE 3 + VITE`

</div>
