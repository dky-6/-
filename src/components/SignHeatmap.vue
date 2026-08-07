<script setup>
import { computed } from 'vue'

// 生成过去一年的签到数据
const weeks = computed(() => {
  const data = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 365)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const current = new Date(startDate)
  let week = []

  while (current <= today) {
    const level = Math.random() < 0.35
      ? Math.floor(Math.random() * 5)
      : (Math.random() < 0.5 ? Math.floor(Math.random() * 3) : 0)
    week.push({
      date: new Date(current),
      level
    })
    current.setDate(current.getDate() + 1)
    if (week.length === 7) {
      data.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    // 填充到7天
    while (week.length < 7) {
      week.push({ date: null, level: -1 })
    }
    data.push(week)
  }
  return data
})

// 计算统计数据
const totalDays = computed(() => {
  let count = 0
  weeks.value.forEach(week => {
    week.forEach(cell => {
      if (cell.level > 0) count++
    })
  })
  return count
})

const maxLevel = 4
const levelColors = [
  'transparent',
  'rgba(255, 107, 107, 0.25)',
  'rgba(255, 107, 107, 0.45)',
  'rgba(255, 107, 107, 0.7)',
  'rgba(255, 107, 107, 0.95)'
]

const monthLabels = computed(() => {
  const labels = []
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    labels.push({
      label: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][d.getMonth()],
      weekIndex: Math.floor(i * 4.3)
    })
  }
  return labels
})
</script>

<template>
  <div class="heatmap-widget">
    <div class="heatmap-header">
      <span class="heatmap-title">📊 活跃天数</span>
      <span class="heatmap-count">{{ totalDays }} 天</span>
    </div>

    <div class="heatmap-container">
      <!-- 月份标签 -->
      <div class="month-labels">
        <span
          v-for="(m, i) in monthLabels"
          :key="i"
          :style="{ marginLeft: i === 0 ? '0' : m.weekIndex + 'px' }"
        >{{ m.label }}</span>
      </div>

      <div class="heatmap-body">
        <!-- 星期标签 -->
        <div class="day-labels">
          <span>一</span>
          <span>三</span>
          <span>五</span>
        </div>

        <!-- 热力图网格 -->
        <div class="grid-wrapper">
          <div
            v-for="(week, wi) in weeks"
            :key="wi"
            class="grid-week"
          >
            <div
              v-for="(cell, di) in week"
              :key="di"
              class="grid-cell"
              :style="{
                background: cell.level >= 0
                  ? levelColors[cell.level]
                  : 'transparent',
                visibility: cell.level < 0 ? 'hidden' : 'visible'
              }"
              :title="cell.date ? `${cell.date.getFullYear()}-${String(cell.date.getMonth()+1).padStart(2,'0')}-${String(cell.date.getDate()).padStart(2,'0')} 活跃 ${cell.level} 次` : ''"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="heatmap-legend">
      <span>少</span>
      <span
        v-for="(color, i) in levelColors"
        :key="i"
        class="legend-cell"
        :style="{ background: color, border: i === 0 ? '1px solid rgba(90,74,58,0.2)' : 'none' }"
      ></span>
      <span>多</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap-widget {
  width: 100%;
  padding: 8px 4px;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border);
}

.heatmap-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  font-weight: bold;
}

.heatmap-count {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-primary-dark);
  font-weight: bold;
}

.heatmap-container {
  overflow-x: auto;
}

.heatmap-container::-webkit-scrollbar {
  height: 4px;
}

.heatmap-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.month-labels {
  display: flex;
  font-family: var(--font-code);
  font-size: 9px;
  color: var(--color-text-light);
  margin-bottom: 4px;
  padding-left: 20px;
  min-width: max-content;
}

.month-labels span {
  white-space: nowrap;
  min-width: 28px;
}

.heatmap-body {
  display: flex;
  gap: 4px;
  min-width: max-content;
}

.day-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 4px;
  font-family: var(--font-code);
  font-size: 8px;
  color: var(--color-text-light);
  padding-top: 2px;
}

.day-labels span {
  height: 10px;
  line-height: 10px;
}

.grid-wrapper {
  display: flex;
  gap: 4px;
}

.grid-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.grid-cell {
  width: 10px;
  height: 10px;
  border-radius: 1px;
  border: 1px solid rgba(247, 240, 230, 0.1);
  transition: transform 0.1s;
}

.grid-cell:hover {
  transform: scale(1.3);
  border-color: var(--color-text);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 10px;
  font-family: var(--font-code);
  font-size: 9px;
  color: var(--color-text-light);
}

.legend-cell {
  width: 10px;
  height: 10px;
  border-radius: 1px;
}
</style>
