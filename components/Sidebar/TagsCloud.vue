<template>
  <div
    class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50"
  >
    <h3
      class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-6 flex items-center gap-2"
    >
      <svg
        class="w-5 h-5 text-[#0284C7] dark:text-[#38bdf8]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      标签云
    </h3>

    <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-3">
      <NuxtLink
        v-for="tag in normalizedTags"
        :key="tag.name"
        :to="{ path: '/', query: { tag: tag.name, page: 1 } }"
        class="group relative inline-block transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:z-10 cursor-pointer"
        :style="getTagStyle(tag)"
        :title="`${tag.name} (${tag.count} 篇文章)`"
      >
        <span
          class="relative z-10 font-bold opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm"
        >
          {{ tag.name }}
        </span>
        <!-- 悬浮时的背景高亮，使用当前颜色 -->
        <div
          class="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 rounded-lg scale-125 transition-all duration-300 -z-0"
        ></div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Tag {
  name: string;
  count: number;
}

const props = withDefaults(
  defineProps<{
    tags?: Array<Partial<Tag> | string | null | undefined>;
  }>(),
  {
    tags: () => [],
  },
);

const normalizedTags = computed<Tag[]>(() => {
  const list = Array.isArray(props.tags) ? props.tags : [];
  return list
    .map((item) => {
      if (typeof item === "string") {
        return { name: String(item || "").trim(), count: 0 };
      }
      if (!item || typeof item !== "object") return null;
      const name = String((item as any).name || (item as any).tag || "").trim();
      if (!name) return null;
      const count = Number((item as any).count || (item as any).value || 0);
      return { name, count: Number.isFinite(count) ? count : 0 };
    })
    .filter((item): item is Tag => Boolean(item && item.name));
});

// 计算标签的最大和最小数量，用于确定字号缩放比例
const maxCount = computed(() => {
  if (normalizedTags.value.length === 0) return 1;
  return Math.max(...normalizedTags.value.map((t) => t.count));
});

const minCount = computed(() => {
  if (normalizedTags.value.length === 0) return 0;
  return Math.min(...normalizedTags.value.map((t) => t.count));
});

// 预设的一组适合日间和夜间模式的颜色
const colors = [
  "#0ea5e9", // sky-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
];

// 根据标签计算样式
const getTagStyle = (tag: Tag) => {
  const minSize = 14; // 最小字号 14px
  const maxSize = 28; // 最大字号 28px
  const diff = maxCount.value - minCount.value;

  // 线性计算字号
  let size = minSize;
  if (diff > 0) {
    size =
      minSize + ((tag.count - minCount.value) / diff) * (maxSize - minSize);
  } else if (tag.count > 0) {
    size = (minSize + maxSize) / 2;
  }

  // 根据标签名称生成一个确定的哈希值，确保同一个标签颜色始终一致
  let hash = 0;
  const tagName = String(tag?.name || "");
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const color = colors[hash % colors.length];

  return {
    fontSize: `${size}px`,
    color: color,
    lineHeight: "1.2",
  };
};
</script>
