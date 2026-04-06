<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          控制台概览
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          查看当前站点核心运营数据
        </p>
      </div>
      <button
        @click="loadOverview"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white dark:bg-slate-900 shadow-sm"
      >
        {{ isLoading ? "刷新中..." : "刷新数据" }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div
        class="rounded-2xl border border-sky-200/70 dark:border-sky-700/40 bg-gradient-to-br from-sky-500 to-cyan-500 text-white p-4 shadow-lg shadow-sky-500/25"
      >
        <p class="text-xs text-white/80">文章总数</p>
        <p
          class="mt-1 text-2xl font-bold"
        >
          {{ stats.postTotal }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-rose-200/80 dark:border-rose-700/40 bg-gradient-to-br from-rose-500 to-orange-500 text-white p-4 shadow-lg shadow-rose-500/25"
      >
        <p class="text-xs text-white/80">置顶文章</p>
        <p
          class="mt-1 text-2xl font-bold"
        >
          {{ stats.pinnedTotal }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm"
      >
        <p class="text-xs text-slate-500 dark:text-slate-400">普通文章</p>
        <p
          class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
        >
          {{ stats.regularTotal }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm"
      >
        <p class="text-xs text-slate-500 dark:text-slate-400">标签数</p>
        <p
          class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
        >
          {{ stats.tagTotal }}
        </p>
      </div>
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm col-span-2 lg:col-span-1"
      >
        <p class="text-xs text-slate-500 dark:text-slate-400">总浏览量</p>
        <p
          class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
        >
          {{ stats.totalViews }}
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          正在做什么
        </h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-slate-600 dark:text-slate-300">
            动作：{{ doing.action || "-" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            目标：{{ doing.target || "-" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            类型：{{ doing.type || "-" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            开始时间：{{ formatTime(doing.startTime) }}
          </p>
        </div>
      </section>
      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          全局通知
        </h3>
        <div class="mt-3 space-y-2 text-sm">
          <p class="text-slate-600 dark:text-slate-300">
            启用：{{ notice.active ? "是" : "否" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            主题：{{ notice.theme || "-" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            标题：{{ notice.title || "-" }}
          </p>
          <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {{ notice.content || "-" }}
          </p>
        </div>
      </section>
      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          最热文章
        </h3>
        <div class="mt-3 space-y-2 text-sm max-h-52 overflow-auto pr-1">
          <div
            v-for="post in hotPosts"
            :key="post.id"
            class="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800/60"
          >
            <NuxtLink
              :to="`/posts/${post.slug}`"
              class="font-medium text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300"
            >
              {{ post.title }}
            </NuxtLink>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              浏览 {{ post.views }} · 字数 {{ post.wordCount }} ·
              {{ post.isPinned ? "置顶" : "普通" }}
            </p>
          </div>
          <p v-if="hotPosts.length === 0" class="text-slate-400">暂无数据</p>
        </div>
      </section>
    </div>

    <section
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
        近 30 天文章趋势
      </h3>
      <div class="mt-4 h-44 flex items-end gap-1">
        <div
          v-for="item in analysis30d"
          :key="item.key"
          class="group flex-1 min-w-0 flex flex-col items-center justify-end"
        >
          <div
            class="w-full rounded-t-sm bg-gradient-to-t from-sky-500/85 to-sky-300/80 dark:from-sky-500/65 dark:to-sky-300/45 transition-all"
            :style="{ height: `${calcBarHeight(item.posts)}px` }"
          ></div>
          <div
            class="mt-1 text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        柱高表示当天发布文章数量
      </p>
    </section>

    <div class="grid xl:grid-cols-3 gap-4">
      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          标签阅读偏好（Top 8）
        </h3>
        <div class="mt-4 space-y-2.5">
          <div
            v-for="item in tagPreference"
            :key="item.label"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300 truncate"
                >#{{ item.label }}</span
              >
              <span class="text-slate-500 dark:text-slate-400">{{
                item.value
              }}</span>
            </div>
            <div
              class="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/70 overflow-hidden"
            >
              <div
                class="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                :style="{
                  width: `${calcPreferenceWidth(item.value, maxTagPreference)}%`,
                }"
              ></div>
            </div>
          </div>
          <p v-if="tagPreference.length === 0" class="text-sm text-slate-400">
            暂无标签偏好数据
          </p>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          阅读时长偏好
        </h3>
        <div class="mt-4 h-44 flex items-end gap-3">
          <div
            v-for="item in readTimePreference"
            :key="item.label"
            class="flex-1 min-w-0 text-center"
          >
            <div
              class="w-full rounded-t-lg bg-gradient-to-t from-indigo-500/85 to-violet-400/75 dark:from-indigo-500/70 dark:to-violet-400/55"
              :style="{ height: `${calcReadTimeHeight(item.value)}px` }"
            ></div>
            <p class="mt-2 text-xs text-slate-600 dark:text-slate-300">
              {{ item.label }}
            </p>
            <p class="text-[11px] text-slate-400">{{ item.value }}</p>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          按文章字数估算阅读时长并累计浏览量
        </p>
      </section>

      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          星期阅读偏好
        </h3>
        <div class="mt-4 space-y-2">
          <div
            v-for="item in weekdayPreference"
            :key="item.label"
            class="flex items-center gap-2"
          >
            <span class="w-9 text-xs text-slate-500 dark:text-slate-400">{{
              item.label
            }}</span>
            <div
              class="flex-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/70 overflow-hidden"
            >
              <div
                class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                :style="{
                  width: `${calcPreferenceWidth(item.value, maxWeekdayPreference)}%`,
                }"
              ></div>
            </div>
            <span
              class="w-10 text-right text-xs text-slate-500 dark:text-slate-400"
              >{{ item.value }}</span
            >
          </div>
          <p
            v-if="weekdayPreference.length === 0"
            class="text-sm text-slate-400"
          >
            暂无星期偏好数据
          </p>
        </div>
      </section>
    </div>

    <section
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">
          最新评论（最多 20 条）
        </h3>
        <span class="text-xs text-slate-500 dark:text-slate-400"
          >共 {{ latestComments.length }} 条</span
        >
      </div>
      <div class="mt-3 space-y-3 max-h-[560px] overflow-auto pr-1">
        <div
          v-for="comment in latestComments"
          :key="comment.id"
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/60"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200">
              {{ comment.author }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatCommentTime(comment.createdAt) }}
            </p>
          </div>
          <p
            class="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap"
          >
            {{ comment.content || "-" }}
          </p>
          <div class="mt-2 flex items-center gap-3 text-xs">
            <NuxtLink
              v-if="comment.postSlug"
              :to="`/posts/${comment.postSlug}`"
              class="text-sky-600 dark:text-sky-300 hover:underline"
            >
              查看文章：{{ comment.postTitle || comment.postSlug }}
            </NuxtLink>
            <span v-else class="text-slate-400"
              >文章ID：{{ comment.articleId || "-" }}</span
            >
          </div>
          <div class="mt-2 flex items-center gap-2">
            <input
              v-model="quickReplyMap[comment.id]"
              class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
              placeholder="快捷回复内容"
            />
            <button
              class="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
              :disabled="!quickReplyMap[comment.id] || isReplySubmitting"
              @click="submitQuickReply(comment)"
            >
              回复
            </button>
          </div>
        </div>
        <p v-if="latestComments.length === 0" class="text-slate-400">
          暂无评论数据
        </p>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

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
  totalViews: number;
  commentTotal: number;
};

type TrendItem = {
  key: string;
  label: string;
  posts: number;
  views: number;
};

type HotPostItem = {
  id: string;
  title: string;
  slug: string;
  views: number;
  wordCount: number;
  isPinned: boolean;
};

type LatestCommentItem = {
  id: string;
  articleId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: number;
  postTitle?: string;
  postSlug?: string;
};

type AdminPostItem = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  views: number;
  wordCount: number;
  pubDate: string;
};

type ChartItem = {
  label: string;
  value: number;
};

const isLoading = ref(false);
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};
const stats = ref<Stats>({
  postTotal: 0,
  pinnedTotal: 0,
  regularTotal: 0,
  tagTotal: 0,
  totalViews: 0,
  commentTotal: 0,
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
  active: true,
});
const analysis30d = ref<TrendItem[]>([]);
const hotPosts = ref<HotPostItem[]>([]);
const latestComments = ref<LatestCommentItem[]>([]);
const tagPreference = ref<ChartItem[]>([]);
const readTimePreference = ref<ChartItem[]>([
  { label: "短读（<3分钟）", value: 0 },
  { label: "中读（3-8分钟）", value: 0 },
  { label: "深读（>8分钟）", value: 0 },
]);
const weekdayPreference = ref<ChartItem[]>([
  { label: "周一", value: 0 },
  { label: "周二", value: 0 },
  { label: "周三", value: 0 },
  { label: "周四", value: 0 },
  { label: "周五", value: 0 },
  { label: "周六", value: 0 },
  { label: "周日", value: 0 },
]);
const quickReplyMap = ref<Record<string, string>>({});
const isReplySubmitting = ref(false);

const maxPostsInChart = computed(() => {
  const max = Math.max(...analysis30d.value.map((item) => item.posts), 0);
  return max > 0 ? max : 1;
});

const maxTagPreference = computed(() =>
  Math.max(...tagPreference.value.map((item) => item.value), 0),
);

const maxReadTimePreference = computed(() =>
  Math.max(...readTimePreference.value.map((item) => item.value), 0),
);

const maxWeekdayPreference = computed(() =>
  Math.max(...weekdayPreference.value.map((item) => item.value), 0),
);

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const parseBoolean = (value: unknown, defaultValue = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return defaultValue;
  if (["false", "0", "off", "no", "disabled"].includes(normalized))
    return false;
  if (["true", "1", "on", "yes", "enabled"].includes(normalized)) return true;
  return defaultValue;
};

const logClientError = (scene: string, error: any) => {
  const payload = {
    scene,
    statusCode: Number(error?.statusCode || 0),
    statusMessage: String(error?.statusMessage || ""),
    message: String(error?.data?.message || error?.message || ""),
    data: error?.data || null,
  };
  console.error("[NBLOG_CLIENT]", payload, error);
};

const formatTime = (timestamp: string) => {
  const value = Number(timestamp || 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  const normalized = value < 1_000_000_000_000 ? value * 1000 : value;
  return new Date(normalized).toLocaleString("zh-CN", { hour12: false });
};

const formatCommentTime = (timestamp: number) =>
  new Date(Number(timestamp || Date.now())).toLocaleString("zh-CN", {
    hour12: false,
  });

const calcBarHeight = (value: number) => {
  const ratio = Math.max(0, value) / maxPostsInChart.value;
  return Math.max(10, Math.round(ratio * 156));
};

const calcPreferenceWidth = (value: number, max: number) => {
  if (value <= 0) return 0;
  if (max <= 0) return 0;
  return Math.max(6, Math.round((Math.max(0, value) / max) * 100));
};

const calcReadTimeHeight = (value: number) => {
  const max = maxReadTimePreference.value;
  if (max <= 0) return 10;
  return Math.max(10, Math.round((Math.max(0, value) / max) * 156));
};

const parseTimestamp = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return 0;
    const numeric = Number(raw);
    if (Number.isFinite(numeric)) {
      return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    }
    const dateParsed = Date.parse(raw);
    if (Number.isFinite(dateParsed)) return dateParsed;
  }
  return 0;
};

const buildPreferenceCharts = (rawPosts: any[]) => {
  const posts = (Array.isArray(rawPosts) ? rawPosts : []).map((item) => ({
    id: String(item?.id || ""),
    title: String(item?.title || ""),
    slug: String(item?.slug || ""),
    tags: Array.isArray(item?.tags)
      ? item.tags.map((tag: any) => String(tag || "").trim()).filter(Boolean)
      : [],
    views: Number(item?.views || 0),
    wordCount: Number(item?.wordCount || 0),
    pubDate: String(item?.pubDate || ""),
  })) as AdminPostItem[];

  const tagViews = new Map<string, number>();
  const readBuckets: [ChartItem, ChartItem, ChartItem] = [
    { label: "短读（<3分钟）", value: 0 },
    { label: "中读（3-8分钟）", value: 0 },
    { label: "深读（>8分钟）", value: 0 },
  ];
  const weekdayViews: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const post of posts) {
    const views = Math.max(0, Number(post.views || 0));
    const tags = post.tags.length > 0 ? post.tags : ["未分类"];
    for (const tag of tags) {
      tagViews.set(tag, (tagViews.get(tag) || 0) + views);
    }

    const words = Math.max(0, Number(post.wordCount || 0));
    const minutes = words / 300;
    if (minutes < 3) readBuckets[0].value += views;
    else if (minutes <= 8) readBuckets[1].value += views;
    else readBuckets[2].value += views;

    const time = parseTimestamp(post.pubDate);
    if (time > 0) {
      const day = new Date(time).getDay();
      const index = day === 0 ? 6 : day - 1;
      weekdayViews[index] = (weekdayViews[index] || 0) + views;
    }
  }

  tagPreference.value = Array.from(tagViews.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  readTimePreference.value = readBuckets;
  weekdayPreference.value = [
    { label: "周一", value: weekdayViews[0] || 0 },
    { label: "周二", value: weekdayViews[1] || 0 },
    { label: "周三", value: weekdayViews[2] || 0 },
    { label: "周四", value: weekdayViews[3] || 0 },
    { label: "周五", value: weekdayViews[4] || 0 },
    { label: "周六", value: weekdayViews[5] || 0 },
    { label: "周日", value: weekdayViews[6] || 0 },
  ];
};

const submitQuickReply = async (comment: LatestCommentItem) => {
  const content = String(quickReplyMap.value[comment.id] || "").trim();
  if (!content) return;
  isReplySubmitting.value = true;
  try {
    await $fetch(withApiBase(`/api/comments/${comment.id}/reply`), {
      method: "POST",
      credentials: "include",
      body: {
        content,
        replyToUserId: comment.authorId || undefined,
      },
    });
    quickReplyMap.value[comment.id] = "";
    await loadOverview();
  } catch (error: any) {
    logClientError("admin.quick_reply", error);
    alert(parseError(error));
  } finally {
    isReplySubmitting.value = false;
  }
};

const loadOverview = async () => {
  isLoading.value = true;
  try {
    const [result, postsResult] = (await Promise.all([
      $fetch(withApiBase("/api/admin/overview"), {
        credentials: "include",
      }),
      $fetch(withApiBase("/api/admin/posts"), {
        credentials: "include",
      }),
    ])) as [any, any];
    stats.value = {
      postTotal: Number(result?.stats?.postTotal || 0),
      pinnedTotal: Number(result?.stats?.pinnedTotal || 0),
      regularTotal: Number(result?.stats?.regularTotal || 0),
      tagTotal: Number(result?.stats?.tagTotal || 0),
      totalViews: Number(result?.stats?.totalViews || 0),
      commentTotal: Number(result?.stats?.commentTotal || 0),
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
      active: parseBoolean(result?.notice?.active, true),
    };
    analysis30d.value = Array.isArray(result?.analysis30d)
      ? result.analysis30d
      : [];
    hotPosts.value = Array.isArray(result?.hotPosts) ? result.hotPosts : [];
    latestComments.value = Array.isArray(result?.latestComments)
      ? result.latestComments
      : [];
    buildPreferenceCharts(
      Array.isArray(postsResult?.posts) ? postsResult.posts : [],
    );
  } catch (error: any) {
    logClientError("admin.load_overview", error);
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadOverview();
});
</script>
