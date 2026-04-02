<template>
  <div class="max-w-6xl mx-auto px-4 py-8 mt-24 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">控制台</h1>
      <button
        @click="loadAll"
        :disabled="isLoading"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-[#0284C7] hover:text-[#0284C7] disabled:opacity-60 transition-colors"
      >
        {{ isLoading ? "刷新中..." : "刷新数据" }}
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">文章总数</p>
        <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{{ stats.postTotal }}</p>
      </div>
      <div class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">置顶文章</p>
        <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{{ stats.pinnedTotal }}</p>
      </div>
      <div class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">普通文章</p>
        <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{{ stats.regularTotal }}</p>
      </div>
      <div class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">标签数</p>
        <p class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{{ stats.tagTotal }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <section class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-5">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">正在做什么管理</h2>
        <div class="space-y-3">
          <input v-model="doingForm.action" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="动作 action" />
          <input v-model="doingForm.target" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="目标 target" />
          <input v-model="doingForm.type" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="类型 type" />
          <input v-model="doingForm.startTime" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="开始时间毫秒时间戳 startTime" />
          <button
            @click="saveDoing"
            :disabled="isSavingDoing"
            class="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-sm disabled:opacity-60"
          >
            {{ isSavingDoing ? "保存中..." : "保存正在做什么" }}
          </button>
        </div>
      </section>

      <section class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-5">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">全局通知管理</h2>
        <div class="space-y-3">
          <select v-model="noticeForm.theme" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600">
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="feature">feature</option>
            <option value="rainbow">rainbow</option>
          </select>
          <input v-model="noticeForm.title" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="通知标题" />
          <textarea v-model="noticeForm.content" rows="4" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="通知内容"></textarea>
          <button
            @click="saveNotice"
            :disabled="isSavingNotice"
            class="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-sm disabled:opacity-60"
          >
            {{ isSavingNotice ? "保存中..." : "保存全局通知" }}
          </button>
        </div>
      </section>
    </div>

    <section class="rounded-xl bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-700 p-5">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">文章管理</h2>
      <div class="grid md:grid-cols-2 gap-3 mb-4">
        <input v-model="postForm.title" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="标题" />
        <input v-model="postForm.slug" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="slug（可空，自动生成）" />
        <input v-model="postForm.description" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 md:col-span-2" placeholder="摘要" />
        <input v-model="postForm.author" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="作者" />
        <input v-model="postForm.coverImage" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="封面链接" />
        <input v-model="postForm.tagsText" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 md:col-span-2" placeholder="标签，英文逗号分隔" />
        <input v-model.number="postForm.wordCount" type="number" min="0" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="字数" />
        <input v-model.number="postForm.views" type="number" min="0" class="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600" placeholder="浏览数" />
      </div>
      <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <input v-model="postForm.isPinned" type="checkbox" />
        设为置顶
      </label>
      <div class="flex items-center gap-2 mb-6">
        <button
          @click="savePost"
          :disabled="isSavingPost"
          class="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-sm disabled:opacity-60"
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

      <div class="overflow-auto">
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});

type Stats = {
  postTotal: number;
  pinnedTotal: number;
  regularTotal: number;
  tagTotal: number;
};

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
const isSavingDoing = ref(false);
const isSavingNotice = ref(false);
const isSavingPost = ref(false);
const posts = ref<PostItem[]>([]);
const stats = ref<Stats>({
  postTotal: 0,
  pinnedTotal: 0,
  regularTotal: 0,
  tagTotal: 0,
});

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

const editingPostId = ref<string>("");
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

const loadAll = async () => {
  isLoading.value = true;
  try {
    const [overview, postsResult] = await Promise.all([
      $fetch("/api/admin/overview", { credentials: "include" }),
      $fetch("/api/admin/posts", { credentials: "include" }),
    ]);
    const ov = overview as any;
    const ps = postsResult as any;

    stats.value = {
      postTotal: Number(ov?.stats?.postTotal || 0),
      pinnedTotal: Number(ov?.stats?.pinnedTotal || 0),
      regularTotal: Number(ov?.stats?.regularTotal || 0),
      tagTotal: Number(ov?.stats?.tagTotal || 0),
    };
    doingForm.value = {
      action: String(ov?.doing?.action || ""),
      target: String(ov?.doing?.target || ""),
      type: String(ov?.doing?.type || ""),
      startTime: String(ov?.doing?.startTime || ""),
    };
    noticeForm.value = {
      theme: String(ov?.notice?.theme || "info"),
      title: String(ov?.notice?.title || ""),
      content: String(ov?.notice?.content || ""),
    };
    posts.value = Array.isArray(ps?.posts) ? ps.posts : [];
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
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
    await loadAll();
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
    await loadAll();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSavingNotice.value = false;
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
    await loadAll();
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
    await loadAll();
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
    await loadAll();
  } catch (error: any) {
    alert(parseError(error));
  }
};

await loadAll();
</script>
