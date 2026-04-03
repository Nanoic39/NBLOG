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

    <div class="grid lg:grid-cols-[1fr_380px] gap-4">
      <section class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm">
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="item in toolbarItems"
            :key="item.key"
            type="button"
            class="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300"
            @click="applyToolbar(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="relative">
          <div
            v-if="floatingToolbar.visible"
            class="absolute z-10 left-3 -top-12 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 shadow-lg flex items-center gap-1"
          >
            <button
              v-for="item in floatingItems"
              :key="item.key"
              type="button"
              class="px-2 py-1 rounded text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-100/80 dark:hover:bg-sky-500/20"
              @click="applyToolbar(item.key)"
            >
              {{ item.label }}
            </button>
          </div>
          <textarea
            ref="editorRef"
            v-model="form.content"
            rows="28"
            class="w-full min-h-[560px] resize-y rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/45 px-3 py-3 font-mono text-sm leading-7"
            placeholder="在此输入 Markdown 正文内容"
            @select="syncFloatingToolbar"
            @keyup="syncFloatingToolbar"
            @mouseup="syncFloatingToolbar"
          ></textarea>
        </div>
      </section>

      <aside class="rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-4 shadow-sm space-y-4">
        <input v-model="form.title" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="标题" />
        <input v-model="form.slug" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="slug（可空自动生成）" />
        <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40" placeholder="摘要"></textarea>

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500 dark:text-slate-400">作者（可多个，可排序）</p>
            <button
              type="button"
              class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600"
              @click="addAuthor"
            >
              添加作者
            </button>
          </div>
          <div
            v-for="(item, index) in form.authors"
            :key="`${index}-${item.name}`"
            class="space-y-1.5 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5"
          >
            <input
              v-model="item.name"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm"
              placeholder="作者名"
            />
            <input
              v-model="item.socialUrl"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm"
              placeholder="社交链接（可空）"
            />
            <div class="flex items-center gap-1">
              <button type="button" class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600" @click="moveAuthor(index, -1)">上移</button>
              <button type="button" class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600" @click="moveAuthor(index, 1)">下移</button>
              <button type="button" class="text-xs px-2 py-1 rounded border border-rose-300 text-rose-600" @click="removeAuthor(index)">删除</button>
            </div>
          </div>
        </div>

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">标签（可选已有 + 可输入新标签）</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in selectedTags"
              :key="tag"
              type="button"
              class="px-2 py-1 rounded-lg text-xs bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </button>
          </div>
          <div class="flex gap-2">
            <input
              v-model="tagInput"
              class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm"
              placeholder="输入标签后回车"
              @keydown.enter.prevent="addTagFromInput"
            />
            <button type="button" class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm" @click="addTagFromInput">添加</button>
          </div>
          <div class="max-h-24 overflow-auto flex flex-wrap gap-1.5">
            <button
              v-for="tag in allTags"
              :key="tag"
              type="button"
              class="px-2 py-1 rounded-lg text-xs border"
              :class="selectedTags.includes(tag) ? 'border-sky-500 text-sky-600 dark:text-sky-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">原创类型</p>
          <select v-model="form.articleType" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm">
            <option value="original">原创</option>
            <option value="co-original">原创合作</option>
            <option value="translation">翻译</option>
            <option value="repost">转载</option>
          </select>
          <input
            v-if="form.articleType === 'translation' || form.articleType === 'repost'"
            v-model="form.sourceUrl"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm"
            placeholder="文章来源链接（可空）"
          />
        </div>

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">CC 许可（可空）</p>
          <select v-model="form.licenseCc" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm">
            <option value="">不设置</option>
            <option value="CC BY 4.0">CC BY 4.0</option>
            <option value="CC BY-SA 4.0">CC BY-SA 4.0</option>
            <option value="CC BY-NC 4.0">CC BY-NC 4.0</option>
            <option value="CC BY-NC-SA 4.0">CC BY-NC-SA 4.0</option>
            <option value="CC BY-ND 4.0">CC BY-ND 4.0</option>
            <option value="CC0 1.0">CC0 1.0</option>
          </select>
        </div>

        <div class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">封面图（选择已有 / 手输链接 / 上传）</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
              :disabled="isLoadingMedia"
              @click="loadMyImages"
            >
              {{ isLoadingMedia ? "加载中..." : "刷新图库" }}
            </button>
            <input type="file" accept="image/*" @change="uploadCoverImage" class="text-xs" />
          </div>
          <input v-model="form.coverImage" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-900/40 text-sm" placeholder="封面链接" />
          <div class="max-h-28 overflow-auto grid grid-cols-4 gap-2">
            <button
              v-for="url in mediaImages"
              :key="url"
              type="button"
              class="rounded-lg overflow-hidden border"
              :class="form.coverImage === url ? 'border-sky-500' : 'border-slate-300 dark:border-slate-700'"
              @click="form.coverImage = url"
            >
              <img :src="url" alt="media" class="w-full h-12 object-cover" />
            </button>
          </div>
          <div v-if="form.coverImage" class="space-y-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">预览效果</p>
            <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
              <p class="text-[11px] text-slate-500 mb-1">PC</p>
              <img :src="form.coverImage" alt="cover-pc" class="w-full h-24 object-cover rounded" />
            </div>
            <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-w-[170px]">
              <p class="text-[11px] text-slate-500 mb-1">移动端</p>
              <img :src="form.coverImage" alt="cover-mobile" class="w-full h-36 object-cover rounded" />
            </div>
          </div>
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
import { computed, nextTick, onMounted, ref, watch } from "vue";

