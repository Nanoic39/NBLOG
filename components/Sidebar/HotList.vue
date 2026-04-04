<template>
  <div
    class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-100/50 dark:border-gray-700/50"
  >
    <h3
      class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-4 flex items-center gap-2"
    >
      <svg
        class="w-5 h-5 text-[#f59e0b]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
        />
      </svg>
      热门文章
    </h3>

    <div class="space-y-3">
      <NuxtLink
        v-for="(post, index) in hotList"
        :key="post.id"
        :to="`/posts/${post.slug}`"
        class="group flex items-start gap-3"
      >
        <span
          class="shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold rounded"
          :class="[
            index < 3
              ? 'bg-[#f59e0b] text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
          ]"
        >
          {{ index + 1 }}
        </span>
        <div class="flex-1 min-w-0">
          <h4
            class="text-sm font-medium text-[#2A2E33] dark:text-[#e0e0e0] group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors truncate"
            :title="post.title"
          >
            {{ post.title }}
          </h4>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-xs text-gray-400 flex items-center gap-1">
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ post.views || 0 }}
            </span>
            <span class="text-xs text-gray-400">
              {{ formatDate(post.pubDate) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
type HotPost = {
  id: string | number;
  slug: string;
  title: string;
  views?: number;
  pubDate: string;
};
const config = useRuntimeConfig();
const apiBaseUrl = String(config.public.backendBaseUrl || "").trim().replace(/\/+$/, "");
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};

const unwrapApiData = <T>(response: T | { data?: T } | null | undefined): T | null => {
  if (!response) return null;
  if (typeof response === "object" && "data" in (response as Record<string, unknown>)) {
    return ((response as { data?: T }).data ?? null) as T | null;
  }
  return response as T;
};

const { data: hotPosts } = await useFetch(withApiBase("/api/posts/hot"), {
  credentials: 'include',
  transform: (response) => unwrapApiData(response),
  query: { page: 1, size: 3 },
});

const hotList = computed<HotPost[]>(() => {
  const raw = hotPosts.value as any;
  if (Array.isArray(raw)) return raw as HotPost[];
  if (Array.isArray(raw?.posts)) return raw.posts as HotPost[];
  return [];
});

const formatDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
};
</script>
