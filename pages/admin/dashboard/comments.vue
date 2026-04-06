<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          评论管理
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          查看、回复和删除全站评论
        </p>
      </div>
      <button
        @click="loadComments"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white dark:bg-slate-900 shadow-sm"
      >
        {{ isLoading ? "刷新中..." : "刷新评论" }}
      </button>
    </div>

    <section
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 overflow-auto shadow-sm"
    >
      <div v-if="rows.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        暂无评论数据
      </div>
      <table v-else class="w-full text-sm min-w-[980px]">
        <thead>
          <tr class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th class="py-2.5 pr-3">作者</th>
            <th class="py-2.5 pr-3">评论内容</th>
            <th class="py-2.5 pr-3">来源文章</th>
            <th class="py-2.5 pr-3">发布时间</th>
            <th class="py-2.5 pr-3">回复</th>
            <th class="py-2.5 pr-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.id"
            class="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 align-top"
          >
            <td class="py-3 pr-3">
              <div class="font-medium text-slate-900 dark:text-slate-100">
                {{ item.author || "匿名用户" }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ID：{{ item.id }}
              </div>
            </td>
            <td class="py-3 pr-3 max-w-[340px]">
              <div class="line-clamp-3 whitespace-pre-wrap break-words">
                {{ item.content || "-" }}
              </div>
            </td>
            <td class="py-3 pr-3">
              <NuxtLink
                :to="`/admin/dashboard/posts/${item.articleId}`"
                class="text-sky-600 dark:text-sky-300 hover:underline font-medium"
              >
                {{ item.articleTitle || "未命名文章" }}
              </NuxtLink>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                文章ID：{{ item.articleId || "-" }}
              </div>
            </td>
            <td class="py-3 pr-3 whitespace-nowrap">
              {{ formatTime(item.createdAt) }}
            </td>
            <td class="py-3 pr-3 w-[280px]">
              <div class="flex items-center gap-2">
                <input
                  v-model="replyMap[item.id]"
                  class="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
                  placeholder="输入回复内容"
                />
                <button
                  @click="replyComment(item)"
                  :disabled="isReplying"
                  class="px-2.5 py-1.5 text-xs rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
                >
                  回复
                </button>
              </div>
            </td>
            <td class="py-3 pr-3">
              <button
                @click="deleteComment(item)"
                :disabled="isDeleting"
                class="px-2.5 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-60"
              >
                删除
              </button>
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

type CommentRow = {
  id: string;
  articleId: string;
  articleTitle: string;
  authorId?: string;
  author: string;
  content: string;
  createdAt: number;
};

const rows = ref<CommentRow[]>([]);
const replyMap = ref<Record<string, string>>({});
const isLoading = ref(false);
const isReplying = ref(false);
const isDeleting = ref(false);

const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const normalizeTimestamp = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) {
    return asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTime = (value: unknown) => {
  const timestamp = normalizeTimestamp(value);
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false,
  });
};

const loadComments = async () => {
  isLoading.value = true;
  try {
    const [commentsResult, postsResult] = (await Promise.all([
      $fetch(withApiBase("/api/comments"), {
        credentials: "include",
      }),
      $fetch(withApiBase("/api/admin/posts"), {
        credentials: "include",
      }),
    ])) as [any, any];
    const comments = Array.isArray(commentsResult?.data) ? commentsResult.data : [];
    const posts = Array.isArray(postsResult?.posts) ? postsResult.posts : [];
    const postTitleMap = new Map<string, string>();
    for (const post of posts) {
      const id = String(post?.id || "").trim();
      if (!id) continue;
      postTitleMap.set(id, String(post?.title || "").trim());
    }
    rows.value = comments
      .map((item: any) => {
        const articleId = String(item?.articleId || "").trim();
        const articleTitle = postTitleMap.get(articleId) || "";
        return {
          id: String(item?.id || ""),
          articleId,
          articleTitle,
          authorId: String(item?.authorId || "").trim() || undefined,
          author: String(item?.author || ""),
          content: String(item?.content || ""),
          createdAt: normalizeTimestamp(item?.createdAt),
        } as CommentRow;
      })
      .sort((a: CommentRow, b: CommentRow) => b.createdAt - a.createdAt);
    replyMap.value = {};
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const replyComment = async (item: CommentRow) => {
  const content = String(replyMap.value[item.id] || "").trim();
  if (!content) return;
  isReplying.value = true;
  try {
    await $fetch(withApiBase(`/api/comments/${item.id}/reply`), {
      method: "POST",
      credentials: "include",
      body: {
        content,
        replyToUserId: item.authorId || undefined,
      },
    });
    replyMap.value[item.id] = "";
    await loadComments();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isReplying.value = false;
  }
};

const deleteComment = async (item: CommentRow) => {
  if (!window.confirm("确认删除该评论吗？")) return;
  isDeleting.value = true;
  try {
    await $fetch(withApiBase(`/api/comments/${item.id}`), {
      method: "DELETE",
      credentials: "include",
    });
    await loadComments();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  loadComments();
});
</script>
