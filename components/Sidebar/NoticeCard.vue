<template>
  <div
    class="bg-gradient-to-br from-[#0284C7]/10 to-[#38bdf8]/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#0284C7]/20 dark:border-[#38bdf8]/20 relative overflow-hidden group"
  >
    <!-- 装饰背景 -->
    <div
      class="absolute -top-10 -right-10 w-32 h-32 bg-[#0284C7]/10 dark:bg-[#38bdf8]/10 rounded-full blur-2xl group-hover:bg-[#0284C7]/20 transition-colors duration-500"
    ></div>

    <div class="relative z-10">
      <h3
        class="text-lg font-bold text-[#0284C7] dark:text-[#38bdf8] mb-3 flex items-center gap-2"
      >
        <svg
          class="w-5 h-5 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
        站点公告
      </h3>

      <div
        class="text-sm text-[#4B5563] dark:text-[#d1d5db] leading-relaxed space-y-2"
      >
        <p>🎉 欢迎来到 NanoicBLOG！</p>
        <p>这里是公告！当前网站还在建设中...</p>
        <p>
          如有任何问题或建议，欢迎在
          <a
            href="https://github.com/Nanoic39/NBLOG"
            target="_blank"
            class="text-[#0284C7] dark:text-[#38bdf8]"
            >项目仓库</a
          >
          提交 issue。
        </p>
      </div>

      <div
        class="mt-4 flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9ca3af]"
      >
        <span class="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
        <span>运行正常中...</span>
        <span class="mx-1">|</span>
        <span>v1.0.0</span>
      </div>
    </div>
  </div>
</template>
