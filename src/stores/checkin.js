import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'pixel-blog-checkins'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load check-in data from localStorage:', e)
  }
  return {}
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save check-in data to localStorage:', e)
  }
}

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref(loadFromStorage())

  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth() + 1)

  const todayStr = computed(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })

  const currentMonthCheckins = computed(() => {
    const y = currentYear.value
    const m = String(currentMonth.value).padStart(2, '0')
    const prefix = `${y}-${m}`
    const result = {}
    for (const key in checkins.value) {
      if (key.startsWith(prefix) && checkins.value[key] === true) {
        result[key] = true
      }
    }
    return result
  })

  function checkin(dateStr) {
    if (!dateStr) dateStr = todayStr.value
    checkins.value[dateStr] = true
    saveToStorage(checkins.value)
  }

  function isChecked(dateStr) {
    if (!dateStr) dateStr = todayStr.value
    return !!checkins.value[dateStr]
  }

  function getMonthCheckins(year, month) {
    const m = String(month).padStart(2, '0')
    const prefix = `${year}-${m}`
    const result = {}
    for (const key in checkins.value) {
      if (key.startsWith(prefix) && checkins.value[key] === true) {
        result[key] = true
      }
    }
    return result
  }

  function setCurrentMonth(year, month) {
    currentYear.value = year
    currentMonth.value = month
  }

  function prevMonth() {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }

  function nextMonth() {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }

  return {
    checkins,
    currentYear,
    currentMonth,
    todayStr,
    currentMonthCheckins,
    checkin,
    isChecked,
    getMonthCheckins,
    setCurrentMonth,
    prevMonth,
    nextMonth
  }
})