<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">文章管理</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">支持新增、编辑、删除和置顶管理</p>
      </div>
      <button
        @click="loadPosts"
        :disabled="isLoading"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-[#0284C7] hover:text-[#0284C7] disabled:opacity-60 transition-colors"
      >
        {{ isLoading ? "刷新中..." : "刷新文章" }}
      </button>
    </div>

    <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5">
      <div class="grid md:grid-cols-2 gap-3 mb-4">
        <input v-model="postForm.title" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="标题" />
        <input v-model="postForm.slug" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="slug（可空，自动生成）" />
        <input v-model="postForm.description" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent md:col-span-2" placeholder="摘要" />
        <input v-model="postForm.author" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="作者" />
        <input v-model="postForm.coverImage" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="封面链接" />
        <input v-model="postForm.tagsText" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent md:col-span-2" placeholder="标签，英文逗号分隔" />
        <input v-model.number="postForm.wordCount" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="字数" />
        <input v-model.number="postForm.views" type="number" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="浏览数" />
      </div>
      <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <input v-model="postForm.isPinned" type="checkbox" />
        设为置顶
      </label>
      <div class="flex items-center gap-2 mb-2">
        <button
          @click="savePost"
          :disabled="isSavingPost"
          class="px-4 py-2 rounded-lg bg-[#0284C7] text-white text-sm hover:bg-[#0369a1] disabled:opacity-60"
        >
          {{ isSavingPost ? "保存中..." : editingPostId ? "更新文章" : "新增文章" }}
        </button>
        <button
          v-if="editingPostId"
          @click="resetPostForm"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
        >
          取消编辑
        </button>
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5 overflow-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th class="py-2 pr-3">标题</th>
            <th class="py-2 pr-3">slug</th>
            <th class="py-2 pr-3">标签</th>
            <th class="py-2 pr-3">状态</th>
            <th class="py-2 pr-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
          >
            <td class="py-2 pr-3">{{ post.title }}</td>
            <td class="py-2 pr-3">{{ post.slug }}</td>
            <td class="py-2 pr-3">{{ (post.tags || []).join(", ") }}</td>
            <td class="py-2 pr-3">{{ post.isPinned ? "置顶" : "普通" }}</td>
            <td class="py-2 pr-3">
              <div class="flex items-center gap-2">
                <button @click="startEditPost(post)" class="text-[#0284C7] hover:underline">编辑</button>
                <button @click="togglePin(post)" class="text-amber-600 hover:underline">
                  {{ post.isPinned ? "取消置顶" : "置顶" }}
                </button>
                <button @click="removePost(post.id)" class="text-red-500 hover:underline">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="5" class="py-6 text-center text-gray-400">暂无文章</td>
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
};

const isLoading = ref(false);
const isSavingPost = ref(false);
const posts = ref<PostItem[]>([]);
const editingPostId = ref("");
const postForm = ref({
  title: "",
  slug: "",
  description: "",
  author: "nanoic39",
  coverImage: "",
  tagsText: "",
  wordCount: 0,
  views: 0,
  isPinned: false,
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const resetPostForm = () => {
  editingPostId.value = "";
  postForm.value = {
    title: "",
    slug: "",
    description: "",
    author: "nanoic39",
    coverImage: "",
    tagsText: "",
    wordCount: 0,
    views: 0,
    isPinned: false,
  };
};

const loadPosts = async () => {
  isLoading.value = true;
  try {
    const result = (await $fetch("/api/admin/posts", {
      credentials: "include",
    })) as any;
    posts.value = Array.isArray(result?.posts) ? result.posts : [];
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const savePost = async () => {
  isSavingPost.value = true;
  const payload = {
    title: postForm.value.title,
    slug: postForm.value.slug,
    description: postForm.value.description,
    author: postForm.value.author,
    coverImage: postForm.value.coverImage,
    tags: postForm.value.tagsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    wordCount: Number(postForm.value.wordCount || 0),
    views: Number(postForm.value.views || 0),
    isPinned: postForm.value.isPinned,
  };
  try {
    if (editingPostId.value) {
      await $fetch(`/api/admin/posts/${editingPostId.value}`, {
        method: "PUT",
        credentials: "include",
        body: payload,
      });
    } else {
      await $fetch("/api/admin/posts", {
        method: "POST",
        credentials: "include",
        body: payload,
      });
    }
    resetPostForm();
    await loadPosts();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSavingPost.value = false;
  }
};

const startEditPost = (post: PostItem) => {
  editingPostId.value = post.id;
  postForm.value = {
    title: post.title,
    slug: post.slug,
    description: post.description,
    author: post.author,
    coverImage: post.coverImage,
    tagsText: (post.tags || []).join(", "),
    wordCount: Number(post.wordCount || 0),
    views: Number(post.views || 0),
    isPinned: Boolean(post.isPinned),
  };
};

const togglePin = async (post: PostItem) => {
  try {
    await $fetch(`/api/admin/posts/${post.id}`, {
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
    await $fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (editingPostId.value === id) {
      resetPostForm();
    }
    await loadPosts();
  } catch (error: any) {
    alert(parseError(error));
  }
};

onMounted(() => {
  loadPosts();
});
</script>
