import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Blog from '../views/Blog.vue' // [NEW] 博客列表页
import Docs from '../views/Docs.vue'
import PostDetail from '../views/PostDetail.vue'
import PostEditor from '../views/PostEditor.vue' // [NEW] 博客编辑器
import Tweets from '../views/Tweets.vue'
import Photos from '../views/Photos.vue'
import AlbumDetail from '../views/AlbumDetail.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  // [NEW] 博客模块（独立于文档）
  { path: '/blog', name: 'blog', component: Blog },
  // [NEW] 博客文章详情页（使用 blog store 数据）
  { path: '/post/:id', name: 'post-detail', component: PostDetail },
  // [NEW] 博客编辑器（写博客）
  { path: '/post-editor', name: 'post-editor', component: PostEditor },
  { path: '/docs', name: 'docs', component: Docs },
  { path: '/docs/:slug', name: 'doc-detail', component: Docs },
  { path: '/tweets', name: 'tweets', component: Tweets },
  { path: '/photos', name: 'photos', component: Photos },
  // ====== 新增：相册详情页 ======
  { path: '/photos/:id', name: 'album-detail', component: AlbumDetail },
  { path: '/about', name: 'about', component: About },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
