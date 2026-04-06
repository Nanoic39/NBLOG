<template>
  <section class="h-full min-h-0 flex flex-col gap-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">标签管理</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">统一维护文章标签命名与清理</p>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="newTagName"
          placeholder="输入新标签名"
          class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm w-44"
        />
        <button
          @click="createTag"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
          :disabled="isCreating"
        >
          {{ isCreating ? "新增中..." : "新增标签" }}
        </button>
        <button
          @click="loadTags"
          :disabled="isLoading"
          class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-60 transition-colors bg-white dark:bg-slate-900 shadow-sm"
        >
          {{ isLoading ? "刷新中..." : "刷新标签" }}
        </button>
      </div>
    </div>

    <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm overflow-auto flex-1 min-h-0">
      <div v-if="tags.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        暂无标签
      </div>
      <table v-else class="w-full text-sm min-w-[860px]">
        <thead class="sticky top-0 z-10 bg-white dark:bg-slate-900">
          <tr class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th class="py-2.5 pr-3">标签名</th>
            <th class="py-2.5 pr-3">文章数</th>
            <th class="py-2.5 pr-3">关联文章</th>
            <th class="py-2.5 pr-3">重命名</th>
            <th class="py-2.5 pr-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="tag in tags" :key="tag.name">
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="py-3 pr-3 font-medium text-slate-900 dark:text-slate-100 break-all">#{{ tag.name }}</td>
              <td class="py-3 pr-3">{{ tag.count }}</td>
              <td class="py-3 pr-3">
                <button
                  @click="toggleRelated(tag.name)"
                  class="text-sky-600 dark:text-sky-300 hover:underline"
                >
                  查看关联（{{ tag.relatedPosts.length }}）
                </button>
              </td>
              <td class="py-3 pr-3">
                <div class="flex items-center gap-2 max-w-[320px]">
                  <input
                    v-model="renameMap[tag.name]"
                    class="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
                    placeholder="输入新标签名"
                  />
                  <button
                    @click="renameTag(tag.name)"
                    class="px-2.5 py-1.5 text-xs rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                  >
                    重命名
                  </button>
                </div>
              </td>
              <td class="py-3 pr-3">
                <button
                  @click="deleteTag(tag.name)"
                  class="px-2.5 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr
              v-if="expandedTagMap[tag.name]"
              class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
            >
              <td colspan="5" class="py-3 px-3">
                <div
                  v-if="tag.relatedPosts.length === 0"
                  class="text-xs text-slate-500 dark:text-slate-400"
                >
                  暂无关联文章
                </div>
                <div v-else class="grid md:grid-cols-2 gap-2">
                  <NuxtLink
                    v-for="post in tag.relatedPosts"
                    :key="post.id"
                    :to="`/admin/dashboard/posts/${post.id}`"
                    class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs hover:border-sky-400"
                  >
                    <div class="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {{ post.title || "未命名文章" }}
                    </div>
                    <div class="text-slate-500 dark:text-slate-400 mt-0.5">
                      ID：{{ post.id }}
                    </div>
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </template>
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

type TagItem = {
  name: string;
  count: number;
  relatedPosts: Array<{ id: string; title: string }>;
};

const isLoading = ref(false);
const isCreating = ref(false);
const tags = ref<TagItem[]>([]);
const renameMap = ref<Record<string, string>>({});
const expandedTagMap = ref<Record<string, boolean>>({});
const newTagName = ref("");
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};

const parseError = (error: any) =>
  error?.data?.message || error?.statusMessage || "请求失败，请稍后重试";

const loadTags = async () => {
  isLoading.value = true;
  try {
    const [tagResult, postResult] = (await Promise.all([
      $fetch(withApiBase("/api/admin/tags"), {
        credentials: "include",
      }),
      $fetch(withApiBase("/api/admin/posts"), {
        credentials: "include",
      }),
    ])) as [any, any];
    const sourceTags = Array.isArray(tagResult?.tags) ? tagResult.tags : [];
    const posts = Array.isArray(postResult?.posts) ? postResult.posts : [];
    const relatedMap = new Map<string, Array<{ id: string; title: string }>>();
    for (const post of posts) {
      const postId = String(post?.id || "").trim();
      const postTitle = String(post?.title || "").trim();
      const postTags = Array.isArray(post?.tags)
        ? post.tags.map((x: any) => String(x || "").trim()).filter(Boolean)
        : [];
      for (const tag of postTags) {
        const list = relatedMap.get(tag) || [];
        list.push({ id: postId, title: postTitle });
        relatedMap.set(tag, list);
      }
    }
    tags.value = sourceTags.map((item: any) => {
      const name = String(item?.name || "").trim();
      const relatedPosts = relatedMap.get(name) || [];
      return {
        name,
        count: Number(item?.count || relatedPosts.length || 0),
        relatedPosts,
      };
    });
    const nextMap: Record<string, string> = {};
    const nextExpanded: Record<string, boolean> = {};
    for (const item of tags.value) {
      nextMap[item.name] = "";
      nextExpanded[item.name] = Boolean(expandedTagMap.value[item.name]);
    }
    renameMap.value = nextMap;
    expandedTagMap.value = nextExpanded;
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isLoading.value = false;
  }
};

const renameTag = async (name: string) => {
  const newName = String(renameMap.value[name] || "").trim();
  if (!newName) {
    alert("请输入新标签名");
    return;
  }
  try {
    await $fetch(withApiBase("/api/admin/tags"), {
      method: "POST",
      credentials: "include",
      body: {
        action: "rename",
        name,
        newName,
      },
    });
    await loadTags();
  } catch (error: any) {
    alert(parseError(error));
  }
};

const deleteTag = async (name: string) => {
  if (!window.confirm(`确认删除标签「${name}」吗？`)) return;
  try {
    await $fetch(withApiBase("/api/admin/tags"), {
      method: "POST",
      credentials: "include",
      body: {
        action: "delete",
        name,
      },
    });
    await loadTags();
  } catch (error: any) {
    alert(parseError(error));
  }
};

const createTag = async () => {
  const name = String(newTagName.value || "").trim();
  if (!name) {
    alert("请输入标签名");
    return;
  }
  isCreating.value = true;
  try {
    await $fetch(withApiBase("/api/admin/tags"), {
      method: "POST",
      credentials: "include",
      body: {
        action: "create",
        name,
      },
    });
    newTagName.value = "";
    await loadTags();
  } catch (error: any) {
    alert(parseError(error));
  } finally {
    isCreating.value = false;
  }
};

const toggleRelated = (name: string) => {
  expandedTagMap.value[name] = !expandedTagMap.value[name];
};

onMounted(() => {
  loadTags();
});
</script>
