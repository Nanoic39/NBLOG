<template>
  <button
    @click="toggleDark"
    :title="isDark ? '切换到日间模式' : '切换到夜间模式'"
    class="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-all duration-300 hover:scale-110 bg-white text-[#2A2E33] dark:bg-[#2a2a2a] dark:text-[#e0e0e0]"
    style="box-shadow: 0 4px 16px rgba(0,0,0,0.12);"
  >
    <Transition name="icon" mode="out-in">
      <span v-if="isDark" key="sun">☀️</span>
      <span v-else key="moon">🌙</span>
    </Transition>
  </button>
</template>

<script setup lang="ts">
// useDarkMode 由 Nuxt 自动从 composables/ 目录导入，无需手动 import
const { isDark, toggleDark } = useDarkMode()
</script>

<style scoped>
.icon-enter-active,
.icon-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.icon-enter-from {
  opacity: 0;
  transform: rotate(-30deg) scale(0.7);
}
.icon-leave-to {
  opacity: 0;
  transform: rotate(30deg) scale(0.7);
}
</style>
