<script setup>
import { ref, computed } from 'vue'

const now = ref(new Date())

// 日历数据
const year = computed(() => now.value.getFullYear())
const month = computed(() => now.value.getMonth())
const today = computed(() => now.value.getDate())

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 生成日历网格
const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1).getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const days = []

  // 前置空白
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', isToday: false })
  }
  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, isToday: d === today.value })
  }
  return days
})
</script>

<template>
  <div class="calendar-widget">
    <div class="cal-header">
      <span class="cal-month">{{ year }}年 {{ monthNames[month] }}</span>
    </div>
    <div class="cal-weekdays">
      <span
        v-for="(w, i) in weekDays"
        :key="w"
        class="cal-weekday"
        :class="{ weekend: i === 0 || i === 6 }"
      >{{ w }}</span>
    </div>
    <div class="cal-grid">
      <span
        v-for="(cell, i) in calendarDays"
        :key="i"
        class="cal-day"
        :class="{
          today: cell.isToday,
          empty: cell.day === '',
          weekend: cell.day !== '' && (i % 7 === 0 || i % 7 === 6)
        }"
      >
        {{ cell.day }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.calendar-widget {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cal-header {
  text-align: center;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-border);
}

.cal-month {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  font-weight: bold;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.cal-weekday {
  text-align: center;
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-text-light);
  padding: 2px 0;
}

.cal-weekday.weekend {
  color: var(--color-primary);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  flex: 1;
}

.cal-day {
  text-align: center;
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--color-text);
  padding: 3px 0;
  border-radius: 2px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-day.empty {
  visibility: hidden;
}

.cal-day.weekend {
  color: var(--color-primary-light);
}

.cal-day.today {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: bold;
  box-shadow: inset 0 0 0 2px var(--color-primary-light);
}
</style>
