import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ====== 10 篇示例文档（硬编码） ====== */
const sampleDocs = [
  {
    id: 'vue3-composition-api',
    title: 'Vue 3 组合式 API 学习笔记',
    category: '前端',
    tags: ['Vue3', 'Composition API', '响应式'],
    description: 'Vue 3 的组合式 API 让我们能够更灵活地组织组件逻辑，告别 Options API 时代的 mixins 命名冲突问题。',
    date: '2026-08-02',
    updatedDate: '2026-08-05', // [FIX] 新增更新日期字段
    views: 567, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Vue 3 组合式 API

Vue 3 的组合式 API（Composition API）让我们能够更灵活地组织组件逻辑。

## setup 函数

\`setup\` 是组合式 API 的入口，在组件创建之前执行：

\`\`\`js
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    return { count, double }
  }
}
\`\`\`

## \`<script setup>\` 语法糖

更简洁的写法，推荐使用：

\`\`\`vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
\`\`\`

## 响应式核心

- \`ref\`：基本类型 / 对象的响应式包装
- \`reactive\`：对象的深度响应式
- \`computed\`：计算属性
- \`watch\` / \`watchEffect\`：侦听器

## 生命周期钩子

| 选项式 API | 组合式 API |
| :--- | :--- |
| created | setup() |
| mounted | onMounted |
| updated | onUpdated |
| unmounted | onUnmounted |

> 组合式 API 让逻辑复用更自然，告别了 Options API 时代的 mixins 命名冲突问题。`
  },
  {
    id: 'css-pixel-art-guide',
    title: 'CSS 像素风艺术入门指南',
    category: '前端',
    tags: ['CSS', '像素风', '动画'],
    description: '使用纯 CSS 绘制像素风格图形，从 box-shadow 像素画到 image-rendering: pixelated 的最佳实践。',
    date: '2026-07-28',
    updatedDate: '2026-07-31', // [FIX] 新增更新日期字段
    views: 291, // [FIX] 新增浏览量字段
    cover: '',
    content: `# CSS 像素风艺术入门

像素艺术是一种复古而迷人的视觉风格，通过纯 CSS 也能实现出色的像素效果。

## box-shadow 像素画技巧

利用多重 \`box-shadow\` 可以绘制像素图案：

\`\`\`css
.pixel-heart {
  width: 10px;
  height: 10px;
  background: #FF6B6B;
  box-shadow:
    20px 0 0 #FF6B6B,
    40px 0 0 #FF6B6B,
    0 10px 0 #FF6B6B,
    /* ... 更多像素点 */
}
\`\`\`

## image-rendering 属性

让图片保持像素感的关键属性：

\`\`\`css
img.pixel {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
\`\`\`

## 像素字体推荐

- **Press Start 2P**：经典街机字体
- **VT323**：终端风格
- **Pixelify Sans**：现代像素风

> 像素风的精髓在于限制色彩数量和保持网格对齐。`
  },
  {
    id: 'flexbox-layout-tips',
    title: 'Flexbox 布局实战技巧',
    category: '前端',
    tags: ['CSS', 'Flexbox', '布局'],
    description: '掌握 Flexbox 的常见布局模式，解决居中、等高列、圣杯布局等经典问题。',
    date: '2026-07-20',
    updatedDate: '2026-07-23', // [FIX] 新增更新日期字段
    views: 128, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Flexbox 布局实战技巧

Flexbox 是 CSS3 中最强大的布局工具之一。

## 完美居中

\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

## 等高列

\`\`\`css
.columns {
  display: flex;
  align-items: stretch;
}
\`\`\`

## 常用属性速查

| 属性 | 作用 |
| :--- | :--- |
| flex-direction | 主轴方向 |
| justify-content | 主轴对齐 |
| align-items | 交叉轴对齐 |
| flex-wrap | 换行控制 |
| gap | 间距 |

> Flexbox 适合一维布局，Grid 适合二维布局，组合使用效果最佳。`
  },
  {
    id: 'springboot-rest-api',
    title: 'Spring Boot 构建 RESTful API',
    category: '后端',
    tags: ['SpringBoot', 'REST', 'Java'],
    description: '从零搭建 Spring Boot 项目，实现 RESTful API 接口，包含参数校验、异常处理和统一响应格式。',
    date: '2026-07-25',
    updatedDate: '2026-07-28', // [FIX] 新增更新日期字段
    views: 432, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Spring Boot 构建 RESTful API

Spring Boot 让创建生产级 Spring 应用变得简单快捷。

## 项目结构

\`\`\`
src/main/java/com/example/demo/
├── controller/   # 控制器
├── service/      # 业务逻辑
├── repository/   # 数据访问
├── entity/       # 实体类
└── config/       # 配置类
\`\`\`

## RESTful 接口示例

\`\`\`java
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @GetMapping
    public List<Post> list() {
        return postService.findAll();
    }

    @PostMapping
    public Post create(@Valid @RequestBody PostDTO dto) {
        return postService.create(dto);
    }
}
\`\`\`

## 统一异常处理

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, e.getMessage()));
    }
}
\`\`\`

> RESTful API 的核心是资源导向，用 HTTP 方法表达操作语义。`
  },
  {
    id: 'mysql-index-optimization',
    title: 'MySQL 索引优化实战',
    category: '后端',
    tags: ['MySQL', '数据库', '性能优化'],
    description: '深入理解 B+ 树索引原理，掌握 EXPLAIN 分析和慢查询优化技巧。',
    date: '2026-07-15',
    updatedDate: '2026-07-18', // [FIX] 新增更新日期字段
    views: 854, // [FIX] 新增浏览量字段
    cover: '',
    content: `# MySQL 索引优化实战

索引是数据库性能优化的第一道防线。

## B+ 树索引原理

InnoDB 使用 B+ 树作为索引结构，叶子节点存储数据并形成有序链表，支持高效范围查询。

## EXPLAIN 分析

\`\`\`sql
EXPLAIN SELECT * FROM posts WHERE category = '前端';
\`\`\`

关注字段：
- **type**：访问类型（ref > range > ALL）
- **key**：实际使用的索引
- **rows**：预估扫描行数

## 索引最佳实践

1. 最左前缀原则
2. 避免索引列上使用函数
3. 覆盖索引减少回表
4. 联合索引顺序按区分度排列

> 索引不是越多越好，写入性能和存储空间都需要权衡。`
  },
  {
    id: 'nodejs-stream-processing',
    title: 'Node.js 流处理大数据',
    category: '后端',
    tags: ['Node.js', 'Stream', '大数据'],
    description: '使用 Node.js Stream 处理大文件，避免内存溢出，实现高效的数据管道。',
    date: '2026-07-10',
    updatedDate: '2026-07-13', // [FIX] 新增更新日期字段
    views: 678, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Node.js 流处理大数据

Stream 是 Node.js 处理大数据的核心能力。

## 四种流类型

- **Readable**：可读流
- **Writable**：可写流
- **Duplex**：双工流
- **Transform**：转换流

## 管道示例

\`\`\`js
const fs = require('fs')
const { pipeline } = require('stream')

pipeline(
  fs.createReadStream('input.csv'),
  transformData(),
  fs.createWriteStream('output.json'),
  (err) => {
    if (err) console.error('处理失败', err)
    else console.log('处理完成')
  }
)
\`\`\`

## 背压机制

当写入速度慢于读取速度时，Stream 会自动触发背压，暂停读取防止内存堆积。

> Stream 让数据处理像流水线一样高效，是 Node.js 的精髓之一。`
  },
  {
    id: 'gameboy-color-palette',
    title: 'Game Boy 配色系统设计',
    category: '设计',
    tags: ['配色', 'Game Boy', '复古'],
    description: '致敬 Game Boy 经典四色绿调配色，探讨如何在现代界面中复刻复古游戏机美学。',
    date: '2026-07-22',
    updatedDate: '2026-07-25', // [FIX] 新增更新日期字段
    views: 345, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Game Boy 配色系统设计

Game Boy 的四色绿调是复古游戏美学的经典代表。

## 经典四色

\`\`\`
#0f380f  /* 最深绿 */
#306230  /* 深绿 */
#8bac0f  /* 浅绿 */
#9bbc0f  /* 最浅绿 */
\`\`\`

## 在 Web 中的应用

\`\`\`css
:root {
  --gb-dark: #0f380f;
  --gb-mid: #306230;
  --gb-light: #8bac0f;
  --gb-bright: #9bbc0f;
}
\`\`\`

## 配色原则

1. **限制色数**：4 色即可表达丰富层次
2. **高对比度**：相邻色阶明度差要大
3. **统一色调**：保持色相一致

> 限制是创意的催化剂，四色也能创造无限可能。`
  },
  {
    id: 'pixel-font-typography',
    title: '像素风字体排印指南',
    category: '设计',
    tags: ['字体', '排版', '像素风'],
    description: '像素字体选择与排版技巧，平衡复古感与可读性，适配不同屏幕尺寸。',
    date: '2026-07-18',
    updatedDate: '2026-07-21', // [FIX] 新增更新日期字段
    views: 712, // [FIX] 新增浏览量字段
    cover: '',
    content: `# 像素风字体排印指南

字体是像素风设计的灵魂。

## 字体分类

| 类型 | 代表字体 | 适用场景 |
| :--- | :--- | :--- |
| 街机风 | Press Start 2P | 标题、按钮 |
| 终端风 | VT323 | 代码、数据 |
| 现代像素 | Pixelify Sans | 正文、描述 |

## 排版技巧

### 标题
\`\`\`css
h1 {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  text-shadow: 2px 2px 0 var(--color-primary);
}
\`\`\`

### 正文
\`\`\`css
p {
  font-family: 'Pixelify Sans', monospace;
  font-size: 16px;
  line-height: 1.6;
}
\`\`\`

## 可读性要点

- 像素字体字号不要太小（≥14px）
- 行高适当放大（1.5~1.8）
- 标题与正文字体形成对比

> 像素字体的魅力在于"有限像素，无限表达"。`
  },
  {
    id: 'ui-retro-game-style',
    title: '复古游戏 UI 设计法则',
    category: '设计',
    tags: ['UI', '游戏', '复古'],
    description: '从红白机到 Game Boy，总结复古游戏界面设计的六大核心法则，打造怀旧数字体验。',
    date: '2026-07-05',
    updatedDate: '2026-07-08', // [FIX] 新增更新日期字段
    views: 923, // [FIX] 新增浏览量字段
    cover: '',
    content: `# 复古游戏 UI 设计法则

复古游戏 UI 的魅力在于用有限的像素创造无限的可能。

## 六大设计法则

### 1. 粗边框定义层次
\`\`\`css
.box {
  box-shadow:
    inset 0 0 0 2px var(--border-light),
    0 0 0 3px var(--border);
}
\`\`\`

### 2. 直角与微圆角
\`\`\`css
border-radius: 2px; /* 保持像素感 */
\`\`\`

### 3. 按钮按压动效
\`\`\`css
.btn:active {
  transform: translate(3px, 3px);
}
\`\`\`

### 4. 有限调色板
- 主色：1 个强调色
- 背景色：深色基底
- 文字色：高对比米白

### 5. 网格对齐
所有元素严格对齐到像素网格。

### 6. 点阵装饰
用小方块组成分隔线、图标等装饰元素。

> 复古不是倒退，而是在约束中寻找美感。`
  },
  {
    id: 'vite-build-optimization',
    title: 'Vite 构建优化实践',
    category: '前端',
    tags: ['Vite', '构建', '性能'],
    description: 'Vite 开发体验极佳，但生产构建也需要优化。介绍分包、压缩、按需加载等实用技巧。',
    date: '2026-08-01',
    updatedDate: '2026-08-04', // [FIX] 新增更新日期字段
    views: 456, // [FIX] 新增浏览量字段
    cover: '',
    content: `# Vite 构建优化实践

Vite 的开发体验无可挑剔，生产构建也有不少优化空间。

## 分包策略

\`\`\`js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'utils': ['marked', 'highlight.js']
        }
      }
    }
  }
}
\`\`\`

## 按需加载

\`\`\`js
const PostDetail = () => import('./views/PostDetail.vue')
\`\`\`

## 资源优化

- 图片使用 \`import.meta.glob\` 按需引入
- CSS 代码分割自动开启
- 使用 \`vite-plugin-compression\` 启用 gzip

## 分析包体积

\`\`\`bash
npx vite-bundle-visualizer
\`\`\`

> 构建优化的核心是减少首屏体积，按需加载是关键。`
  }
]

