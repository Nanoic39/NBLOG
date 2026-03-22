<template>
  <div class="relative min-h-screen">
    <!-- 浅色模糊背景点缀 -->
    <div
      class="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F8FAFC] dark:bg-[#121212]"
    >
      <!-- 白色为主色的点缀 -->
      <div
        class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-white dark:bg-white/5 rounded-full blur-[150px] opacity-90"
      ></div>
      <div
        class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-50/80 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-80"
      ></div>
      <div
        class="absolute top-[30%] left-[50%] w-[50%] h-[50%] bg-indigo-50/60 dark:bg-indigo-900/10 rounded-full blur-[120px] opacity-70"
      ></div>
      <!-- 整体玻璃遮罩层，让背景更柔和 -->
      <div
        class="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px]"
      ></div>
    </div>

    <!-- 主体内容区 max-w-[1600px] 以容纳 1200px 文章及两侧功能 -->
    <div
      class="max-w-[1600px] w-full mx-auto px-4 py-8 mt-16 md:mt-24 relative z-10 flex flex-col lg:flex-row justify-center items-start gap-6 xl:gap-8"
    >
      <!-- 左侧：返回按钮 (跟随页面滚动，宽屏可见) -->
      <aside
        class="hidden lg:block w-12 xl:w-16 shrink-0 relative lg:sticky lg:top-24 lg:self-start"
      >
        <div class="z-20">
          <button
            @click="router.back()"
            class="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-[#242424]/80 hover:bg-white dark:hover:bg-[#333] text-gray-600 dark:text-gray-300 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100/80 dark:border-gray-700/80 transition-all hover:scale-110"
            title="返回上一页"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
          </button>
        </div>
      </aside>

      <!-- 中间：文章主体 (最大宽度1200px) -->
      <main class="flex-1 min-w-0 w-full max-w-[1200px]">
        <div v-if="pending" class="flex justify-center py-20">
          <span class="animate-pulse text-[#6B7280] dark:text-[#9ca3af]"
            >加载中...</span
          >
        </div>

        <div v-else-if="error" class="text-center py-20">
          <h2 class="text-2xl font-bold text-red-500 mb-4">文章加载失败</h2>
          <p class="text-[#6B7280] dark:text-[#9ca3af]">{{ error.message }}</p>
          <NuxtLink
            to="/"
            class="mt-6 inline-block text-[#0284C7] hover:underline"
            >返回首页</NuxtLink
          >
        </div>

        <article
          v-else-if="article"
          class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-2xl p-6 md:p-10 lg:p-12 shadow-lg border border-gray-100/50 dark:border-gray-700/50"
        >
          <!-- 封面图 -->
          <div
            v-if="article.coverImage"
            class="w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden relative"
          >
            <img
              :src="article.coverImage"
              :alt="article.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- 文章头部信息 -->
          <header
            class="mb-10 border-b border-gray-200/60 dark:border-gray-700/60 pb-8"
          >
            <h1
              class="text-3xl md:text-4xl font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-8 leading-tight"
            >
              {{ article.title }}
            </h1>

            <!-- 重新美化的文章元数据说明 (卡片式网格布局) -->
            <div
              class="grid grid-cols-2 md:flex md:flex-wrap md:justify-between gap-3 mb-6"
            >
              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  作者
                </span>
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate w-full text-center"
                  >{{ article.author }}</span
                >
              </div>

              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  最初发布于
                </span>
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200"
                  >{{ formatDate(article.pubDate) }}</span
                >
              </div>

              <div
                v-if="article.editDate"
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
                :title="updateWarning.text"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                  最后更新于
                </span>
                <span
                  class="text-sm font-medium transition-colors"
                  :class="updateWarning.colorClass"
                  >{{ formatDate(article.editDate) }}</span
                >
              </div>

              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  文章字数
                </span>
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200"
                  >{{ article.wordCount }} 字</span
                >
              </div>

              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  预计阅读时长
                </span>
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200"
                  >约 {{ Math.ceil((article.wordCount || 0) / 300) }} 分钟</span
                >
              </div>

              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                  本文阅读量
                </span>
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200"
                  >{{ article.views || 0 }} 次</span
                >
              </div>
            </div>

            <div
              v-if="article.tags && article.tags.length > 0"
              class="mt-4 flex flex-wrap gap-2"
            >
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-[#0284C7] dark:text-[#38bdf8] rounded-full border border-blue-100 dark:border-blue-800/50"
              >
                #{{ tag }}
              </span>
            </div>
          </header>

          <!-- 文章内容 -->
          <div
            class="prose custom-prose dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-[#0284C7] hover:prose-a:text-[#0369a1]"
            v-html="renderedContent"
          ></div>
        </article>

        <!-- 评论区 (位于文章卡片外部) -->
        <CommentSection :articleId="article.id" />
      </main>

      <!-- 右侧：摘要/目录 (跟随页面滚动，宽屏可见) -->
      <aside
        class="hidden lg:flex w-56 xl:w-64 shrink-0 relative lg:sticky lg:top-24 lg:self-start flex-col gap-6"
      >
        <!-- 摘要面板 -->
        <div
          v-if="article?.description"
          class="z-20 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 dark:border-gray-700/80 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <h3
            class="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 text-[#0284C7]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            文章摘要
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ article.description }}
          </p>
        </div>

        <!-- 目录面板 -->
        <div
          class="z-20 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 dark:border-gray-700/80 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <h3
            class="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 text-[#0284C7]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              ></path>
            </svg>
            文章目录
          </h3>
          <ul
            class="text-sm text-gray-600 dark:text-gray-400 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar pr-2"
          >
            <li
              v-for="item in hierarchicalToc"
              :key="item.id"
              class="flex flex-col gap-1"
            >
              <div class="flex items-center group">
                <button
                  v-if="item.children && item.children.length > 0"
                  @click="toggleTocNode(item.id)"
                  class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mr-1 shrink-0"
                >
                  <svg
                    class="w-3.5 h-3.5 transition-transform duration-200"
                    :class="{ 'rotate-90': expandedTocNodes.has(item.id) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
                <div v-else class="w-6 shrink-0"></div>
                <button
                  @click="scrollToHeading(item.id)"
                  class="transition-all duration-300 block w-full text-left truncate cursor-pointer py-1.5 px-2 rounded-lg font-medium relative overflow-hidden"
                  :class="
                    activeTocId === item.id
                      ? 'text-[#0284C7] dark:text-[#38bdf8] bg-blue-50/50 dark:bg-blue-900/20 translate-x-1'
                      : 'hover:text-[#0284C7] dark:hover:text-[#38bdf8] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  "
                  :title="item.text"
                >
                  <!-- 激活状态的左侧指示条 -->
                  <div
                    class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0284C7] dark:bg-[#38bdf8] transition-all duration-300 rounded-r-full"
                    :class="
                      activeTocId === item.id
                        ? 'opacity-100 scale-y-100'
                        : 'opacity-0 scale-y-0'
                    "
                  ></div>
                  {{ item.text }}
                </button>
              </div>

              <!-- 子目录 (三级标题) - 带有平滑展开/收起动画 -->
              <div
                v-if="item.children && item.children.length > 0"
                class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
                :class="
                  expandedTocNodes.has(item.id)
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                "
              >
                <ul
                  class="overflow-hidden pl-6 border-l-2 border-gray-100 dark:border-gray-800 ml-2.5"
                >
                  <div class="space-y-1.5 mt-1 pb-1">
                    <li v-for="child in item.children" :key="child.id">
                      <button
                        @click="scrollToHeading(child.id)"
                        class="transition-all duration-300 block w-full text-left truncate cursor-pointer py-1 px-2 rounded-md text-xs relative overflow-hidden"
                        :class="
                          activeTocId === child.id
                            ? 'text-[#0284C7] dark:text-[#38bdf8] bg-blue-50/30 dark:bg-blue-900/10 translate-x-1 font-medium'
                            : 'text-gray-500 dark:text-gray-500 hover:text-[#0284C7] dark:hover:text-[#38bdf8] hover:bg-gray-50 dark:hover:bg-gray-800/30'
                        "
                        :title="child.text"
                      >
                        <!-- 激活状态的左侧点缀 -->
                        <div
                          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#0284C7] dark:bg-[#38bdf8] transition-all duration-300 rounded-full"
                          :class="
                            activeTocId === child.id
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-0'
                          "
                        ></div>
                        <span
                          class="transition-transform duration-300 inline-block"
                          :class="
                            activeTocId === child.id ? 'translate-x-1' : ''
                          "
                        >
                          {{ child.text }}
                        </span>
                      </button>
                    </li>
                  </div>
                </ul>
              </div>
            </li>
            <li
              v-if="hierarchicalToc.length === 0"
              class="text-gray-400 italic text-xs"
            >
              暂无目录
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked";
import DOMPurify from "dompurify";

const route = useRoute();
const router = useRouter();
const articleSlug = route.params.slug as string;

// Fetch article data
const {
  data: article,
  pending,
  error,
} = await useFetch(`/api/article/detail`, {
  query: { slug: articleSlug },
});

// Format date helper
const formatDate = (timestamp: string | number) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Calculate days since last update
const daysSinceUpdate = computed(() => {
  if (!article.value?.editDate) return 0;
  const editDate = new Date(Number(article.value.editDate));
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - editDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Determine update warning color and text based on days since update
const updateWarning = computed(() => {
  const days = daysSinceUpdate.value;
  if (days <= 30)
    return { colorClass: "text-gray-800 dark:text-gray-200", text: "" };

  if (days <= 90)
    return {
      colorClass: "text-orange-500 dark:text-orange-400",
      text: `本文最后更新于 ${days} 天前，内容可能已过时`,
    };
  if (days <= 180)
    return {
      colorClass: "text-red-500 dark:text-red-400",
      text: `本文最后更新于 ${days} 天前，内容可能已经严重过时`,
    };
  return {
    colorClass: "text-red-600 dark:text-red-500 font-bold",
    text: `本文最后更新于 ${days} 天前，内容很可能已经失效`,
  };
});

const tocList = ref<{ level: number; text: string; id: string }[]>([]);
const expandedTocNodes = ref<Set<string>>(new Set());
const activeTocId = ref<string>("");

// Scroll spy logic
const handleScroll = () => {
    const headings = Array.from(document.querySelectorAll('.prose h2, .prose h3'));
    if (headings.length === 0) return;

    const scrollPosition = window.scrollY + 150; // offset for sticky header
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    let currentId = '';
    
    // Check if scrolled to the absolute bottom of the page
    if (window.scrollY + windowHeight >= documentHeight - 50) {
      // If at bottom, always highlight the last heading
      const lastHeading = headings[headings.length - 1];
      if (lastHeading) {
        currentId = lastHeading.id;
      }
    } else {
      // Normal scroll tracking
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement;
        const top = heading.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPosition) {
          currentId = heading.id;
        } else {
          break;
        }
      }
    }

    if (!currentId && headings.length > 0) {
      const firstHeading = headings[0];
    if (firstHeading) {
      currentId = firstHeading.id;
    }
  }

  if (currentId && activeTocId.value !== currentId) {
    activeTocId.value = currentId;

    // Auto expand parent if active item is a child, and collapse others
    const newSet = new Set<string>();

    for (const h2 of hierarchicalToc.value) {
      // Check if current active ID is this h2 or any of its children
      const isActiveSection =
        h2.id === currentId ||
        (h2.children && h2.children.some((c: any) => c.id === currentId));

      if (isActiveSection) {
        newSet.add(h2.id); // Expand only the active section
      }
    }

    // Update the expanded nodes to only include the active section
    expandedTocNodes.value = newSet;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  setTimeout(handleScroll, 500); // Initial check after render
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Handle smooth scroll to heading without adding to history
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// Toggle TOC node expansion
const toggleTocNode = (id: string) => {
  const newSet = new Set(expandedTocNodes.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedTocNodes.value = newSet;
};

// Build hierarchical TOC structure for rendering
const hierarchicalToc = computed(() => {
  const result: any[] = [];
  let currentH2: any = null;

  tocList.value.forEach((item) => {
    if (item.level === 2) {
      currentH2 = { ...item, children: [] };
      result.push(currentH2);
    } else if (item.level === 3 && currentH2) {
      currentH2.children.push(item);
    }
  });

  return result;
});

// Render markdown to HTML securely and extract TOC
const renderedContent = computed(() => {
  if (!article.value?.content) return "";

  // Parse markdown
  const rawHtml = marked.parse(article.value.content) as string;

  const headings: { level: number; text: string; id: string }[] = [];
  let headingIndex = 0;

  const htmlWithIds = rawHtml.replace(
    /<h([2-3])>([\s\S]*?)<\/h\1>/g,
    (match, level, innerHtml) => {
      const pureText = innerHtml.replace(/<[^>]*>?/gm, "").trim();
      const id = `heading-${headingIndex++}`;
      headings.push({ level: Number(level), text: pureText, id });
      return `<h${level} id="${id}" class="scroll-mt-24">${innerHtml}</h${level}>`;
    },
  );

  tocList.value = headings;

  // Clean HTML if we are on client side
  if (import.meta.client) {
    return DOMPurify.sanitize(htmlWithIds, { ADD_ATTR: ["id", "class"] });
  }

  return htmlWithIds;
});
</script>

<style>
@reference "tailwindcss";

/* Markdown 容器基础样式覆盖 */
.custom-prose {
  @apply text-[#4B5563] dark:text-[#d1d5db];
  font-size: 1.125rem; /* 基础字号调大到18px */
  line-height: 1.85; /* 增加行高，提升阅读舒适度 */
  letter-spacing: 0.5px;
}

@media (min-width: 768px) {
  .custom-prose {
    font-size: 1.2rem; /* md以上屏幕字号调大到19.2px */
  }
}

@media (min-width: 1024px) {
  .custom-prose {
    font-size: 1.25rem; /* lg以上屏幕字号调大到20px */
  }
}

/* 标题样式 */
.custom-prose h1,
.custom-prose h2,
.custom-prose h3,
.custom-prose h4 {
  @apply text-[#2A2E33] dark:text-[#e0e0e0] mt-10 mb-5;
  font-weight: 600; /* 使用600代替bold(700)，防止圆体过粗发糊 */
  letter-spacing: 0.5px;
}

.custom-prose strong, .custom-prose b {
  @apply text-[#111827] dark:text-[#f3f4f6];
  font-weight: 600;
  padding: 0 2px;
}

.custom-prose h2 {
  @apply pb-2 border-b border-gray-200 dark:border-gray-700;
}

/* 代码块样式 */
.custom-prose pre {
  @apply bg-[#1e1e1e] text-[#d4d4d4] rounded-xl p-4 my-6 overflow-x-auto shadow-sm border border-gray-800;
}

.custom-prose code {
  @apply bg-gray-100 dark:bg-gray-800 text-[#0284C7] dark:text-[#38bdf8] px-1.5 py-0.5 rounded-md font-mono text-sm before:content-none after:content-none;
}

.custom-prose pre code {
  @apply bg-transparent text-inherit p-0 border-0 text-[0.9em];
}

/* 引用块样式 */
.custom-prose blockquote {
  @apply border-l-4 border-[#0284C7] bg-blue-50/50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 py-2 px-4 my-6 rounded-r-lg font-normal italic;
}

/* 图片样式 */
.custom-prose img {
  @apply rounded-xl shadow-md mx-auto my-8 border border-gray-100 dark:border-gray-800;
}

/* 自定义 Feature Card 样式 */
.custom-prose .feature-card {
  @apply bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-blue-100 dark:border-gray-700 my-8 shadow-sm;
}
.custom-prose .feature-card ul {
  @apply m-0 p-0 list-none space-y-3;
}
.custom-prose .feature-card li {
  @apply flex items-center gap-2 m-0 p-0 before:content-none;
}
</style>
