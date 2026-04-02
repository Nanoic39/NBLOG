<template>
  <section class="space-y-6">
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">系统管理</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">维护正在做什么与全局通知</p>
    </div>

    <div class="grid xl:grid-cols-2 gap-6">
      <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5 space-y-3">
        <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">正在做什么</h3>
        <input v-model="doingForm.action" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="动作 action" />
        <input v-model="doingForm.target" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="目标 target" />
        <input v-model="doingForm.type" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="类型 type" />
        <input v-model="doingForm.startTime" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="开始时间毫秒时间戳 startTime" />
        <button
          @click="saveDoing"
          :disabled="isSavingDoing"
          class="px-4 py-2 rounded-lg bg-[#0284C7] text-white text-sm hover:bg-[#0369a1] disabled:opacity-60"
        >
          {{ isSavingDoing ? "保存中..." : "保存正在做什么" }}
        </button>
      </section>

      <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5 space-y-3">
        <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">全局通知</h3>
        <select v-model="noticeForm.theme" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="feature">feature</option>
          <option value="rainbow">rainbow</option>
        </select>
        <input v-model="noticeForm.title" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="通知标题" />
        <textarea v-model="noticeForm.content" rows="4" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="通知内容"></textarea>
        <button
          @click="saveNotice"
          :disabled="isSavingNotice"
          class="px-4 py-2 rounded-lg bg-[#0284C7] text-white text-sm hover:bg-[#0369a1] disabled:opacity-60"
        >
          {{ isSavingNotice ? "保存中..." : "保存全局通知" }}
        </button>
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

const isSavingDoing = ref(false);
const isSavingNotice = ref(false);
const doingForm = ref({
  action: "",
  target: "",
  type: "",
  startTime: "",
});
const noticeForm = ref({
  theme: "info",
  title: "",
  content: "",
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const loadData = async () => {
  try {
    const result = (await $fetch("/api/admin/overview", {
      credentials: "include",
    })) as any;
    doingForm.value = {
      action: String(result?.doing?.action || ""),
      target: String(result?.doing?.target || ""),
      type: String(result?.doing?.type || ""),
      startTime: String(result?.doing?.startTime || ""),
    };
    noticeForm.value = {
      theme: String(result?.notice?.theme || "info"),
      title: String(result?.notice?.title || ""),
      content: String(result?.notice?.content || ""),
    };
  } catch (error: any) {
    alert(parseError(error));
  }
};

const saveDoing = async () => {
  isSavingDoing.value = true;
  try {
    const doingApi = "/api/doing" as string;
    await $fetch(doingApi, {
      method: "POST",
      credentials: "include",
      body: doingForm.value,
    });
    await loadData();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSavingDoing.value = false;
  }
};

const saveNotice = async () => {
  isSavingNotice.value = true;
  try {
    const noticeApi = "/api/notice" as string;
    await $fetch(noticeApi, {
      method: "POST",
      credentials: "include",
      body: noticeForm.value,
    });
    await loadData();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSavingNotice.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