/* ====== 分类与英文 key 映射 ====== */
export const categoryMap = {
  '全部': 'all',
  '前端': 'frontend',
  '后端': 'backend',
  '设计': 'design'
}

export const keyToCategory = {
  'all': '全部',
  'frontend': '前端',
  'backend': '后端',
  'design': '设计'
}

export const useDocsStore = defineStore('docs', () => {
  // ====== State ======
  const documents = ref(sampleDocs.map(d => ({ ...d })))
  let idCounter = 1000

  // ====== Getters ======
  // 按分类筛选
  const filteredByCategory = computed(() => (category) => {
    if (!category || category === '全部') return documents.value
    return documents.value.filter(d => d.category === category)
  })

  // 按关键词搜索（匹配标题和描述）
  const searchByKeyword = computed(() => (keyword, list) => {
    const source = list || documents.value
    if (!keyword || !keyword.trim()) return source
    const kw = keyword.trim().toLowerCase()
    return source.filter(d =>
      d.title.toLowerCase().includes(kw) ||
      d.description.toLowerCase().includes(kw) ||
      d.tags.some(t => t.toLowerCase().includes(kw))
    )
  })

  // 按 id 获取文档
  const getById = computed(() => (id) => {
    return documents.value.find(d => d.id === id) || null
  })

  // 判断是否为"新"文档（3 天内添加）
  const isNew = computed(() => (doc) => {
    if (!doc.createdAt) return false
    const threeDays = 3 * 24 * 60 * 60 * 1000
    return Date.now() - doc.createdAt < threeDays
  })

  // ====== Actions ======
  function addDocument(doc) {
    const newDoc = {
      id: doc.id || `upload-${++idCounter}`,
      title: doc.title || '未命名文档',
      category: doc.category || '前端',
      tags: doc.tags || [],
      description: doc.description || '',
      date: doc.date || new Date().toISOString().slice(0, 10),
      cover: doc.cover || '',
      content: doc.content || '',
      createdAt: Date.now()
    }
    documents.value.unshift(newDoc)
    return newDoc
  }

  function deleteDocument(id) {
    const idx = documents.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      documents.value.splice(idx, 1)
      return true
    }
    return false
  }

  function updateDocument(id, updates) {
    const idx = documents.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      documents.value[idx] = { ...documents.value[idx], ...updates }
      return true
    }
    return false
  }

  return {
    documents,
    filteredByCategory,
    searchByKeyword,
    getById,
    isNew,
    addDocument,
    deleteDocument,
    updateDocument
  }
})
