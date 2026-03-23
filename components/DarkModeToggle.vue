<template>
  <button
    @click="handleToggle"
    :title="isDark ? '切换到日间模式' : '切换到夜间模式'"
    class="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400"
  >
    <Transition name="rotate" mode="out-in">
      <!-- Sun Icon -->
      <svg 
        v-if="isDark" 
        key="sun" 
        class="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- Moon Icon -->
      <svg 
        v-else 
        key="moon" 
        class="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </Transition>
  </button>
</template>

<script setup lang="ts">
const { isDark, toggleDark } = useDarkMode()

const handleToggle = (event: MouseEvent) => {
  // 检查浏览器是否支持 View Transitions API
  if (!document.startViewTransition) {
    toggleDark()
    return
  }

  // 获取点击位置
  const x = event.clientX
  const y = event.clientY

  // 计算扩散的最大半径（屏幕对角线）
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 开始视图过渡
  const transition = document.startViewTransition(() => {
    toggleDark()
  })

  // 当 DOM 更新完成后，执行扩散动画
  transition.ready.then(() => {
    const isDarkMode = isDark.value
    // 创建一个从点击点扩散的圆形剪裁路径
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]

    // 始终将动画应用到 ::view-transition-new(root)，无论切换方向
    // 并且不再使用 reverse()
    document.documentElement.animate(
      {
        clipPath: clipPath,
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  })
}
</script>

<style scoped>
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s ease;
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
