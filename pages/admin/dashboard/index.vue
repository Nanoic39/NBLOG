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
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-[#0284C7] hover:text-[#0284C7] disabled:opacity-60 transition-colors"
      >
        {{ isLoading ? "刷新中..." : "刷新数据" }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">文章总数</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.postTotal }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">置顶文章</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.pinnedTotal }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">普通文章</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.regularTotal }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">标签数</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.tagTotal }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5">
        <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">正在做什么</h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-gray-600 dark:text-gray-300">动作：{{ doing.action || "-" }}</p>
          <p class="text-gray-600 dark:text-gray-300">目标：{{ doing.target || "-" }}</p>
          <p class="text-gray-600 dark:text-gray-300">类型：{{ doing.type || "-" }}</p>
          <p class="text-gray-600 dark:text-gray-300">开始时间：{{ doing.startTime || "-" }}</p>
        </div>
      </section>
      <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5">
        <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">全局通知</h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-gray-600 dark:text-gray-300">主题：{{ notice.theme || "-" }}</p>
          <p class="text-gray-600 dark:text-gray-300">标题：{{ notice.title || "-" }}</p>
          <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ notice.content || "-" }}</p>
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
