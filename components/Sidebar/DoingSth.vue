<template>
  <div
    class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-100/50 dark:border-gray-700/50"
  >
    <h3
      class="text-sm font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-3 flex items-center gap-1.5"
    >
      <svg
        class="w-3.5 h-3.5 text-[#10b981]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      正在做什么？
    </h3>

    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-[#4B5563] dark:text-[#d1d5db] leading-relaxed">
          <span class="font-bold text-[#0284C7] dark:text-[#38bdf8]">NANOIC</span>
          已经 {{ doingData?.action }} 了
          <span class="font-semibold text-[#2A2E33] dark:text-[#e0e0e0]">{{ doingData?.target }}</span>
          {{ doingData?.type }}
          <span class="font-mono font-bold text-[#f59e0b]">{{ timeDiff.value }}</span>
          {{ timeDiff.unit }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const { data: doingData } = await useFetch('/api/doing');

const timeDiff = ref({ value: 0, unit: '秒' });
let timer: NodeJS.Timeout | null = null;

const updateDiff = () => {
  if (!doingData.value?.startTime) return;
  
  const start = parseInt(doingData.value.startTime);
  const now = Date.now(); // 使用毫秒
  const diffSeconds = Math.floor((now - start) / 1000); // 转换为秒进行计算
  
  if (diffSeconds < 0) {
    timeDiff.value = { value: 0, unit: '秒' };
  } else if (diffSeconds < 60) {
    timeDiff.value = { value: diffSeconds, unit: '秒' };
  } else if (diffSeconds < 3600) {
    timeDiff.value = { value: Math.floor(diffSeconds / 60), unit: '分钟' };
  } else if (diffSeconds < 86400) {
    timeDiff.value = { value: Math.floor(diffSeconds / 3600), unit: '小时' };
  } else {
    timeDiff.value = { value: Math.floor(diffSeconds / 86400), unit: '天' };
  }
};

onMounted(() => {
  updateDiff();
  // 每秒更新一次时间显示
  timer = setInterval(updateDiff, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
