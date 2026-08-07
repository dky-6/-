import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ====== localStorage 持久化（仅保存用户创建的文章） ====== */
const STORAGE_KEY = 'pixel-blog-user-posts'

function loadUserPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('加载用户博客失败:', e)
  }
  return []
}

function saveUserPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch (e) {
    console.warn('保存用户博客失败:', e)
  }
}

/* ====== 博客示例数据（独立于 docs.js） ====== */
const sampleBlogs = [
  {
    id: 'react-hooks-deep-dive',
    title: 'React Hooks 深入解析',
    category: '前端',
    tags: ['React', 'Hooks', '函数组件'],
    description: '深入理解 React Hooks 的设计理念，掌握 useState、useEffect、useMemo 等核心 Hook 的使用场景与陷阱。',
    date: '2026-08-05',
    views: 432,
    cover: '',
    content: `# React Hooks 深入解析

React Hooks 是 React 16.8 引入的特性，让我们在函数组件中使用状态和生命周期。

## useState 状态管理

\`useState\` 是最基础的 Hook：

\`\`\`jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(c => c + 1)}>
      点击 {count} 次
    </button>
  )
}
\`\`\`

## useEffect 副作用处理

\`useEffect\` 处理副作用，依赖数组控制执行时机：

| 依赖数组 | 执行时机 |
| :--- | :--- |
| \`[]\` | 仅挂载时执行 |
| \`[dep]\` | dep 变化时执行 |
| 无数组 | 每次渲染都执行 |

\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000)
  return () => clearInterval(timer) // 清理函数
}, [])
\`\`\`

## useMemo 与 useCallback

用于性能优化，避免不必要的重渲染：

\`\`\`jsx
const memoizedValue = useMemo(() => expensiveCalc(a, b), [a, b])
const memoizedCallback = useCallback(() => doSomething(id), [id])
\`\`\`

### 自定义 Hook

将逻辑复用封装为自定义 Hook：

\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const update = () => setSize({ w: innerWidth, h: innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
\`\`\`

> Hooks 的核心规则：只在顶层调用，不要在循环、条件或嵌套函数中调用。`
  },
  {
    id: 'typescript-type-gymnastics',
    title: 'TypeScript 类型体操入门',
    category: '前端',
    tags: ['TypeScript', '类型系统', '泛型'],
    description: '从条件类型到映射类型，掌握 TypeScript 高级类型技巧，写出类型安全的工具函数。',
    date: '2026-08-03',
    views: 287,
    cover: '',
    content: `# TypeScript 类型体操入门

TypeScript 的类型系统图灵完备，能做远超想象的事情。

## 条件类型

\`\`\`ts
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'> // true
type B = IsString<123>     // false
\`\`\`

## 映射类型

\`\`\`ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}
\`\`\`

## infer 关键字

\`infer\` 用于在条件类型中提取类型：

\`\`\`ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Unpack<T> = T extends Promise<infer U> ? U : T
\`\`\`

### 实战：DeepPartial

\`\`\`ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
\`\`\`

| 内置工具类型 | 作用 |
| :--- | :--- |
| Pick | 选取部分属性 |
| Omit | 排除部分属性 |
| Record | 构造键值对类型 |
| Exclude | 从联合类型中排除 |
| Extract | 从联合类型中提取 |

> 类型体操的精髓：把类型当数据来编程。`
  },
  {
    id: 'docker-container-deploy',
    title: 'Docker 容器化部署实战',
    category: '运维',
    tags: ['Docker', '容器化', '部署'],
    description: '从 Dockerfile 编写到多容器编排，掌握容器化部署的完整流程与最佳实践。',
    date: '2026-08-01',
    views: 519,
    cover: '',
    content: `# Docker 容器化部署实战

Docker 让应用的打包、分发、运行变得一致且可重现。

## Dockerfile 基础

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
\`\`\`

## 多阶段构建

减小镜像体积的关键技巧：

\`\`\`dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
\`\`\`

## 常用命令

| 命令 | 说明 |
| :--- | :--- |
| \`docker build\` | 构建镜像 |
| \`docker run\` | 运行容器 |
| \`docker ps\` | 查看运行中容器 |
| \`docker logs\` | 查看日志 |
| \`docker exec\` | 进入容器 |

### Docker Compose 编排

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
\`\`\`

> 镜像分层缓存：把变化频率低的指令放前面，能大幅提升构建速度。`
  },
  {
    id: 'redis-cache-patterns',
    title: 'Redis 缓存设计模式',
    category: '数据库',
    tags: ['Redis', '缓存', '高并发'],
    description: '深入分析 Cache-Aside、Read-Through、Write-Behind 等缓存模式，解决缓存穿透、击穿、雪崩问题。',
    date: '2026-07-29',
    views: 648,
    cover: '',
    content: `# Redis 缓存设计模式

缓存是提升系统性能的关键手段，Redis 是最流行的缓存方案。

## Cache-Aside 模式

最常用的缓存策略，应用代码主动管理缓存：

\`\`\`python
def get_user(user_id):
    # 1. 先查缓存
    user = redis.get(f"user:{user_id}")
    if user:
        return user
    # 2. 缓存未命中，查数据库
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    # 3. 写入缓存
    redis.setex(f"user:{user_id}", 3600, user)
    return user
\`\`\`

## 三大经典问题

| 问题 | 原因 | 解决方案 |
| :--- | :--- | :--- |
| 缓存穿透 | 查询不存在的数据 | 布隆过滤器 / 缓存空值 |
| 缓存击穿 | 热点 key 过期 | 互斥锁 / 永不过期 |
| 缓存雪崩 | 大量 key 同时过期 | 随机过期时间 |

### 缓存穿透防护

\`\`\`python
def get_user_safe(user_id):
    user = redis.get(f"user:{user_id}")
    if user == "NULL":
        return None  # 缓存的空值
    if user:
        return user
    user = db.query(...)
    if user:
        redis.setex(f"user:{user_id}", 3600, user)
    else:
        redis.setex(f"user:{user_id}", 60, "NULL")  # 短期缓存空值
    return user
\`\`\`

## 数据结构选择

- **String**：计数器、缓存对象
- **Hash**：对象存储
- **List**：消息队列
- **Set**：去重、交集
- **ZSet**：排行榜

> 缓存一致性：先更新数据库，再删除缓存，是最稳妥的策略。`
  },
  {
    id: 'git-workflow-best-practices',
    title: 'Git 工作流最佳实践',
    category: '运维',
    tags: ['Git', '版本控制', '协作'],
    description: '对比 Git Flow、GitHub Flow、Trunk-Based 三大工作流，选择适合团队的分支策略。',
    date: '2026-07-26',
    views: 392,
    cover: '',
    content: `# Git 工作流最佳实践

好的分支策略能让团队协作更高效。

## 常用命令

\`\`\`bash
# 创建并切换分支
git checkout -b feature/login

# 交互式 rebase 整理提交
git rebase -i HEAD~3

# 变基到主干
git rebase main

# 合并分支（保留历史）
git merge --no-ff feature/login
\`\`\`

## 三大工作流对比

| 工作流 | 适用场景 | 复杂度 |
| :--- | :--- | :--- |
| Git Flow | 大型项目发布 | 高 |
| GitHub Flow | 持续部署 | 低 |
| Trunk-Based | 高频集成 | 中 |

### GitHub Flow 示例

\`\`\`bash
# 1. 从 main 创建分支
git checkout main && git pull
git checkout -b feature/dark-mode

# 2. 开发并提交
git add . && git commit -m "feat: add dark mode"

# 3. 推送并发起 PR
git push -u origin feature/dark-mode
# 4. Code Review 后合并到 main
\`\`\`

## 提交规范

遵循 Conventional Commits：

\`\`\`text
feat: 新功能
fix: 修复 bug
docs: 文档变更
refactor: 重构
test: 测试
chore: 构建/工具
\`\`\`

> 黄金法则：永远不要 rebase 已推送到远程的公共分支。`
  },
  {
    id: 'webpack-perf-optimization',
    title: 'Webpack 性能优化指南',
    category: '前端',
    tags: ['Webpack', '构建', '性能'],
    description: '从打包速度到产物体积，全面优化 Webpack 构建性能，提速 5 倍以上。',
    date: '2026-07-23',
    views: 356,
    cover: '',
    content: `# Webpack 性能优化指南

构建速度和产物体积是前端工程化的两大核心指标。

## 优化打包速度

\`\`\`js
// webpack.config.js
module.exports = {
  // 1. 缓存
  cache: { type: 'filesystem' },
  // 2. 多线程编译
  module: {
    rules: [{
      test: /\\.js$/,
      use: 'thread-loader'
    }]
  },
  // 3. 排除依赖
  resolve: {
    alias: { '@': path.resolve('src') }
  }
}
\`\`\`

## 优化产物体积

\`\`\`js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: { test: /node_modules/, name: 'vendors' }
      }
    },
    minimizer: [new TerserPlugin()]
  }
}
\`\`\`

## 优化手段对比

| 手段 | 速度提升 | 体积减小 |
| :--- | :--- | :--- |
| 持久化缓存 | ⭐⭐⭐ | - |
| thread-loader | ⭐⭐⭐ | - |
| 代码分割 | - | ⭐⭐⭐ |
| Tree Shaking | - | ⭐⭐ |
| Gzip 压缩 | - | ⭐⭐⭐ |

### 分析工具

\`\`\`bash
# 分析产物构成
npx webpack-bundle-analyzer dist/stats.json

# 生成构建报告
npx webpack --profile --json > stats.json
\`\`\`

> 升级到 Vite/Rollup 能获得数量级的速度提升，新项目建议直接用 Vite。`
  },
  {
    id: 'graphql-vs-rest',
    title: 'GraphQL vs REST API 对比',
    category: '后端',
    tags: ['GraphQL', 'REST', 'API'],
    description: '从数据获取、版本管理、缓存策略等维度对比 GraphQL 与 REST，选择适合的 API 风格。',
    date: '2026-07-20',
    views: 273,
    cover: '',
    content: `# GraphQL vs REST API 对比

API 设计风格直接影响前后端协作效率。

## REST 风格

基于资源，使用 HTTP 方法语义化操作：

\`\`\`text
GET    /api/users        # 获取列表
GET    /api/users/123     # 获取详情
POST   /api/users         # 创建
PUT    /api/users/123     # 更新
DELETE /api/users/123     # 删除
\`\`\`

## GraphQL 风格

客户端按需查询字段，一个端点搞定：

\`\`\`graphql
query {
  user(id: "123") {
    name
    email
    posts(last: 5) {
      title
    }
  }
}
\`\`\`

## 核心对比

| 维度 | REST | GraphQL |
| :--- | :--- | :--- |
| 端点 | 多个 | 单个 |
| 数据获取 | 固定结构 | 按需查询 |
| 过度获取 | 常见 | 避免 |
| 欠获取 | 常见 | 避免 |
| 缓存 | HTTP 缓存 | 需自行实现 |
| 版本管理 | URL 版本 | 无需版本 |
| 学习曲线 | 低 | 中高 |

### 何时选 GraphQL

\`\`\`text
- 移动端需要精确控制数据量
- 前端需要聚合多个数据源
- 数据关系复杂，存在嵌套查询
\`\`\`

> 没有银弹：REST 适合简单 CRUD，GraphQL 适合复杂数据聚合，gRPC 适合内部高性能通信。`
  },
  {
    id: 'microservice-architecture',
    title: '微服务架构设计要点',
    category: '后端',
    tags: ['微服务', '架构', '分布式'],
    description: '从服务拆分到通信协议，理解微服务架构的核心模式与常见陷阱。',
    date: '2026-07-17',
    views: 814,
    cover: '',
    content: `# 微服务架构设计要点

微服务将单体应用拆分为独立部署的小服务。

## 服务拆分原则

按业务能力拆分，而非技术层：

\`\`\`text
# 单体架构
/ - 用户模块
/ - 订单模块
/ - 商品模块

# 微服务架构（推荐）
user-service    -> 端口 8001
order-service   -> 端口 8002
product-service -> 端口 8003
\`\`\`

## 通信方式

| 方式 | 协议 | 适用场景 |
| :--- | :--- | :--- |
| 同步 | HTTP/REST | 简单查询 |
| 同步 | gRPC | 高性能内部调用 |
| 异步 | 消息队列 | 解耦、削峰 |

### 服务注册与发现

\`\`\`go
// 使用 Consul / Nacos 注册服务
func registerService() {
    reg := api.NewRegistration()
    reg.Name = "user-service"
    reg.Address = "10.0.0.1"
    reg.Port = 8001
    consul.Agent().ServiceRegister(reg)
}
\`\`\`

## 分布式事务

\`\`\`text
1. 两阶段提交 (2PC) - 强一致，性能差
2. TCC - 最终一致，复杂
3. Saga - 最终一致，适合长流程
4. 本地消息表 - 最终一致，简单
\`\`\`

### 熔断与降级

\`\`\`go
// Hystrix 风格熔断
hystrix.Go("user-service", func() error {
    return callUserService()
}, func(err error) error {
    return fallback() // 降级逻辑
})
\`\`\`

> 微服务不是银弹：团队规模小、业务简单时，单体架构往往更高效。`
  },
  {
    id: 'css-grid-layout',
    title: 'CSS Grid 网格布局指南',
    category: '前端',
    tags: ['CSS', 'Grid', '布局'],
    description: '掌握 CSS Grid 二维布局系统，实现复杂的页面结构与响应式设计。',
    date: '2026-07-14',
    views: 445,
    cover: '',
    content: `# CSS Grid 网格布局指南

CSS Grid 是强大的二维布局系统，适合复杂的页面结构。

## 基础用法

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto;
  gap: 16px;
}
\`\`\`

## 常见布局

### 圣杯布局

\`\`\`css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.nav    { grid-area: nav; }
.main   { grid-area: main; }
.aside  { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

## 关键属性

| 属性 | 作用 |
| :--- | :--- |
| grid-template-columns | 定义列 |
| grid-template-rows | 定义行 |
| grid-template-areas | 命名区域 |
| gap | 间距 |
| justify-items | 水平对齐 |
| align-items | 垂直对齐 |

### 响应式自动换行

\`\`\`css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
\`\`\`

> Grid 适合二维布局，Flexbox 适合一维布局，两者配合能解决几乎所有布局需求。`
  },
  {
    id: 'nodejs-event-loop',
    title: 'Node.js 事件循环机制',
    category: '后端',
    tags: ['Node.js', '事件循环', '异步'],
    description: '深入理解 Node.js 事件循环的六个阶段，掌握微任务与宏任务的执行顺序。',
    date: '2026-07-10',
    views: 567,
    cover: '',
    content: `# Node.js 事件循环机制

事件循环是 Node.js 异步非阻塞 I/O 的核心。

## 六个阶段

\`\`\`text
┌───────────────────────┐
│   timers (定时器)       │  <- setTimeout / setInterval
├───────────────────────┤
│   pending callbacks    │  <- 系统级回调
├───────────────────────┤
│   idle, prepare        │
├───────────────────────┤
│   poll (轮询)           │  <- I/O 回调
├───────────────────────┤
│   check (检查)          │  <- setImmediate
├───────────────────────┤
│   close callbacks      │  <- close 事件
└───────────────────────┘
\`\`\`

## 微任务 vs 宏任务

\`\`\`js
console.log('1. 同步')

setTimeout(() => console.log('4. 宏任务'), 0)

Promise.resolve().then(() => console.log('3. 微任务'))

process.nextTick(() => console.log('2. nextTick'))

console.log('1. 同步结束')
// 输出顺序: 1 -> 1 -> 2 -> 3 -> 4
\`\`\`

## 执行顺序

| 优先级 | 类型 | 示例 |
| :--- | :--- | :--- |
| 最高 | 同步代码 | 普通语句 |
| 高 | process.nextTick | nextTick 回调 |
| 中 | 微任务 | Promise.then |
| 低 | 宏任务 | setTimeout / setImmediate |

### 阻塞事件循环

\`\`\`js
// 危险！CPU 密集任务会阻塞事件循环
function heavyCalc() {
  for (let i = 0; i < 1e9; i++) {} // 阻塞所有 I/O
}

// 正确做法：分片执行或用 Worker
const { Worker } = require('worker_threads')
new Worker('./heavy-task.js')
\`\`\`

> 记住：Node.js 适合 I/O 密集型任务，不适合 CPU 密集型任务。`
  },
  {
    id: 'jwt-auth-mechanism',
    title: 'JWT 认证机制详解',
    category: '后端',
    tags: ['JWT', '认证', '安全'],
    description: '理解 JSON Web Token 的结构与工作原理，实现安全的无状态认证方案。',
    date: '2026-07-06',
    views: 489,
    cover: '',
    content: `# JWT 认证机制详解

JWT 是一种无状态的认证方案，广泛应用于前后端分离架构。

## JWT 结构

\`\`\`text
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.signature
|        Header        |       Payload      | Signature |
\`\`\`

## 生成与验证

\`\`\`js
const jwt = require('jsonwebtoken')

// 签发 Token
const token = jwt.sign(
  { userId: 123, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// 验证 Token
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  console.log(payload.userId) // 123
} catch (e) {
  // token 无效或过期
}
\`\`\`

## 存储方式对比

| 方式 | XSS | CSRF | 适合场景 |
| :--- | :--- | :--- | :--- |
| localStorage | 易受攻击 | 安全 | SPA |
| Cookie (httpOnly) | 安全 | 需防护 | 传统 Web |
| Cookie + SameSite | 安全 | 安全 | 推荐 |

### 刷新 Token 机制

\`\`\`js
// 双 Token 策略
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' })
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' })

// 接口：用 refreshToken 换新的 accessToken
app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken
  try {
    const payload = jwt.verify(refreshToken, refreshSecret)
    const newAccessToken = jwt.sign({ userId: payload.userId }, secret, { expiresIn: '15m' })
    res.json({ accessToken: newAccessToken })
  } catch {
    res.status(401).send('请重新登录')
  }
})
\`\`\`

## 安全清单

| 措施 | 说明 |
| :--- | :--- |
| 使用强密钥 | 至少 256 位随机字符串 |
| 设置过期时间 | access token 短，refresh token 长 |
| HTTPS 传输 | 防止中间人攻击 |
| 黑名单机制 | 用户登出时使 token 失效 |

> JWT 无状态的代价：无法主动让某个 token 失效，需要配合 Redis 黑名单。`
  },
  {
    id: 'kubernetes-getting-started',
    title: 'Kubernetes 入门指南',
    category: '运维',
    tags: ['Kubernetes', '容器编排', '云原生'],
    description: '从 Pod、Deployment 到 Service，理解 Kubernetes 核心概念与基本操作。',
    date: '2026-07-02',
    views: 702,
    cover: '',
    content: `# Kubernetes 入门指南

Kubernetes（K8s）是容器编排的事实标准，管理大规模容器化应用。

## 核心概念

\`\`\`text
Pod         -> 最小调度单元，包含一个或多个容器
Deployment  -> 管理 Pod 副本与滚动更新
Service     -> 提供稳定的网络访问入口
Ingress     -> 七层路由入口
ConfigMap   -> 配置管理
Secret      -> 敏感数据
\`\`\`

## Deployment 示例

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            limits:
              memory: "128Mi"
              cpu: "500m"
\`\`\`

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| \`kubectl get pods\` | 查看 Pod |
| \`kubectl apply -f\` | 应用配置 |
| \`kubectl logs\` | 查看日志 |
| \`kubectl exec -it\` | 进入容器 |
| \`kubectl scale\` | 扩缩容 |
| \`kubectl rollout\` | 滚动更新 |

### Service 暴露服务

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
\`\`\`

## 探针机制

\`\`\`yaml
livenessProbe:        # 存活探针：失败则重启
  httpGet:
    path: /health
    port: 80
readinessProbe:       # 就绪探针：失败则不接收流量
  httpGet:
    path: /ready
    port: 80
\`\`\`

> 学习路径：先理解 Pod 和 Service，再学 Deployment，最后研究 StatefulSet 和 Operator。`
  }
]

