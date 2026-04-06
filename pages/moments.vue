<template>
  <div class="container mx-auto max-w-4xl px-4 md:px-6 pt-28 pb-16 space-y-6">
    <section class="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-[#242424]/90 backdrop-blur p-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">碎碎念</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        记录不成文的小想法、日常随记与灵感片段
      </p>
      <div v-if="isAdmin" class="mt-4 space-y-3">
        <textarea
          v-model="newMoment.content"
          class="w-full min-h-[100px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70"
          placeholder="写点什么..."
        ></textarea>
        <div class="grid sm:grid-cols-3 gap-2">
          <input
            v-model="newMoment.mood"
            class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-sm"
            placeholder="心情（可选）"
          />
          <input
            v-model="newMoment.imageInput"
            class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-sm sm:col-span-2"
            placeholder="图片链接，多个用英文逗号分隔（可选）"
          />
        </div>
        <div class="flex justify-end">
          <button
            @click="publishMoment"
            :disabled="isSubmitting"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
          >
            {{ isSubmitting ? "发布中..." : "发布碎碎念" }}
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <article
        v-for="item in moments"
        :key="item.id"
        class="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-[#242424]/90 backdrop-blur p-5"
      >
        <header class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span v-if="item.mood" class="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              {{ item.mood }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatTime(item.createdAt) }}
            </span>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ item.author || "admin" }}</span>
        </header>
        <p class="mt-3 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">
          {{ item.content }}
        </p>
        <div v-if="item.images.length > 0" class="mt-4 grid sm:grid-cols-2 gap-3">
          <a
            v-for="url in item.images"
            :key="url"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <img :src="url" class="w-full h-48 object-cover" />
          </a>
        </div>
      </article>
      <div v-if="moments.length === 0" class="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
        还没有碎碎念，先来发布第一条吧
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

type MomentItem = {
  id: string;
  content: string;
  images: string[];
  mood: string;
  author: string;
  createdAt: number;
};

const { isAdmin } = useAuth();
const moments = ref<MomentItem[]>([]);
const isSubmitting = ref(false);
const newMoment = ref({
  content: "",
  mood: "",
  imageInput: "",
});

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
  const result = (await $fetch("/api/moments", {
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
        author: String(item?.author || ""),
        createdAt: normalizeTimestamp(item?.createdAt),
      }))
    : [];
};

const publishMoment = async () => {
  if (!isAdmin.value) return;
  const content = String(newMoment.value.content || "").trim();
  if (!content) return;
  isSubmitting.value = true;
  try {
    const images = String(newMoment.value.imageInput || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    await $fetch("/api/moments", {
      method: "POST",
      credentials: "include",
      body: {
        content,
        mood: String(newMoment.value.mood || "").trim(),
        images,
        visibility: "public",
      },
    });
    newMoment.value = {
      content: "",
      mood: "",
      imageInput: "",
    };
    await loadMoments();
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadMoments();
});
</script>
