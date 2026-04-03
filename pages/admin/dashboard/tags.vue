<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">标签管理</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">统一维护文章标签命名与清理</p>
      </div>
      <button
        @click="loadTags"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white/70 dark:bg-slate-900/40"
      >
        {{ isLoading ? "刷新中..." : "刷新标签" }}
      </button>
    </div>

    <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm space-y-4">
      <div v-if="tags.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        暂无标签
      </div>
      <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="tag in tags"
          :key="tag.name"
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white/70 dark:bg-slate-900/40 space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium text-slate-900 dark:text-slate-100 break-all">#{{ tag.name }}</p>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ tag.count }} 篇</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="renameMap[tag.name]"
              class="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm"
              placeholder="新标签名"
            />
            <button
              @click="renameTag(tag.name)"
              class="px-2 py-1.5 text-xs rounded-lg bg-sky-600 text-white hover:bg-sky-700"
            >
              重命名
            </button>
            <button
              @click="deleteTag(tag.name)"
              class="px-2 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

definePageMeta({
  middleware: "admin",
  layout: "admin" as any,
  viewTransition: false,
});

type TagItem = {
  name: string;
  count: number;
};

const isLoading = ref(false);
const tags = ref<TagItem[]>([]);
const renameMap = ref<Record<string, string>>({});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const loadTags = async () => {
  isLoading.value = true;
  try {
    const result = (await $fetch("/api/admin/tags", {
      credentials: "include",
    })) as any;
    tags.value = Array.isArray(result?.tags) ? result.tags : [];
    const nextMap: Record<string, string> = {};
    for (const item of tags.value) {
      nextMap[item.name] = "";
    }
    renameMap.value = nextMap;
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const renameTag = async (name: string) => {
  const newName = String(renameMap.value[name] || "").trim();
  if (!newName) {
    alert("请输入新标签名");
    return;
  }
  try {
    await $fetch("/api/admin/tags", {
      method: "POST",
      credentials: "include",
      body: {
        action: "rename",
        name,
        newName,
      },
    });
    await loadTags();
  } catch (error: any) {
    alert(parseError(error));
  }
};

const deleteTag = async (name: string) => {
  if (!window.confirm(`确认删除标签「${name}」吗？`)) return;
  try {
    await $fetch("/api/admin/tags", {
      method: "POST",
      credentials: "include",
      body: {
        action: "delete",
        name,
      },
    });
    await loadTags();
  } catch (error: any) {
    alert(parseError(error));
  }
};

onMounted(() => {
  loadTags();
});
</script>
