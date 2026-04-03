<template>
  <section class="space-y-6">
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">系统管理</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">维护正在做什么与全局通知</p>
    </div>

    <div class="grid xl:grid-cols-2 gap-6">
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 space-y-3 shadow-sm">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">正在做什么</h3>
        <input v-model="doingForm.action" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="动作 action" />
        <input v-model="doingForm.target" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="目标 target" />
        <input v-model="doingForm.type" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="类型 type" />
        <input
          v-model="startTimeInput"
          type="datetime-local"
          class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40"
        />
        <button
          @click="saveDoing"
          :disabled="isSavingDoing"
          class="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {{ isSavingDoing ? "保存中..." : "保存正在做什么" }}
        </button>
      </section>

      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 space-y-3 shadow-sm">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">全局通知</h3>
        <select v-model="noticeForm.theme" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40">
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="feature">feature</option>
          <option value="rainbow">rainbow</option>
        </select>
        <input v-model="noticeForm.title" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="通知标题" />
        <textarea v-model="noticeForm.content" rows="4" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="通知内容"></textarea>
        <button
          @click="saveNotice"
          :disabled="isSavingNotice"
          class="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
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
  viewTransition: false,
});

const isSavingDoing = ref(false);
const isSavingNotice = ref(false);
const doingForm = ref({
  action: "",
  target: "",
  type: "",
  startTime: "",
});
const startTimeInput = ref("");
const noticeForm = ref({
  theme: "info",
  title: "",
  content: "",
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const toLocalDatetimeValue = (timestamp: string | number) => {
  const value = Number(timestamp || 0);
  const safe = Number.isFinite(value) && value > 0 ? value : Date.now();
  const date = new Date(safe);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const loadData = async () => {
  try {
    const result = (await $fetch("/api/admin/overview", {
      credentials: "include",
    })) as any;
    doingForm.value = {
      action: String(result?.doing?.action || ""),
      target: String(result?.doing?.target || ""),
      type: String(result?.doing?.type || ""),
      startTime: String(result?.doing?.startTime || Date.now()),
    };
    startTimeInput.value = toLocalDatetimeValue(doingForm.value.startTime);
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
    const selectedTimestamp = startTimeInput.value
      ? new Date(startTimeInput.value).getTime()
      : Date.now();
    doingForm.value.startTime = String(
      Number.isFinite(selectedTimestamp) ? selectedTimestamp : Date.now(),
    );
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
  startTimeInput.value = toLocalDatetimeValue(Date.now());
  loadData();
});
</script>
