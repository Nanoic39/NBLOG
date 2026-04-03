<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {{ isCreateMode ? "新建文章" : "编辑文章内容" }}
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">主区域编辑正文，侧边栏维护文章元数据</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/dashboard/posts"
          class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-900/40"
        >
          返回列表
        </NuxtLink>
        <button
          @click="savePost"
          :disabled="isSaving"
          class="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {{ isSaving ? "保存中..." : "保存文章" }}
        </button>
      </div>
    </div>

    <div class="grid lg:grid-cols-[1fr_340px] gap-4">
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <textarea
          v-model="form.content"
          rows="28"
          class="w-full min-h-[560px] resize-y rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/45 px-3 py-3 font-mono text-sm leading-7"
          placeholder="在此输入 Markdown 正文内容"
        ></textarea>
      </section>

      <aside class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm space-y-3">
        <input v-model="form.title" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="标题" />
        <input v-model="form.slug" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="slug（可空自动生成）" />
        <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="摘要"></textarea>
        <input v-model="form.author" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="作者" />
        <input v-model="form.tagsText" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="标签，英文逗号分隔" />

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">封面图</p>
          <input type="file" accept="image/*" @change="uploadCoverImage" class="text-sm" />
          <input v-model="form.coverImage" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm" placeholder="封面链接" />
          <img v-if="form.coverImage" :src="form.coverImage" alt="cover" class="w-full h-28 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
        </div>

        <label class="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input v-model="form.isPinned" type="checkbox" />
          设为置顶
        </label>

        <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1">
          <p class="text-slate-600 dark:text-slate-300">自动字数：{{ estimatedWordCount }}</p>
          <p class="text-slate-600 dark:text-slate-300">当前浏览：{{ form.views }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">字数由正文自动计算，浏览量由实际访问累加</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({
  middleware: "admin",
  layout: "admin" as any,
  viewTransition: false,
});

type PostForm = {
  title: string;
  slug: string;
  description: string;
  author: string;
  coverImage: string;
  content: string;
  tagsText: string;
  views: number;
  isPinned: boolean;
};

const route = useRoute();
const router = useRouter();
const postId = computed(() => String(route.params.id || ""));
const isCreateMode = computed(() => postId.value === "new");
const isSaving = ref(false);
const form = ref<PostForm>({
  title: "",
  slug: "",
  description: "",
  author: "nanoic39",
  coverImage: "",
  content: "",
  tagsText: "",
  views: 0,
  isPinned: false,
});

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const computeWordCount = (content: string) =>
  String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_\-\[\]\(\)!~]/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

const estimatedWordCount = computed(() => computeWordCount(form.value.content));

const loadPost = async () => {
  if (isCreateMode.value) return;
  try {
    const result = (await $fetch(`/api/admin/posts/${postId.value}`, {
      credentials: "include",
    })) as any;
    const post = result?.data || result || {};
    form.value = {
      title: String(post.title || ""),
      slug: String(post.slug || ""),
      description: String(post.description || ""),
      author: String(post.author || "nanoic39"),
      coverImage: String(post.coverImage || ""),
      content: String(post.content || ""),
      tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      views: Number(post.views || 0),
      isPinned: Boolean(post.isPinned),
    };
  } catch (error: any) {
    alert(parseError(error));
    router.push("/admin/dashboard/posts");
  }
};

const uploadCoverImage = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const result = (await $fetch("/api/comments/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    })) as any;
    const url = String(result?.data?.url || result?.url || "").trim();
    if (url) form.value.coverImage = url;
    else alert("上传成功但未返回封面链接");
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    target.value = "";
  }
};

const savePost = async () => {
  isSaving.value = true;
  const payload = {
    title: form.value.title,
    slug: form.value.slug,
    description: form.value.description,
    author: form.value.author,
    coverImage: form.value.coverImage,
    content: form.value.content,
    tags: form.value.tagsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    isPinned: form.value.isPinned,
  };
  try {
    if (isCreateMode.value) {
      await $fetch("/api/admin/posts", {
        method: "POST",
        credentials: "include",
        body: payload,
      });
    } else {
      await $fetch(`/api/admin/posts/${postId.value}`, {
        method: "PUT",
        credentials: "include",
        body: payload,
      });
    }
    await router.push("/admin/dashboard/posts");
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadPost();
});
</script>
