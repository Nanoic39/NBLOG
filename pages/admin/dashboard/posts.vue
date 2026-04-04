<template>
  <NuxtPage v-if="showChildEditor" />
  <section v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">文章管理</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">内容编辑与元数据管理</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/dashboard/posts/new"
          class="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 transition-colors"
        >
          新建文章
        </NuxtLink>
        <button
          @click="loadPosts"
          :disabled="isLoading"
          class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white/70 dark:bg-slate-900/40"
        >
          {{ isLoading ? "刷新中..." : "刷新文章" }}
        </button>
      </div>
    </div>

    <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 overflow-auto shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th class="py-2 pr-3">标题</th>
            <th class="py-2 pr-3">slug</th>
            <th class="py-2 pr-3">标签</th>
            <th class="py-2 pr-3">字数</th>
            <th class="py-2 pr-3">浏览</th>
            <th class="py-2 pr-3">状态</th>
            <th class="py-2 pr-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <td class="py-2 pr-3">{{ post.title }}</td>
            <td class="py-2 pr-3">{{ post.slug }}</td>
            <td class="py-2 pr-3">{{ (post.tags || []).join(", ") }}</td>
            <td class="py-2 pr-3">{{ post.wordCount || 0 }}</td>
            <td class="py-2 pr-3">{{ post.views || 0 }}</td>
            <td class="py-2 pr-3">
              {{ post.publishStatus === "draft" ? "草稿" : "发布" }}
              <span class="text-xs text-slate-400 ml-1">· {{ post.isPinned ? "置顶" : "普通" }}</span>
            </td>
            <td class="py-2 pr-3">
              <div class="flex items-center gap-2">
                <NuxtLink :to="`/admin/dashboard/posts/${post.id}`" class="text-sky-600 dark:text-sky-300 hover:underline">内容编辑</NuxtLink>
                <button @click="togglePin(post)" class="text-amber-600 hover:underline">
                  {{ post.isPinned ? "取消置顶" : "置顶" }}
                </button>
                <button @click="removePost(post.id)" class="text-red-500 hover:underline">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="7" class="py-6 text-center text-slate-400">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

definePageMeta({
  middleware: "admin",
  layout: "admin" as any,
  viewTransition: false,
});

type PostItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  author: string;
  tags: string[];
  coverImage: string;
  wordCount: number;
  views: number;
  isPinned: boolean;
  publishStatus: "draft" | "published";
};

const isLoading = ref(false);
const posts = ref<PostItem[]>([]);
const route = useRoute();
const config = useRuntimeConfig();
const apiBaseUrl = String(config.public.backendBaseUrl || "").trim().replace(/\/+$/, "");
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};
const showChildEditor = computed(() =>
  String(route.path || "").startsWith("/admin/dashboard/posts/"),
);

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const normalizePublishStatus = (post: any): PostItem["publishStatus"] => {
  const rawStatus = String(post?.status ?? post?.publishStatus ?? "").toLowerCase();
  if (rawStatus.includes("draft")) return "draft";
  if (rawStatus.includes("publish")) return "published";
  if (post?.isDraft === true) return "draft";
  if (post?.published === false) return "draft";
  return "published";
};

const loadPosts = async () => {
  isLoading.value = true;
  try {
    const result = (await $fetch(withApiBase("/api/admin/posts"), {
      credentials: "include",
    })) as any;
    const list = Array.isArray(result?.posts) ? result.posts : [];
    posts.value = list.map((item: any) => ({
      ...item,
      publishStatus: normalizePublishStatus(item),
    }));
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const togglePin = async (post: PostItem) => {
  try {
    await $fetch(withApiBase(`/api/admin/posts/${post.id}`), {
      method: "PUT",
      credentials: "include",
      body: { isPinned: !post.isPinned },
    });
    await loadPosts();
  } catch (error: any) {
    alert(parseError(error));
  }
};

const removePost = async (id: string) => {
  if (!window.confirm("确认删除这篇文章吗？")) return;
  try {
    await $fetch(withApiBase(`/api/admin/posts/${id}`), {
      method: "DELETE",
      credentials: "include",
    });
    await loadPosts();
  } catch (error: any) {
    alert(parseError(error));
  }
};

onMounted(() => {
  loadPosts();
});

watch(
  () => route.path,
  (nextPath, prevPath) => {
    if (nextPath === "/admin/dashboard/posts" && nextPath !== prevPath) {
      loadPosts();
    }
  },
);
</script>
