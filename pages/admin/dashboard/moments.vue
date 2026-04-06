<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          碎碎念管理
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          发布和维护不属于正式文章的随笔内容
        </p>
      </div>
      <button
        @click="loadMoments"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white dark:bg-slate-900 shadow-sm"
      >
        {{ isLoading ? "刷新中..." : "刷新列表" }}
      </button>
    </div>

    <section
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
    >
      <textarea
        v-model="draft.content"
        class="w-full min-h-[100px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80"
        placeholder="写一条碎碎念..."
      ></textarea>
      <div class="grid sm:grid-cols-3 gap-2">
        <input
          v-model="draft.mood"
          class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          placeholder="心情（可选）"
        />
        <input
          v-model="draft.images"
          class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm sm:col-span-2"
          placeholder="图片链接，多个用英文逗号分隔（可选）"
        />
      </div>
      <div class="flex items-center justify-end gap-2">
        <select
          v-model="draft.visibility"
          class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
        >
          <option value="public">公开</option>
          <option value="private">仅后台可见</option>
        </select>
        <button
          @click="createMoment"
          :disabled="isSubmitting"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
        >
          {{ isSubmitting ? "发布中..." : "发布" }}
        </button>
      </div>
    </section>

    <section
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 overflow-auto shadow-sm"
    >
      <div v-if="moments.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        暂无碎碎念
      </div>
      <table v-else class="w-full text-sm min-w-[940px]">
        <thead>
          <tr class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th class="py-2.5 pr-3">内容</th>
            <th class="py-2.5 pr-3">心情</th>
            <th class="py-2.5 pr-3">可见性</th>
            <th class="py-2.5 pr-3">发布时间</th>
            <th class="py-2.5 pr-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in moments"
            :key="item.id"
            class="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 align-top"
          >
            <td class="py-3 pr-3 max-w-[420px]">
              <div class="line-clamp-3 whitespace-pre-wrap">{{ item.content }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID：{{ item.id }}</div>
            </td>
            <td class="py-3 pr-3">{{ item.mood || "-" }}</td>
            <td class="py-3 pr-3">{{ item.visibility === "private" ? "仅后台可见" : "公开" }}</td>
            <td class="py-3 pr-3">{{ formatTime(item.createdAt) }}</td>
            <td class="py-3 pr-3">
              <div class="flex items-center gap-2">
                <button
                  @click="toggleVisibility(item)"
                  class="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 hover:border-sky-500"
                >
                  设为{{ item.visibility === "private" ? "公开" : "仅后台可见" }}
                </button>
                <button
                  @click="deleteMoment(item)"
                  class="px-2.5 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

type MomentItem = {
  id: string;
  content: string;
  images: string[];
  mood: string;
  visibility: "public" | "private";
  createdAt: number;
};

const moments = ref<MomentItem[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const draft = ref({
  content: "",
  mood: "",
  images: "",
  visibility: "public",
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const normalizeTimestamp = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const asNumber = Number(String(value ?? "").trim());
  if (Number.isFinite(asNumber)) {
    return asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
  }
  const parsed = Date.parse(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTime = (value: unknown) => {
  const timestamp = normalizeTimestamp(value);
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
};

const loadMoments = async () => {
  isLoading.value = true;
  try {
    const result = (await $fetch("/api/admin/moments", {
      credentials: "include",
    })) as any;
    moments.value = Array.isArray(result?.moments)
      ? result.moments.map((item: any) => ({
          id: String(item?.id || ""),
          content: String(item?.content || ""),
          images: Array.isArray(item?.images)
            ? item.images.map((x: any) => String(x || "").trim()).filter(Boolean)
            : [],
          mood: String(item?.mood || ""),
          visibility:
            String(item?.visibility || "public").trim().toLowerCase() === "private"
              ? "private"
              : "public",
          createdAt: normalizeTimestamp(item?.createdAt),
        }))
      : [];
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const createMoment = async () => {
  const content = String(draft.value.content || "").trim();
  if (!content) {
    alert("请输入内容");
    return;
  }
  isSubmitting.value = true;
  try {
    await $fetch("/api/admin/moments", {
      method: "POST",
      credentials: "include",
      body: {
        content,
        mood: String(draft.value.mood || "").trim(),
        images: String(draft.value.images || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        visibility: draft.value.visibility,
      },
    });
    draft.value = {
      content: "",
      mood: "",
      images: "",
      visibility: "public",
    };
    await loadMoments();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSubmitting.value = false;
  }
};

const toggleVisibility = async (item: MomentItem) => {
  try {
    await $fetch(`/api/admin/moments/${item.id}`, {
      method: "PUT",
      credentials: "include",
      body: {
        visibility: item.visibility === "private" ? "public" : "private",
      },
    });
    await loadMoments();
  } catch (error: any) {
    alert(parseError(error));
  }
};

const deleteMoment = async (item: MomentItem) => {
  if (!window.confirm("确认删除这条碎碎念吗？")) return;
  try {
    await $fetch(`/api/admin/moments/${item.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadMoments();
  } catch (error: any) {
    alert(parseError(error));
  }
};

onMounted(() => {
  loadMoments();
});
</script>
