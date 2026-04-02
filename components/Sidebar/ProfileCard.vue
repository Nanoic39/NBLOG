<template>
  <div
    class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50"
  >
    <div class="flex flex-col items-center">
      <!-- 头像 -->
      <div
        class="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#BFE9FF] to-[#FFE9F3] mb-4 shadow-md group"
      >
        <div
          class="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-[#242424]"
        >
          <img
            :src="headImage"
            alt="Profile"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      <!-- 名字 -->
      <h3 class="text-xl font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-1">
        NANOIC
      </h3>
      <p class="text-sm text-[#6B7280] dark:text-[#9ca3af] mb-4 font-mono">
        @nanoic
      </p>

      <!-- 通知区域 -->
      <div v-if="notice" class="w-full mb-6 text-left relative rounded-lg" :class="[
        notice.theme === 'rainbow' ? 'p-[2px] rainbow-border-wrapper' : '',
        notice.theme === 'info' ? 'border border-blue-100/50 dark:border-blue-800/30' : '',
        notice.theme === 'warning' ? 'border border-yellow-200/50 dark:border-yellow-800/30' : '',
        notice.theme === 'feature' ? 'border border-emerald-200/50 dark:border-emerald-800/30' : ''
      ]">
        <!-- 内容容器 -->
        <div class="bg-gray-50/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-3 w-full h-full relative z-10">
          <h4 class="text-xs font-bold mb-2 flex items-center gap-1.5" :class="{
            'text-yellow-500': notice.theme === 'warning',
            'text-blue-500': notice.theme === 'info',
            'text-emerald-500': notice.theme === 'feature',
            'text-pink-500': notice.theme === 'rainbow',
            'text-[#2A2E33] dark:text-[#e0e0e0]': !notice.theme
          }">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- info 图标 -->
              <path v-if="notice.theme === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <!-- warning 图标 -->
              <path v-else-if="notice.theme === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              <!-- feature (施工) 图标 -->
              <path v-else-if="notice.theme === 'feature'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z M9 15l-4 4 M15 9l4-4" />
              <!-- rainbow 图标 (闪耀 Sparkles) -->
              <path v-else-if="notice.theme === 'rainbow'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              <!-- 默认图标 -->
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            {{ notice.title }}
          </h4>
          <div class="h-24 overflow-y-auto text-sm text-[#4B5563] dark:text-[#d1d5db] leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {{ notice.content }}
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="flex justify-between w-full px-4 mb-6">
        <div class="flex flex-col items-center group cursor-default">
          <span
            class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors"
            >{{ postCount || 0 }}</span
          >
          <span class="text-xs text-[#9CA3AF] uppercase tracking-wide"
            >文章</span
          >
        </div>
        <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex flex-col items-center group cursor-default">
          <span
            class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors"
            >{{ categoryCount || 0 }}</span
          >
          <span class="text-xs text-[#9CA3AF] uppercase tracking-wide"
            >分类</span
          >
        </div>
        <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex flex-col items-center group cursor-default">
          <span
            class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors"
            >{{ tagCount || 0 }}</span
          >
          <span class="text-xs text-[#9CA3AF] uppercase tracking-wide"
            >标签</span
          >
        </div>
      </div>

      <!-- 社交按钮 -->
      <div class="flex gap-3 w-full justify-center">
        <a
          href="https://github.com/Nanoic"
          target="_blank"
          class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-[#4B5563] dark:text-[#9ca3af] hover:bg-[#24292e] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-all duration-300"
          title="GitHub"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
        <a
          href="mailto:nanoic39@gmail.com"
          class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-[#4B5563] dark:text-[#9ca3af] hover:bg-[#EA4335] hover:text-white transition-all duration-300"
          title="Email"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </a>
        <a
          href="https://x.com/NaNo1c_39"
          target="_blank"
          class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-[#4B5563] dark:text-[#9ca3af] hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"
          title="X (Twitter)"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeadImage } from '~/composables/useHeadImage';

const headImage = useHeadImage();
const config = useRuntimeConfig();
const backendBaseUrl = String(config.public.backendBaseUrl || '').replace(/\/+$/, '');

defineProps<{
  postCount?: number;
  categoryCount?: number;
  tagCount?: number;
}>();

const { data: noticeData } = await useFetch('/api/notice', {
  baseURL: backendBaseUrl || undefined,
  credentials: 'include'
});

const notice = computed(() => {
  const raw = noticeData.value as any;
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw.find((item) => item?.active !== false) || raw[0] || null;
  }
  if (raw.data && Array.isArray(raw.data)) {
    return raw.data.find((item: any) => item?.active !== false) || raw.data[0] || null;
  }
  if (raw.data && typeof raw.data === 'object') return raw.data;
  return raw;
});
</script>

<style scoped>
/* RGB彩虹边框动画包装器 */
.rainbow-border-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rainbow-anim 3s linear infinite;
  pointer-events: none;
}

@keyframes rainbow-anim {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}
</style>
