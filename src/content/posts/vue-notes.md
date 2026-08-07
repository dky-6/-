---
title: Vue 3 组合式 API 学习笔记
category: 前端
date: 2026-08-02
---

# Vue 3 组合式 API

Vue 3 的组合式 API（Composition API）让我们能够更灵活地组织组件逻辑。

## setup 函数

`setup` 是组合式 API 的入口，在组件创建之前执行：

```js
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    return { count, double }
  }
}
```

## `<script setup>` 语法糖

更简洁的写法，推荐使用：

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

## 响应式核心

- `ref`：基本类型 / 对象的响应式包装
- `reactive`：对象的深度响应式
- `computed`：计算属性
- `watch` / `watchEffect`：侦听器

## 生命周期钩子

| 选项式 API | 组合式 API |
| :--- | :--- |
| created | setup() |
| mounted | onMounted |
| updated | onUpdated |
| unmounted | onUnmounted |

> 组合式 API 让逻辑复用更自然，告别了 Options API 时代的 mixins 命名冲突问题。