definePageMeta({
  middleware: "admin",
  layout: "admin" as any,
  viewTransition: false,
});

type AuthorItem = {
  name: string;
  socialUrl: string;
};

type PostForm = {
  title: string;
  slug: string;
  description: string;
  authors: AuthorItem[];
  coverImage: string;
  content: string;
  views: number;
  isPinned: boolean;
  articleType: "original" | "co-original" | "translation" | "repost";
  sourceUrl: string;
  licenseCc: string;
};

const route = useRoute();
const router = useRouter();
const postId = computed(() => String(route.params.id || ""));
const isCreateMode = computed(() => postId.value === "new");
const isSaving = ref(false);
const isLoadingMedia = ref(false);
const allTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const tagInput = ref("");
const mediaImages = ref<string[]>([]);
const editorRef = ref<HTMLTextAreaElement | null>(null);
const floatingToolbar = ref({
  visible: false,
  selectedText: "",
});

const toolbarItems = [
  { key: "bold", label: "加粗" },
  { key: "italic", label: "斜体" },
  { key: "underline", label: "下划线" },
  { key: "strike", label: "删除线" },
  { key: "quote", label: "引用" },
  { key: "heimu", label: "黑幕" },
  { key: "ul", label: "列表" },
  { key: "code", label: "代码块" },
  { key: "image", label: "图片" },
  { key: "link", label: "链接" },
  { key: "math", label: "公式" },
  { key: "custom", label: "自定义区块" },
  { key: "divider", label: "分割线" },
  { key: "layout", label: "布局设置" },
] as const;

const floatingItems = computed(() => {
  if (!floatingToolbar.value.selectedText) return [];
  const isImageSelection = /!\[[^\]]*\]\([^)]+\)/.test(floatingToolbar.value.selectedText);
  if (isImageSelection) {
    return [
      { key: "imageCenter", label: "居中图" },
      { key: "imageCaption", label: "图注" },
      { key: "link", label: "包裹链接" },
    ];
  }
  return [
    { key: "bold", label: "加粗" },
    { key: "italic", label: "斜体" },
    { key: "link", label: "链接" },
    { key: "quote", label: "引用" },
  ];
});

const createDefaultForm = (): PostForm => ({
  title: "",
  slug: "",
  description: "",
  authors: [{ name: "nanoic39", socialUrl: "" }],
  coverImage: "",
  content: "",
  views: 0,
  isPinned: false,
  articleType: "original",
  sourceUrl: "",
  licenseCc: "",
});

