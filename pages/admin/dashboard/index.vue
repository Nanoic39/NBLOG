<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">控制台概览</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">查看当前站点核心运营数据</p>
      </div>
      <button
        @click="loadOverview"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white/70 dark:bg-slate-900/40"
      >
        {{ isLoading ? "刷新中..." : "刷新数据" }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400">文章总数</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ stats.postTotal }}</p>
      </div>
      <div class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400">置顶文章</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ stats.pinnedTotal }}</p>
      </div>
      <div class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400">普通文章</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ stats.regularTotal }}</p>
      </div>
      <div class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400">标签数</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ stats.tagTotal }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">正在做什么</h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-slate-600 dark:text-slate-300">动作：{{ doing.action || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300">目标：{{ doing.target || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300">类型：{{ doing.type || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300">开始时间：{{ formatTime(doing.startTime) }}</p>
        </div>
      </section>
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">全局通知</h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-slate-600 dark:text-slate-300">主题：{{ notice.theme || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300">标题：{{ notice.title || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ notice.content || "-" }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

definePageMeta({
  middleware: "admin",
  layout: "admin" as any,
  viewTransition: false,
});

type Stats = {
  postTotal: number;
  pinnedTotal: number;
  regularTotal: number;
  tagTotal: number;
};

const isLoading = ref(false);
const stats = ref<Stats>({
  postTotal: 0,
  pinnedTotal: 0,
  regularTotal: 0,
  tagTotal: 0,
});
const doing = ref({
  action: "",
  target: "",
  type: "",
  startTime: "",
});
const notice = ref({
  theme: "",
  title: "",
  content: "",
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const formatTime = (timestamp: string) => {
  const value = Number(timestamp || 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  const normalized = value < 1_000_000_000_000 ? value * 1000 : value;
  return new Date(normalized).toLocaleString("zh-CN", { hour12: false });
};

const loadOverview = async () => {
  isLoading.value = true;
  try {
    const result = (await $fetch("/api/admin/overview", {
      credentials: "include",
    })) as any;
    stats.value = {
      postTotal: Number(result?.stats?.postTotal || 0),
      pinnedTotal: Number(result?.stats?.pinnedTotal || 0),
      regularTotal: Number(result?.stats?.regularTotal || 0),
      tagTotal: Number(result?.stats?.tagTotal || 0),
    };
    doing.value = {
      action: String(result?.doing?.action || ""),
      target: String(result?.doing?.target || ""),
      type: String(result?.doing?.type || ""),
      startTime: String(result?.doing?.startTime || ""),
    };
    notice.value = {
      theme: String(result?.notice?.theme || ""),
      title: String(result?.notice?.title || ""),
      content: String(result?.notice?.content || ""),
    };
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadOverview();
});
</script>
