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

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
      <div class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm col-span-2 lg:col-span-1">
        <p class="text-xs text-slate-500 dark:text-slate-400">总浏览量</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ stats.totalViews }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
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
          <p class="text-slate-600 dark:text-slate-300">启用：{{ notice.active ? "是" : "否" }}</p>
          <p class="text-slate-600 dark:text-slate-300">主题：{{ notice.theme || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300">标题：{{ notice.title || "-" }}</p>
          <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ notice.content || "-" }}</p>
        </div>
      </section>
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">最热文章</h3>
        <div class="mt-3 space-y-2 text-sm max-h-52 overflow-auto pr-1">
          <div
            v-for="post in hotPosts"
            :key="post.id"
            class="rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-2.5 bg-white/70 dark:bg-slate-900/40"
          >
            <NuxtLink :to="`/posts/${post.slug}`" class="font-medium text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300">
              {{ post.title }}
            </NuxtLink>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              浏览 {{ post.views }} · 字数 {{ post.wordCount }} · {{ post.isPinned ? "置顶" : "普通" }}
            </p>
          </div>
          <p v-if="hotPosts.length === 0" class="text-slate-400">暂无数据</p>
        </div>
      </section>
    </div>

    <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm">
      <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">近 30 天文章趋势</h3>
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
          <div class="mt-1 text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">{{ item.label }}</div>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">柱高表示当天发布文章数量</p>
    </section>

    <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100">最新评论（最多 20 条）</h3>
        <span class="text-xs text-slate-500 dark:text-slate-400">共 {{ latestComments.length }} 条</span>
      </div>
      <div class="mt-3 space-y-3 max-h-[560px] overflow-auto pr-1">
        <div
          v-for="comment in latestComments"
          :key="comment.id"
          class="rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3 bg-white/70 dark:bg-slate-900/40"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ comment.author }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatCommentTime(comment.createdAt) }}</p>
          </div>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{{ comment.content || "-" }}</p>
          <div class="mt-2 flex items-center gap-3 text-xs">
            <NuxtLink
              v-if="comment.postSlug"
              :to="`/posts/${comment.postSlug}`"
              class="text-sky-600 dark:text-sky-300 hover:underline"
            >
              查看文章：{{ comment.postTitle || comment.postSlug }}
            </NuxtLink>
            <span v-else class="text-slate-400">文章ID：{{ comment.articleId || "-" }}</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <input
              v-model="quickReplyMap[comment.id]"
              class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/50 text-sm"
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
        <p v-if="latestComments.length === 0" class="text-slate-400">暂无评论数据</p>
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

const isLoading = ref(false);
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
const quickReplyMap = ref<Record<string, string>>({});
const isReplySubmitting = ref(false);

const maxPostsInChart = computed(() => {
  const max = Math.max(...analysis30d.value.map((item) => item.posts), 0);
  return max > 0 ? max : 1;
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const formatTime = (timestamp: string) => {
  const value = Number(timestamp || 0);
  if (!Number.isFinite(value) || value <= 0) return "-";
  const normalized = value < 1_000_000_000_000 ? value * 1000 : value;
  return new Date(normalized).toLocaleString("zh-CN", { hour12: false });
};

const formatCommentTime = (timestamp: number) =>
  new Date(Number(timestamp || Date.now())).toLocaleString("zh-CN", { hour12: false });

const calcBarHeight = (value: number) => {
  const ratio = Math.max(0, value) / maxPostsInChart.value;
  return Math.max(10, Math.round(ratio * 156));
};

const submitQuickReply = async (comment: LatestCommentItem) => {
  const content = String(quickReplyMap.value[comment.id] || "").trim();
  if (!content) return;
  isReplySubmitting.value = true;
  try {
    await $fetch(`/api/comments/${comment.id}/reply`, {
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
    alert(parseError(error));
  } finally {
    isReplySubmitting.value = false;
  }
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
      active: result?.notice?.active !== false,
    };
    analysis30d.value = Array.isArray(result?.analysis30d) ? result.analysis30d : [];
    hotPosts.value = Array.isArray(result?.hotPosts) ? result.hotPosts : [];
    latestComments.value = Array.isArray(result?.latestComments)
      ? result.latestComments
      : [];
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