const form = ref<PostForm>(createDefaultForm());

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

const addAuthor = () => {
  form.value.authors.push({ name: "", socialUrl: "" });
};

const removeAuthor = (index: number) => {
  if (form.value.authors.length <= 1) {
    form.value.authors[0] = { name: "nanoic39", socialUrl: "" };
    return;
  }
  form.value.authors.splice(index, 1);
};

const moveAuthor = (index: number, direction: -1 | 1) => {
  const next = index + direction;
  if (next < 0 || next >= form.value.authors.length) return;
  const list = [...form.value.authors];
  const current = list[index];
  const target = list[next];
  if (!current || !target) return;
  list[index] = target;
  list[next] = current;
  form.value.authors = list;
};

const normalizeTag = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const addTag = (raw: string) => {
  const tag = normalizeTag(raw);
  if (!tag || selectedTags.value.includes(tag)) return;
  selectedTags.value.push(tag);
  if (!allTags.value.includes(tag)) allTags.value.unshift(tag);
};

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((item) => item !== tag);
};

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    removeTag(tag);
  } else {
    addTag(tag);
  }
};

const addTagFromInput = () => {
  addTag(tagInput.value);
  tagInput.value = "";
};

const loadTags = async () => {
  try {
    const result = (await $fetch("/api/admin/tags", {
      credentials: "include",
    })) as any;
    const tags = Array.isArray(result?.tags)
      ? result.tags.map((item: any) => String(item?.name || "").trim()).filter(Boolean)
      : [];
    allTags.value = tags;
  } catch {}
};

const loadMyImages = async () => {
  isLoadingMedia.value = true;
  try {
    const result = (await $fetch("/api/admin/media-images", {
      credentials: "include",
    })) as any;
    mediaImages.value = Array.isArray(result?.data)
      ? result.data.map((item: any) => String(item || "").trim()).filter(Boolean)
      : [];
  } catch {
    mediaImages.value = [];
  } finally {
    isLoadingMedia.value = false;
  }
};

const syncFloatingToolbar = () => {
  const editor = editorRef.value;
  if (!editor) return;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const selected = end > start ? form.value.content.slice(start, end) : "";
  floatingToolbar.value = {
    visible: selected.length > 0,
    selectedText: selected,
  };
};

const wrapSelection = (prefix: string, suffix = prefix) => {
  const editor = editorRef.value;
  if (!editor) return;
  const value = form.value.content;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const selected = value.slice(start, end) || "文本";
  form.value.content = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
  nextTick(() => {
    const pos = start + prefix.length + selected.length + suffix.length;
    editor.focus();
    editor.setSelectionRange(pos, pos);
    syncFloatingToolbar();
  });
};

const insertAtSelection = (snippet: string) => {
  const editor = editorRef.value;
  if (!editor) return;
  const value = form.value.content;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  form.value.content = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  nextTick(() => {
    const pos = start + snippet.length;
    editor.focus();
    editor.setSelectionRange(pos, pos);
    syncFloatingToolbar();
  });
};

const applyToolbar = (key: string) => {
  if (key === "bold") return wrapSelection("**");
  if (key === "italic") return wrapSelection("*");
  if (key === "underline") return wrapSelection("<u>", "</u>");
  if (key === "strike") return wrapSelection("~~");
  if (key === "quote") return wrapSelection("> ", "");
  if (key === "heimu") return wrapSelection('<span class="heimu">', "</span>");
  if (key === "ul") return insertAtSelection("\n- 列表项一\n- 列表项二\n");
  if (key === "code") return insertAtSelection("\n```ts\nconst value = 1;\n```\n");
  if (key === "image") {
    const url = import.meta.client ? window.prompt("输入图片地址") || "" : "";
    return insertAtSelection(`![图片说明](${url || "https://example.com/image.png"})`);
  }
  if (key === "link") {
    const url = import.meta.client ? window.prompt("输入链接地址") || "" : "";
    return wrapSelection("[", `](${url || "https://example.com"})`);
  }
  if (key === "math") return insertAtSelection("\n$$\na^2+b^2=c^2\n$$\n");
  if (key === "custom") return insertAtSelection("\n:::info\n自定义区块\n:::\n");
  if (key === "divider") return insertAtSelection("\n---\n");
  if (key === "layout") return insertAtSelection("\n<div class=\"grid grid-cols-2 gap-4\">\n<div>左侧</div>\n<div>右侧</div>\n</div>\n");
  if (key === "imageCenter") return wrapSelection('<div class="text-center">', "</div>");
  if (key === "imageCaption") return insertAtSelection("\n<figcaption>图片说明</figcaption>\n");
};