export const useBlogStore = defineStore('blog', () => {
  // ====== State ======
  // 用户创建的文章（持久化到 localStorage）
  const userPosts = ref(loadUserPosts())
  // 文章列表 = 用户文章 + 示例文章（用户文章排在前面）
  const posts = ref([
    ...userPosts.value.map(p => ({ ...p })),
    ...sampleBlogs.map(p => ({ ...p }))
  ])

  // ====== Getters ======
  // 所有分类
  const categories = computed(() => {
    const set = new Set()
    posts.value.forEach(p => set.add(p.category))
    return ['全部', ...set]
  })

  // 所有标签
  const allTags = computed(() => {
    const set = new Set()
    posts.value.forEach(p => p.tags.forEach(t => set.add(t)))
    return [...set]
  })

  // 按发布时间降序排列
  const sortedPosts = computed(() => {
    return [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // 最新文章（前 5 篇）
  const latestPosts = computed(() => sortedPosts.value.slice(0, 5))

  // 按 id 获取文章
  const getById = computed(() => (id) => {
    return posts.value.find(p => p.id === id) || null
  })

  // 按分类筛选
  const filterByCategory = computed(() => (category) => {
    if (!category || category === '全部') return sortedPosts.value
    return sortedPosts.value.filter(p => p.category === category)
  })

  // 按标签筛选
  const filterByTag = computed(() => (tag) => {
    if (!tag || tag === '全部') return sortedPosts.value
    return sortedPosts.value.filter(p => p.tags.includes(tag))
  })

  // 按关键词搜索（匹配标题、描述、内容）
  const searchByKeyword = computed(() => (keyword, list) => {
    const source = list || sortedPosts.value
    if (!keyword || !keyword.trim()) return source
    const kw = keyword.trim().toLowerCase()
    return source.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      p.content.toLowerCase().includes(kw) ||
      p.tags.some(t => t.toLowerCase().includes(kw))
    )
  })

  // 统计信息
  const stats = computed(() => ({
    articles: posts.value.length,
    tags: allTags.value.length,
    categories: categories.value.length - 1 // 排除"全部"
  }))

  // 获取相邻文章（上一篇/下一篇，按时间排序）
  const getAdjacent = computed(() => (id) => {
    const sorted = sortedPosts.value
    const idx = sorted.findIndex(p => p.id === id)
    // 上一篇 = 日期更早的（排序后 index 更大）
    const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null
    // 下一篇 = 日期更晚的（排序后 index 更小）
    const next = idx > 0 ? sorted[idx - 1] : null
    return { prev, next }
  })

  // 增加浏览量
  function incrementViews(id) {
    const post = posts.value.find(p => p.id === id)
    if (post) post.views = (post.views || 0) + 1
  }

  // 生成唯一 ID
  function generateId(title) {
    const ts = Date.now().toString(36)
    const slug = (title || 'post')
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'post'
    return `${slug}-${ts}`
  }

  // 添加新文章（用户创建）—— 持久化到 localStorage
  // 新文章自动出现在博客列表顶部（按时间排序）
  function addPost(data) {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const newPost = {
      id: data.id || generateId(data.title),
      title: (data.title || '').trim() || '未命名文章',
      category: data.category || '前端',
      tags: Array.isArray(data.tags) ? data.tags.filter(t => t) : [],
      description: (data.description || '').trim(),
      date: data.date || dateStr,
      views: 0,
      cover: data.cover || '',
      content: data.content || '',
      userCreated: true
    }
    // 插入到 posts 数组最前（用户文章区）
    posts.value.unshift(newPost)
    userPosts.value.unshift({ ...newPost })
    saveUserPosts(userPosts.value)
    return newPost
  }

  // 更新文章（仅用户创建的可编辑）
  function updatePost(id, updates) {
    const idx = posts.value.findIndex(p => p.id === id && p.userCreated)
    if (idx === -1) return false
    posts.value[idx] = { ...posts.value[idx], ...updates }
    // 同步更新 userPosts 并持久化
    const uIdx = userPosts.value.findIndex(p => p.id === id)
    if (uIdx !== -1) {
      userPosts.value[uIdx] = { ...userPosts.value[uIdx], ...updates }
      saveUserPosts(userPosts.value)
    }
    return true
  }

  // 删除文章（仅用户创建的可删除）
  function deletePost(id) {
    const idx = posts.value.findIndex(p => p.id === id && p.userCreated)
    if (idx === -1) return false
    posts.value.splice(idx, 1)
    const uIdx = userPosts.value.findIndex(p => p.id === id)
    if (uIdx !== -1) {
      userPosts.value.splice(uIdx, 1)
      saveUserPosts(userPosts.value)
    }
    return true
  }

  return {
    posts,
    categories,
    allTags,
    sortedPosts,
    latestPosts,
    getById,
    filterByCategory,
    filterByTag,
    searchByKeyword,
    stats,
    getAdjacent,
    incrementViews,
    addPost,
    updatePost,
    deletePost
  }
})
