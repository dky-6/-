<script setup>
import { computed, onMounted } from 'vue'
import { useCheckinStore } from '../stores/checkin.js'

const checkinStore = useCheckinStore()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const todayDateStr = computed(() => {
  return checkinStore.todayStr
})

const isTodayChecked = computed(() => {
  return checkinStore.isChecked(todayDateStr.value)
})

const currentYear = computed(() => checkinStore.currentYear)
const currentMonth = computed(() => checkinStore.currentMonth)

const monthTitle = computed(() => {
  return `${currentYear.value}年${currentMonth.value}月`
})

const checkedMap = computed(() => {
  return checkinStore.currentMonthCheckins
})

const calendarCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = new Date(year, month - 1, 0).getDate()

  const cells = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const prevMonthDate = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const dateStr = `${prevYear}-${String(prevMonthDate).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      day,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      isChecked: false
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayDateStr.value,
      isChecked: !!checkedMap.value[dateStr]
    })
  }

  const totalCells = firstDay + daysInMonth
  const remaining = (7 - (totalCells % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const nextMonthDate = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const dateStr = `${nextYear}-${String(nextMonthDate).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      isChecked: false
    })
  }

  return cells
})

const checkedCount = computed(() => {
  return Object.keys(checkedMap.value).length
})

const totalDaysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate()
})

function handleCheckin() {
  if (!isTodayChecked.value) {
    checkinStore.checkin(todayDateStr.value)
  }
}

function goPrevMonth() {
  checkinStore.prevMonth()
}

function goNextMonth() {
  checkinStore.nextMonth()
}

onMounted(() => {
  const now = new Date()
  checkinStore.setCurrentMonth(now.getFullYear(), now.getMonth() + 1)
})
</script>

<template>
  <div class="checkin-widget">
    <div class="checkin-header">
      <h3 class="checkin-title">📅 每日签到</h3>
      <div class="checkin-stats">
        <span class="stat-checked">✓ {{ checkedCount }}</span>
        <span class="stat-total">/ {{ totalDaysInMonth }} 天</span>
      </div>
    </div>

    <div class="checkin-action">
      <button
        v-if="!isTodayChecked"
        class="checkin-btn"
        @click="handleCheckin"
      >
        点击签到
      </button>
      <div v-else class="checked-today">
        <span class="checked-icon">✓</span>
        <span class="checked-text">已签到</span>
      </div>
    </div>

    <div class="calendar-nav">
      <button class="nav-btn" @click="goPrevMonth" aria-label="上个月">
        ◀
      </button>
      <span class="calendar-title">{{ monthTitle }}</span>
      <button class="nav-btn" @click="goNextMonth" aria-label="下个月">
        ▶
      </button>
    </div>

    <div class="calendar-weekdays">
      <span
        v-for="(w, i) in weekDays"
        :key="w"
        class="cal-weekday"
        :class="{ weekend: i === 0 || i === 6 }"
      >{{ w }}</span>
    </div>

    <div class="calendar-grid">
      <div
        v-for="(cell, i) in calendarCells"
        :key="i"
        class="cal-cell"
        :class="{
          'other-month': !cell.isCurrentMonth,
          'is-today': cell.isToday,
          'is-checked': cell.isChecked,
          'is-weekend': cell.isCurrentMonth && (i % 7 === 0 || i % 7 === 6)
        }"
      >
        <span class="cal-day">{{ cell.day }}</span>
        <span v-if="cell.isChecked" class="cal-check">✅</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkin-widget {
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--color-border);
}

.checkin-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
  margin: 0;
}

.checkin-stats {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-checked {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--color-primary);
}

.stat-total {
  font-family: var(--font-code);
  font-size: 14px;
  color: var(--color-text-light);
}

.checkin-action {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
}

.checkin-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-title);
  font-size: 12px;
  padding: 10px 28px;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.checkin-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-border);
}

.checkin-btn:active {
  transform: translate(3px, 3px);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 1px var(--color-border);
}

.checked-today {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 28px;
  background: var(--color-bg);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 3px var(--color-border);
  border-radius: 2px;
}

.checked-icon {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: bold;
}

.checked-text {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.nav-btn {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-code);
  font-size: 14px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 2px var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: none;
}

.nav-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translate(1px, 1px);
}

.nav-btn:active {
  transform: translate(2px, 2px);
  box-shadow:
    inset 0 0 0 2px var(--color-border-light),
    0 0 0 1px var(--color-border);
}

.calendar-title {
  font-family: var(--font-title);
  font-size: 12px;
  color: var(--color-text);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-weekday {
  text-align: center;
  font-family: var(--font-title);
  font-size: 9px;
  color: var(--color-text-light);
  padding: 4px 0;
}

.cal-weekday.weekend {
  color: var(--color-primary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  background: var(--color-bg);
  box-shadow: inset 0 0 0 1px var(--color-border-light);
  border-radius: 2px;
  position: relative;
  transition: transform 0.1s;
}

.cal-cell.other-month {
  opacity: 0.35;
}

.cal-day {
  font-family: var(--font-code);
  font-size: 13px;
  color: var(--color-text);
  line-height: 1;
}

.cal-cell.is-weekend .cal-day {
  color: var(--color-primary-light);
}

.cal-cell.is-today {
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-primary-dark);
}

.cal-cell.is-today .cal-day {
  color: var(--color-text-inverse);
  font-weight: bold;
}

.cal-cell.is-checked {
  background: var(--color-secondary);
  box-shadow: inset 0 0 0 2px var(--color-secondary-light);
}

.cal-cell.is-checked .cal-day {
  color: var(--color-text-inverse);
  opacity: 0.9;
}

.cal-cell.is-checked.cal-check {
  font-size: 10px;
  line-height: 1;
}

.cal-cell.is-today.is-checked {
  background: var(--color-primary);
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 2px var(--color-primary-dark);
}

.cal-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  box-shadow:
    inset 0 0 0 1px var(--color-border-light),
    0 0 0 2px var(--color-primary);
}

.cal-cell.is-today:hover {
  box-shadow:
    inset 0 0 0 2px var(--color-primary-light),
    0 0 0 3px var(--color-primary-dark);
}

.cal-cell.is-checked:hover {
  box-shadow:
    inset 0 0 0 2px var(--color-secondary-light),
    0 0 0 2px var(--color-secondary);
}
</style>