const loadPost = async () => {
  if (isCreateMode.value) {
    form.value = createDefaultForm();
    selectedTags.value = [];
    return;
  }
  try {
    const result = (await $fetch(`/api/admin/posts/${postId.value}`, {
      credentials: "include",
    })) as any;
    const post = result?.data || result || {};
    const authorsRaw = Array.isArray(post.authors)
      ? post.authors
      : String(post.author || "")
          .split("/")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((name) => ({ name, socialUrl: "" }));
    form.value = {
      title: String(post.title || ""),
      slug: String(post.slug || ""),
      description: String(post.description || ""),
      authors:
        authorsRaw.length > 0
          ? authorsRaw.map((item: any) => ({
              name: String(item?.name || "").trim(),
              socialUrl: String(item?.socialUrl || "").trim(),
            }))
          : [{ name: "nanoic39", socialUrl: "" }],
      coverImage: String(post.coverImage || ""),
      content: String(post.content || ""),
      views: Number(post.views || 0),
      isPinned: Boolean(post.isPinned),
      articleType: (String(post.articleType || "original") as any) || "original",
      sourceUrl: String(post.sourceUrl || ""),
      licenseCc: String(post.license?.cc || ""),
    };
    selectedTags.value = Array.isArray(post.tags)
      ? post.tags.map((item: any) => String(item || "").trim()).filter(Boolean)
      : [];
    selectedTags.value.forEach((tag) => {
      if (!allTags.value.includes(tag)) allTags.value.unshift(tag);
    });
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

const createLicenseIcons = (cc: string) => {
  const normalized = String(cc || "").toLowerCase();
  if (!normalized) return [];
  const icons = ["cc"];
  if (normalized.includes("by")) icons.push("by");
  if (normalized.includes("nc")) icons.push("nc");
  if (normalized.includes("nd")) icons.push("nd");
  if (normalized.includes("sa")) icons.push("sa");
  if (normalized.includes("cc0")) icons.push("zero");
  return icons;
};

const savePost = async () => {
  isSaving.value = true;
  const authors = form.value.authors
    .map((item) => ({
      name: String(item.name || "").trim(),
      socialUrl: String(item.socialUrl || "").trim(),
    }))
    .filter((item) => item.name);
  const finalAuthors = authors.length ? authors : [{ name: "nanoic39", socialUrl: "" }];
  const payload = {
    title: form.value.title,
    slug: form.value.slug,
    description: form.value.description,
    author: finalAuthors.map((item) => item.name).join(" / "),
    authors: finalAuthors,
    coverImage: form.value.coverImage,
    content: form.value.content,
    tags: selectedTags.value,
    isPinned: form.value.isPinned,
    articleType: form.value.articleType,
    sourceUrl:
      form.value.articleType === "translation" || form.value.articleType === "repost"
        ? form.value.sourceUrl
        : "",
    license: form.value.licenseCc
      ? {
          cc: form.value.licenseCc,
          icon: createLicenseIcons(form.value.licenseCc),
        }
      : undefined,
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

onMounted(async () => {
  await Promise.all([loadTags(), loadMyImages()]);
  await loadPost();
});

watch(
  () => route.params.id,
  () => {
    loadPost();
  },
);
</script>
