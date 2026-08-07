import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ====== 5 条示例说说 ====== */
const sampleTweets = [
  {
    id: 'tweet-1',
    avatar: '🧑‍🎨',
    username: '像素旅人',
    content: '今天在像素世界里探险！探索了神秘的地牢，找到了传说中的宝藏～ 游戏画面真的太美了，每一个像素都充满了故事感。',
    images: [],
    date: '2026-08-06T10:30:00',
    likes: 12,
    liked: false,
    comments: [
      { id: 'c1', avatar: '👾', username: '像素小怪兽', text: '太酷了！' },
      { id: 'c2', avatar: '🎮', username: '游戏达人', text: '求坐标！' }
    ],
    isPinned: true
  },
  {
    id: 'tweet-2',
    avatar: '🧑‍🎨',
    username: '像素旅人',
    content: '新学到的 CSS 技巧：用 box-shadow 绘制像素画！没想到吧？纯 CSS 就能画出各种像素图案，只要掌握了这个技巧，就能做超酷的像素风 UI 啦！',
    images: [],
    date: '2026-08-05T16:45:00',
    likes: 8,
    liked: true,
    comments: [
      { id: 'c3', avatar: '💻', username: '前端学徒', text: '学到了！' }
    ],
    isPinned: false
  },
  {
    id: 'tweet-3',
    avatar: '🧑‍🎨',
    username: '像素旅人',
    content: '整理了最近的学习笔记，准备写一篇关于 Vue 3 组合式 API 的文章。没想到组合式 API 这么强大，代码组织起来更清晰了！',
    images: [],
    date: '2026-08-04T20:15:00',
    likes: 15,
    liked: false,
    comments: [],
    isPinned: false
  },
  {
    id: 'tweet-4',
    avatar: '🧑‍🎨',
    username: '像素旅人',
    content: '分享一个超棒的开源项目：复古游戏 UI 设计系统！里面有很多像素风的设计资源和组件，简直是像素爱好者的宝藏！',
    images: [],
    date: '2026-08-03T09:00:00',
    likes: 22,
    liked: false,
    comments: [
      { id: 'c4', avatar: '🎨', username: '设计师', text: '收藏了！' },
      { id: 'c5', avatar: '⚡', username: '效率控', text: '好用到爆！' },
      { id: 'c6', avatar: '🔥', username: '技术博主', text: '期待你的评测' }
    ],
    isPinned: false
  },
  {
    id: 'tweet-5',
    avatar: '🧑‍🎨',
    username: '像素旅人',
    content: '今天的像素小技巧：限制调色板！复古游戏美术的精髓不在于用多少颜色，而在于如何用有限的颜色表达丰富的层次。4 种颜色也能画出精彩的画面～',
    images: [],
    date: '2026-08-02T14:20:00',
    likes: 6,
    liked: false,
    comments: [],
    isPinned: false
  }
]

/* ====== 随机评论头像 ====== */
const commentAvatars = ['👾', '🎮', '💻', '🎨', '⚡', '🔥', '🌟', '🚀', '💎', '🌈']

export const useTweetsStore = defineStore('tweets', () => {
  // ====== State ======
  const tweets = ref(sampleTweets.map(t => ({ ...t })))
  let tweetIdCounter = 100
  let commentIdCounter = 1000

  // ====== Getters ======
  // 按时间排序（置顶在前，其余按最新在前）
  const sortedTweets = computed(() => {
    return [...tweets.value].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      return new Date(b.date) - new Date(a.date)
    })
  })

  // 总说说数
  const totalCount = computed(() => tweets.value.length)

  // 今日发布数
  const todayCount = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tweets.value.filter(t => t.date.startsWith(today)).length
  })

  // ====== Actions ======
  // 发布新说说
  function addTweet(content, images = []) {
    const newTweet = {
      id: `tweet-${++tweetIdCounter}`,
      avatar: '🧑‍🎨',
      username: '像素旅人',
      content,
      images,
      date: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
      isPinned: false
    }
    tweets.value.unshift(newTweet)
    return newTweet
  }

  // 删除说说
  function deleteTweet(id) {
    const idx = tweets.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tweets.value.splice(idx, 1)
      return true
    }
    return false
  }

  // 点赞/取消点赞
  function toggleLike(id) {
    const tweet = tweets.value.find(t => t.id === id)
    if (tweet) {
      if (tweet.liked) {
        tweet.likes = Math.max(0, tweet.likes - 1)
      } else {
        tweet.likes += 1
      }
      tweet.liked = !tweet.liked
      return true
    }
    return false
  }

  // 添加评论
  function addComment(id, text) {
    const tweet = tweets.value.find(t => t.id === id)
    if (tweet && text.trim()) {
      const newComment = {
        id: `c-${++commentIdCounter}`,
        avatar: commentAvatars[Math.floor(Math.random() * commentAvatars.length)],
        username: '像素旅人',
        text: text.trim()
      }
      tweet.comments.push(newComment)
      return newComment
    }
    return null
  }

  // 置顶/取消置顶
  function togglePin(id) {
    const tweet = tweets.value.find(t => t.id === id)
    if (tweet) {
      tweet.isPinned = !tweet.isPinned
      return true
    }
    return false
  }

  return {
    tweets,
    sortedTweets,
    totalCount,
    todayCount,
    addTweet,
    deleteTweet,
    toggleLike,
    addComment,
    togglePin
  }
})
