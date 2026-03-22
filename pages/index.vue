<template>
  <div class="contain">
    <!-- Hero Section -->
    <div
      class="hero-scene relative w-full h-screen min-h-[600px] flex flex-col md:flex-row items-center justify-center px-6 md:px-24 overflow-hidden"
    >
      <!-- Background Elements -->
      <div
        class="absolute inset-0 z-0 bg-gradient-to-b from-[#E9E0FF]/30 to-[#F9FAFB] dark:from-[#1a1a2e]/40 dark:to-[#1a1a1a] transition-colors duration-300"
      ></div>
      <div
        class="absolute top-1/4 left-1/4 w-64 h-64 bg-[#BFE9FF]/20 dark:bg-[#BFE9FF]/10 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFE9F3]/30 dark:bg-[#FFE9F3]/10 rounded-full blur-3xl animate-pulse delay-1000"
      ></div>

      <!-- Left Content: Image -->
      <div
        class="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end md:pr-12 mb-12 md:mb-0"
      >
        <div
          class="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-4 border-white/50 dark:border-white/10 overflow-hidden hover:scale-105 transition-transform duration-500 group cursor-grab active:cursor-grabbing"
        >
          <img
            :src="headImage"
            alt="NANOIC Profile"
            class="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>
      </div>

      <!-- Right Content: Intro -->
      <div
        class="relative z-10 w-full md:w-1/2 text-center md:text-left md:pl-12 flex flex-col items-center md:items-start"
      >
        <div class="mb-4">
          <span
            class="inline-block px-3 py-1 text-xs font-medium tracking-wider text-[#BFE9FF] uppercase bg-[#2A2E33] dark:bg-[#374151] rounded-full"
          >
            A Java Developer
          </span>
        </div>
        <h1
          class="text-4xl md:text-6xl font-mono text-[#2A2E33] dark:text-[#e0e0e0] mb-6 tracking-wide drop-shadow-sm flex items-center justify-center md:justify-start flex-wrap gap-2"
        >
          <span class="text-[#0284C7] font-bold animate-pulse">Yuna@</span>
          <span class="font-bold">NANO1C</span>
        </h1>
        <div class="space-y-6 text-[#6B7280] dark:text-[#9ca3af]">
          <div class="h-8 flex items-center justify-center md:justify-start">
            <span
              class="text-xl md:text-2xl font-light font-mono typing-effect"
            ></span>
            <span
              class="w-0.5 h-6 bg-[#2A2E33] dark:bg-[#e0e0e0] animate-blink ml-1 transition-colors duration-300"
            ></span>
          </div>

          <p
            class="text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed text-center md:text-left"
          >
            <span
              class="text-[#2A2E33] dark:text-[#e0e0e0] font-bold transition-colors duration-300"
              >谦卑心态，务实前行。</span
            ><br />
            热衷于探索前沿技术，追求极致的美化。<br />
            本站用于 记录 / 创作 / 分享 <br />
          </p>

          <!-- 技术栈标签 -->
          <div class="flex flex-wrap justify-center md:justify-start gap-2">
            <span
              v-for="tech in techStack"
              :key="tech"
              class="px-3 py-1 text-sm bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/20 rounded-lg text-[#6B7280] dark:text-[#9ca3af] shadow-sm hover:text-[#BFE9FF] hover:border-[#BFE9FF] transition-colors cursor-default select-none"
            >
              #{{ tech }}
            </span>
          </div>
        </div>

        <!-- 社交链接 -->
        <div class="mt-8 flex justify-center md:justify-start gap-4">
          <template v-for="social in socialLinks" :key="social.name">
            <!-- QQ 特殊处理：Hover 显示号码 -->
            <div
              v-if="social.name === 'QQ'"
              class="relative group cursor-default"
            >
              <div
                class="p-2.5 rounded-full bg-white/60 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 text-[#9CA3AF] group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-[0_4px_12px_rgba(2,132,199,0.3)] transition-all duration-300 group-hover:-translate-y-1"
              >
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  :fill="social.stroke ? 'none' : 'currentColor'"
                  :stroke="social.stroke ? 'currentColor' : 'none'"
                  :stroke-width="social.stroke ? 2 : 0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    :d="social.icon"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <!-- Tooltip -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              >
                {{ social.url }}
                <div
                  class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                ></div>
              </div>
            </div>

            <!-- 其他链接正常渲染 -->
            <a
              v-else
              :href="social.url"
              target="_blank"
              class="p-2.5 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#9CA3AF] hover:text-[#0284C7] dark:hover:text-[#38bdf8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(2,132,199,0.3)] transition-all duration-300 hover:-translate-y-1"
              :title="social.name"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                :fill="social.stroke ? 'none' : 'currentColor'"
                :stroke="social.stroke ? 'currentColor' : 'none'"
                :stroke-width="social.stroke ? 2 : 0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  :d="social.icon"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </template>
        </div>
      </div>

      <!-- 引导指示器 -->
      <div
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-20 opacity-60 hover:opacity-100 transition-opacity"
        @click="scrollToContent"
      >
        <svg
          class="w-6 h-6 text-[#9CA3AF] dark:text-[#6b7280]"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 18L5 8H19L12 18Z" />
        </svg>
      </div>

      <!-- 底部波浪过渡 -->
      <div
        class="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10"
      >
        <svg
          class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            class="fill-[#F9FAFB] dark:fill-[#1a1a1a] transition-colors duration-300"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div
      id="content"
      class="relative z-10 container mx-auto px-6 max-w-screen-2xl py-24 min-h-screen bg-[#F9FAFB] dark:bg-[#1a1a1a] flex flex-col transition-colors duration-300"
    >
      <!-- Header Area -->
      <div>
        <h2
          class="text-3xl font-bold mb-8 flex items-center gap-3 text-[#2A2E33] dark:text-[#e0e0e0]"
        >
          <span class="text-[#0284C7] dark:text-[#38bdf8]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
              />
            </svg>
          </span>
          最新发布
        </h2>
      </div>

      <!-- Main Articles and Sidebar Wrapper -->
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        <!-- Main Articles Area -->
        <div
          id="latest-posts"
          class="flex-1 min-w-0 w-full space-y-8"
        >
          <NuxtLink
            v-for="post in latestPosts"
            :key="post.id"
            :to="`/posts/${post.slug}`"
            class="group bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#0284C7]/20 hover:-translate-y-1 transition-all duration-500 border border-gray-100/50 dark:border-gray-700/50 flex flex-col md:flex-row h-auto md:h-72"
          >
            <!-- 左侧图片 -->
            <div class="w-full md:w-2/5 p-3 shrink-0 h-56 md:h-auto">
              <div class="relative w-full h-full rounded-lg overflow-hidden">
                <img
                  :src="
                    post.coverImage ||
                    `https://www.loliapi.com/acg/?id=${post.id}`
                  "
                  :alt="post.title"
                  class="w-full h-full object-cover transition-transform duration-700"
                />
                <div
                  class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"
                ></div>
                <div
                  v-if="post.isPinned"
                  class="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur text-[#0284C7] dark:text-[#38bdf8] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-[#0284C7]/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                  >
                    <path
                      d="M19.07 4.93L17.07 2.93C16.68 2.54 16.05 2.54 15.66 2.93L13.13 5.46L11 3.33L9.6 4.73L11.73 6.86L4.54 14.05L3 21L9.95 19.46L17.14 12.27L19.27 14.4L20.67 13L18.54 10.87L21.07 8.34C21.46 7.95 21.46 7.32 21.07 6.93L19.07 4.93ZM15.66 10.87L13.13 8.34L15.66 5.81L18.19 8.34L15.66 10.87Z"
                    />
                  </svg>
                  PINNED
                </div>
              </div>
            </div>

            <!-- 右侧信息 -->
            <div class="p-6 md:p-8 flex flex-col flex-grow justify-between">
              <div class="flex flex-col">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag"
                    class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0284C7]/5 text-[#0284C7] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8] border border-[#0284C7]/10 dark:border-[#38bdf8]/20 hover:bg-[#0284C7] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-colors duration-300"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <h3
                  class="text-xl md:text-2xl font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-3 group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors duration-300 line-clamp-1"
                >
                  {{ post.title }}
                </h3>
                <p
                  class="text-sm md:text-base text-[#6B7280] dark:text-[#9ca3af] mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed"
                >
                  {{ post.description }}
                </p>
              </div>

              <div
                class="flex items-center justify-between text-xs md:text-sm text-[#9CA3AF] pt-4 border-t border-gray-100 dark:border-gray-800"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xs opacity-75 font-mono">{{
                    formatDate(post.pubDate)
                  }}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="flex items-center gap-1.5 font-mono text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      ></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {{ post.views || 0 }}
                  </span>
                  <span
                    class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 font-mono text-xs"
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    {{ post.wordCount }} 字
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Sidebar -->
      <aside
        class="w-full lg:w-80 shrink-0 flex flex-col gap-8 order-3 lg:order-none relative"
      >
        <div class="sticky top-24 space-y-8">
          <ProfileCard
            :post-count="totalPosts"
            :tag-count="allTags.length"
            :category-count="3"
          />
          <NoticeCard />
          <HotList />
          <TagsCloud :tags="allTags" />
        </div>
      </aside>

        <!-- Mobile Pagination Controls -->
        <div
          v-if="totalPages > 1"
          class="flex lg:hidden w-full justify-center items-center gap-4 mt-8 order-2"
        >
          <!-- Previous Button -->
          <button
            @click="changePage(page - 1)"
            :disabled="page === 1"
            class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-[#0284C7] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            上一页
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-2">
            <button
              v-for="p in totalPages"
              :key="p"
              @click="changePage(p)"
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                page === p
                  ? 'bg-[#0284C7] text-white dark:bg-[#38bdf8] dark:text-black font-bold'
                  : 'bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              {{ p }}
            </button>
          </div>

          <!-- Next Button -->
          <button
            @click="changePage(page + 1)"
            :disabled="page === totalPages"
            class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-[#0284C7] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            下一页
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Desktop Pagination Controls -->
      <div
        v-if="totalPages > 1"
        class="hidden lg:flex justify-center items-center gap-4 mt-8 lg:mr-[368px]"
      >
        <!-- Previous Button -->
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-[#0284C7] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          上一页
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-2">
          <button
            v-for="p in totalPages"
            :key="p"
            @click="changePage(p)"
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              page === p
                ? 'bg-[#0284C7] text-white dark:bg-[#38bdf8] dark:text-black font-bold'
                : 'bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
          >
            {{ p }}
          </button>
        </div>

        <!-- Next Button -->
        <button
          @click="changePage(page + 1)"
          :disabled="page === totalPages"
          class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A2E33] text-gray-600 dark:text-gray-300 hover:bg-[#0284C7] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          下一页
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import headImage from "~/assets/image/HEADIMAGE.jpg";
import ProfileCard from "~/components/Sidebar/ProfileCard.vue";
import TagsCloud from "~/components/Sidebar/TagsCloud.vue";
import HotList from "~/components/Sidebar/HotList.vue";

definePageMeta({
  keepalive: true,
});

interface Post {
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
  isPinned?: boolean;
}

// 获取文章数据
const route = useRoute();
const router = useRouter();

// 初始化分页状态
const page = ref(parseInt(route.query.page as string) || 1);
const limit = 7;
const isLoading = ref(false);
const totalPosts = ref(0);
const totalPages = computed(() => Math.ceil(totalPosts.value / limit));

// 首次加载
const { data: initialData, refresh } = await useFetch("/api/posts/latest", {
  query: { page: page, limit },
  watch: [page],
});

const latestPosts = computed(() => initialData.value?.posts || []);
totalPosts.value = initialData.value?.total || 0;

// 切换页面
const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value || isLoading.value) return;
  page.value = newPage;

  // 更新 URL 参数
  router.push({ query: { ...route.query, page: newPage } });

  // 滚动到文章列表顶部
  const postsSection = document.getElementById("latest-posts");
  if (postsSection) {
    postsSection.scrollIntoView({ behavior: "smooth" });
  }
};

onMounted(() => {
  if (initialData.value?.total) {
    totalPosts.value = initialData.value.total;
  }
});

// 获取所有标签
const { data: tagsData } = await useFetch("/api/tags");
const allTags = computed(() => tagsData.value || []);

// 日期格式化
const formatDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 社交链接
const socialLinks = [
  {
    name: "QQ",
    url: "2026256242",
    icon: "M20.555 14.975c.183.678-.17 1.487-.757 1.765-.46.218-.938.165-1.373-.027-.853 2.502-3.177 4.28-5.91 4.28-2.735 0-5.06-1.78-5.912-4.282-.435.193-.913.246-1.372.028-.587-.278-.94-.887-.757-1.765.11-.53.465-.958.943-1.157a3.992 3.992 0 0 1-.295-1.51c0-2.42 1.737-4.43 4.02-4.886C9.648 4.67 10.74 2.56 12.003 2.56c1.262 0 2.353 2.11 2.857 4.863 2.283.456 4.02 2.466 4.02 4.886 0 .53-.105 1.036-.296 1.51.48.2.834.628.944 1.157h.027z",
    stroke: false,
  },
  {
    name: "X",
    url: "https://x.com/NaNo1c_39",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    stroke: false,
  },
  {
    name: "Email",
    url: "mailto:nanoic39@gmail.com",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    stroke: true,
  },
  {
    name: "Telegram",
    url: "http://t.me/nanoic39",
    icon: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
    stroke: false,
  },
  {
    name: "BiliBili",
    url: "https://space.bilibili.com/376328688",
    icon: "M18.8 8.4h-1.6c.6.2 1.1.5 1.5.9.6.7 1 1.5 1.2 2.5.2 1 .3 2.1.3 3.4s-.1 2.4-.3 3.4c-.2.9-.6 1.8-1.2 2.5-.6.7-1.3 1.2-2.1 1.5-.9.4-1.9.6-3.2.6H8.7c-1.3-.1-2.3-.3-3.2-.6-.9-.4-1.6-.8-2.1-1.5-.6-.7-1-1.5-1.2-2.5-.2-1-.3-2.1-.3-3.4s.1-2.4.3-3.4c.2-.9.6-1.8 1.2-2.5.6-.7 1.3-1.2 2.1-1.5.9-.4 1.9-.6 3.2-.6h.7L7.1 5.3c.1-.2.4-.4.7-.4.3 0 .5.1.7.4l2.1 3.4h2.8l2.1-3.4c.1-.2.4-.4.7-.4.3 0 .5.1.7.4l-2.1 3.1zM17.1 19.3c.8 0 1.2-.5 1.2-1.5v-2.7c0-1-.4-1.5-1.2-1.5-.8 0-1.2.5-1.2 1.5v2.7c0 1.1.4 1.5 1.2 1.5zM10.6 19.3c.8 0 1.2-.5 1.2-1.5v-2.7c0-1-.4-1.5-1.2-1.5-.8 0-1.2.5-1.2 1.5v2.7c0 1.1.4 1.5 1.2 1.5z",
    stroke: false,
  },
  {
    name: "RSS",
    url: "/rss.xml",
    icon: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0",
    stroke: true,
  },
];

// 技术栈
const techStack = ["Java", "Vue 3", "Nuxt 3", "Tailwind CSS", "Node.js"];

const scrollToContent = () => {
  const content = document.getElementById("content");
  if (content) {
    content.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  }
};

// 打字机动画
const typeText = async () => {
  const phrases = [
    [
      { text: "Java ", type: "en" },
      { text: "开", pinyin: "kai", type: "zh" },
      { text: "发", pinyin: "fa", type: "zh" },
      { text: "者", pinyin: "zhe", type: "zh" },
      { text: ".", type: "en" },
    ],
    [
      { text: "不", pinyin: "bu", type: "zh" },
      { text: "专", pinyin: "zhuan", type: "zh" },
      { text: "业", pinyin: "ye", type: "zh" },
      { text: "的", pinyin: "de", type: "zh" },
      { text: " UI/UX ", type: "en" },
      { text: "设", pinyin: "she", type: "zh" },
      { text: "计", pinyin: "ji", type: "zh" },
      { text: "师", pinyin: "shi", type: "zh" },
      { text: ".", type: "en" },
    ],
    [
      { text: "独", pinyin: "du", type: "zh" },
      { text: "立", pinyin: "li", type: "zh" },
      { text: " Dreamer", type: "en" },
      { text: ".", type: "en" },
    ],
    [
      { text: "Y", type: "en" },
      { text: "u", type: "en" },
      { text: "n", type: "en" },
      { text: "a ", type: "en" },
      { text: "很", pinyin: "hen", type: "zh" },
      { text: "可", pinyin: "ke", type: "zh" },
      { text: "爱", pinyin: "ai", type: "zh" },
      { text: ".", type: "en" },
    ],
  ];

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;
  const convertDelay = 300;

  const element = document.querySelector(".typing-effect");
  if (!element) return;

  let phraseIndex = 0;
  let segmentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let displayedText = "";

  const type = () => {
    const currentPhrase = phrases[phraseIndex];
    if (!currentPhrase) return;

    if (isDeleting) {
      const currentContent = element.textContent || "";
      if (currentContent.length > 0) {
        element.textContent = currentContent.slice(0, -1);
        setTimeout(type, deletingSpeed);
      } else {
        isDeleting = false;
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * phrases.length);
        } while (nextIndex === phraseIndex && phrases.length > 1);
        phraseIndex = nextIndex;
        segmentIndex = 0;
        charIndex = 0;
        displayedText = "";
        setTimeout(type, 500);
      }
      return;
    }

    if (segmentIndex >= currentPhrase.length) {
      isDeleting = true;
      setTimeout(type, pauseTime);
      return;
    }

    const segment = currentPhrase[segmentIndex];
    if (!segment) return;

    if (segment.type === "en") {
      if (charIndex < segment.text.length) {
        displayedText += segment.text[charIndex];
        element.textContent = displayedText;
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        segmentIndex++;
        charIndex = 0;
        type();
      }
    } else if (segment.type === "zh") {
      const pinyin = segment.pinyin || "";
      if (charIndex < pinyin.length) {
        // 显示：已确认文本 + 当前拼音部分
        element.textContent = displayedText + pinyin.slice(0, charIndex + 1);
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => {
          displayedText += segment.text;
          element.textContent = displayedText;
          segmentIndex++;
          charIndex = 0;
          setTimeout(type, typingSpeed);
        }, convertDelay);
      }
    }
  };

  type();
};

onMounted(() => {
  typeText();
});
</script>

<style scoped>
.font-ink {
  font-family: "汉仪墨韵行书", cursive, serif;
}
</style>
