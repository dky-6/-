<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useTheme } from './composables/useTheme'

const { themeMode } = useTheme()

const showSettings = ref(false)

function openSettings() {
  showSettings.value = true
}
</script>

<template>
  <NavBar @open-settings="openSettings" />
  <main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="pixel-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <Footer />
  <SettingsPanel v-model:visible="showSettings" />
</template>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 路由切换像素风过渡 */
.pixel-fade-enter-active,
.pixel-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pixel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.pixel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
