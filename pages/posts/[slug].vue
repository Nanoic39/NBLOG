<template>
  <div class="relative min-h-screen transition-colors duration-300">
    <!-- 浅色模糊背景点缀 -->
    <div
      class="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F8FAFC] dark:bg-[#121212] transition-colors duration-300"
    >
      <!-- 白色为主色的点缀 -->
      <div
        class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-white dark:bg-white/5 rounded-full blur-[150px] opacity-90 transition-colors duration-300"
      ></div>
      <div
        class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-50/80 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-80 transition-colors duration-300"
      ></div>
      <div
        class="absolute top-[30%] left-[50%] w-[50%] h-[50%] bg-indigo-50/60 dark:bg-indigo-900/10 rounded-full blur-[120px] opacity-70 transition-colors duration-300"
      ></div>
      <!-- 整体玻璃遮罩层，让背景更柔和 -->
      <div
        class="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] transition-colors duration-300"
      ></div>
    </div>

    <!-- 主体内容区 max-w-[1600px] 以容纳 1200px 文章及两侧功能 -->
    <div
      class="max-w-[1600px] w-full mx-auto px-4 py-8 mt-16 md:mt-24 relative z-10 flex flex-col lg:flex-row justify-center items-start gap-6 xl:gap-8 transition-colors duration-300"
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
      <main
        class="flex-1 min-w-0 w-full max-w-[1200px] transition-colors duration-300"
      >
        <div v-if="error" class="text-center py-20">
          <h2 class="text-2xl font-bold text-red-500 mb-4">文章加载失败</h2>
          <p class="text-[#6B7280] dark:text-[#9ca3af]">
            {{ error?.message || "未知错误" }}
          </p>
          <NuxtLink
            to="/"
            class="mt-6 inline-block text-[#0284C7] hover:underline"
            >返回首页</NuxtLink
          >
        </div>

        <article
          v-else-if="article || cachedPost"
          class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-2xl p-6 md:p-10 lg:p-12 shadow-lg border border-transparent dark:border-[#333333] transition-colors duration-300"
        >
          <!-- 封面图 -->
          <div
            class="w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden relative"
            :style="
              getTransitionStyle('article-cover', article?.id || cachedPost?.id)
            "
          >
            <img
              :src="displayCoverImage"
              :alt="article?.title || cachedPost?.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- 文章头部信息 -->
          <header
            class="mb-10 border-b border-gray-200/60 dark:border-gray-700/60 pb-8"
          >
            <h1
              class="text-3xl md:text-4xl font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-8 leading-tight"
              :style="
                getTransitionStyle(
                  'article-title',
                  article?.id || cachedPost?.id,
                )
              "
            >
              {{ article?.title || cachedPost?.title }}
            </h1>

            <div v-if="pending && !article" class="flex justify-center py-10">
              <span class="animate-pulse text-[#6B7280] dark:text-[#9ca3af]"
                >加载内容中...</span
              >
            </div>

            <!-- 重新美化的文章元数据说明 (卡片式网格布局) -->
            <div
              v-else-if="article"
              class="grid grid-cols-2 md:flex md:flex-wrap md:justify-between gap-3 mb-6"
            >
              <div
                class="flex-1 min-w-[120px] bg-gray-50/80 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100/80 dark:border-gray-700/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/60"
              >
                <span
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
                  class="text-xs text-gray-400 dark:text-blue-300 mb-1.5 flex items-center gap-1"
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
              v-if="(article?.tags?.length || 0) > 0"
              class="mt-4 flex flex-wrap gap-2"
            >
              <button
                v-for="tag in article?.tags || []"
                :key="tag"
                type="button"
                @click="goToTag(tag)"
                class="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-[#0284C7] dark:text-[#38bdf8] rounded-full border border-blue-100 dark:border-blue-800/50"
              >
                #{{ tag }}
              </button>
            </div>
          </header>

          <!-- 文章内容 -->
          <div
            ref="proseEl"
            class="prose custom-prose dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-[#0284C7] hover:prose-a:text-[#0369a1]"
            v-html="renderedContent"
            @click="handleProseClick"
          ></div>

          <footer v-if="article" class="mt-14 pt-10">
            <div class="nb-end-marker" aria-hidden="true">
              <span class="nb-end-line nb-end-line--l"></span>
              <span class="nb-end-badge">到底了</span>
              <span class="nb-end-line nb-end-line--r"></span>
            </div>

            <div
              class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 dark:bg-[#1b1b1b]/55 backdrop-blur-md rounded-2xl border border-gray-100/70 dark:border-gray-700/40 p-5"
            >
              <div
                class="relative overflow-hidden rounded-xl border border-gray-100/70 dark:border-gray-700/40 bg-white/65 dark:bg-[#242424]/60 p-4"
              >
                <svg
                  class="nb-cc-watermark"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm0 18.2A8.2 8.2 0 1 1 12 3.8a8.2 8.2 0 0 1 0 16.4Zm-2.6-6.1a2.1 2.1 0 1 1 0-4.2c.5 0 1 .2 1.4.5l.9-1.1a3.5 3.5 0 1 0 0 5.4l-.9-1.1c-.4.3-.9.5-1.4.5Zm5.2 0a2.1 2.1 0 1 1 0-4.2c.5 0 1 .2 1.4.5l.9-1.1a3.5 3.5 0 1 0 0 5.4l-.9-1.1c-.4.3-.9.5-1.4.5Z"
                  ></path>
                </svg>
                <div class="text-xs text-gray-400 dark:text-gray-400 mb-2">
                  文章类型
                </div>
                <div
                  class="text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  {{ articleTypeLabel }}
                </div>
              </div>

              <div
                class="rounded-xl border border-gray-100/70 dark:border-gray-700/40 bg-white/65 dark:bg-[#242424]/60 p-4"
              >
                <div class="text-xs text-gray-400 dark:text-gray-400 mb-2">
                  文章来源
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-200">
                  <span v-if="!sourceLink">本站</span>
                  <a
                    v-else
                    :href="sourceLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#0284C7] dark:text-[#38bdf8] hover:underline break-all"
                    >{{ sourceLink }}</a
                  >
                </div>
              </div>

              <div
                v-if="showCcLicense"
                class="rounded-xl border border-gray-100/70 dark:border-gray-700/40 bg-white/65 dark:bg-[#242424]/60 p-4 md:col-span-2"
              >
                <div class="text-xs text-gray-400 dark:text-gray-400 mb-2">
                  CC 许可
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                  <a
                    v-if="ccLicenseUrl"
                    :href="ccLicenseUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold text-[#0284C7] dark:text-[#38bdf8] hover:underline"
                    >{{ ccLicenseName }}</a
                  >
                  <div
                    v-else
                    class="text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    {{ ccLicenseName }}
                  </div>
                  <div class="flex items-center gap-2">
                    <img
                      v-for="icon in ccLicenseIcons"
                      :key="icon"
                      :src="icon"
                      alt=""
                      class="w-5 h-5 opacity-90 dark:opacity-80"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="showRecommendations"
              class="mt-8 rounded-2xl border border-gray-100/70 dark:border-gray-700/40 bg-white/50 dark:bg-[#1b1b1b]/55 backdrop-blur-md p-5"
            >
              <div class="flex items-center justify-between mb-4">
                <div
                  class="text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  更多文章推荐
                </div>
                <NuxtLink
                  to="/"
                  class="text-xs text-gray-500 dark:text-gray-400 hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors"
                  >查看更多</NuxtLink
                >
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <NuxtLink
                  v-for="p in recommendedPosts"
                  :key="p.slug"
                  :to="`/posts/${p.slug}`"
                  class="group rounded-xl border border-gray-100/70 dark:border-gray-700/40 bg-white/65 dark:bg-[#242424]/60 p-4 hover:shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:hover:shadow-[0_14px_40px_rgba(0,0,0,0.45)] transition-all"
                >
                  <div
                    class="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#0284C7] dark:group-hover:text-[#38bdf8] transition-colors"
                  >
                    {{ p.title }}
                  </div>
                  <div
                    v-if="p.description"
                    class="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
                  >
                    {{ p.description }}
                  </div>
                  <div
                    class="mt-3 text-[11px] text-gray-400 dark:text-gray-500"
                  >
                    {{ formatDate(p.pubDate) }}
                  </div>
                </NuxtLink>
              </div>
            </div>
          </footer>
        </article>

        <!-- 评论区 (位于文章卡片外部) -->
        <CommentSection v-if="article?.id !== undefined" :articleId="article.id" />
      </main>

      <!-- 右侧：摘要/目录 (跟随页面滚动，宽屏可见) -->
      <aside
        class="hidden lg:flex w-56 xl:w-64 shrink-0 relative lg:sticky lg:top-24 lg:self-start flex-col gap-6"
      >
        <!-- 摘要面板 -->
        <div
          v-if="article?.description"
          class="z-20 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent dark:border-[#333333] transition-colors duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <h3
            class="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 transition-colors duration-300"
          >
            <svg
              class="w-4 h-4 text-[#0284C7] transition-colors duration-300"
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
          <p
            class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300"
          >
            {{ article.description }}
          </p>
        </div>

        <!-- 目录面板 -->
        <div
          class="z-20 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent dark:border-[#333333] flex flex-col max-h-[calc(100vh-20rem)] transition-colors duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <h3
            class="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 transition-colors duration-300"
          >
            <svg
              class="w-4 h-4 text-[#0284C7] transition-colors duration-300"
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
                            : 'text-gray-500 dark:text-blue-300 hover:text-[#0284C7] dark:hover:text-[#38bdf8] hover:bg-gray-50 dark:hover:bg-gray-800/30'
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
import {
  ref,
  computed,
  watch,
  nextTick,
  h,
  render,
  onBeforeUnmount,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
// ... (保留其它 import)

// 为卡片添加统一的动态 View Transition 名称
const transitionReady = ref(false);
const getTransitionStyle = (
  prefix: string,
  id: string | number | undefined,
) => {
  if (!transitionReady.value || !id) return {};
  return { viewTransitionName: `${prefix}-${id}` };
};
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // 引入主题样式
import "katex/dist/katex.min.css";
import AudioEmbed from "~/components/AudioEmbed.vue";
import VideoEmbed from "~/components/VideoEmbed.vue";

const proseEl = ref<HTMLElement | null>(null);
const mountedAudioRoots = new Set<HTMLElement>();
const mountedVideoRoots = new Set<HTMLElement>();

const escapeHtmlAttr = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const getAudioMetaFromSrc = (src: string) => {
  let host = "";
  let title = "音频";

  try {
    const url = new URL(src);
    host = url.host || "";
    const rawName = decodeURIComponent(
      url.pathname.split("/").filter(Boolean).pop() || "",
    );
    if (rawName) {
      title = rawName.replace(/\.[a-z0-9]+$/i, "") || title;
    }
  } catch {
    const rawName = decodeURIComponent(src.split("/").pop() || "");
    if (rawName) {
      title = rawName.replace(/\.[a-z0-9]+$/i, "") || title;
    }
  }

  return { title, host: host || "未知来源" };
};

const replaceAudioTagsWithPlaceholders = (html: string) => {
  return html.replace(/<audio\b[\s\S]*?<\/audio>/gi, (audioHtml) => {
    const sourceMatch =
      audioHtml.match(/<source\b[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i) ||
      audioHtml.match(/<audio\b[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i);

    if (!sourceMatch?.[1]) return audioHtml;

    const src = sourceMatch[1];
    const { title, host } = getAudioMetaFromSrc(src);

    return `<div class="nb-audio-placeholder my-6" data-audio-src="${escapeHtmlAttr(src)}" data-audio-title="${escapeHtmlAttr(title)}" data-audio-host="${escapeHtmlAttr(host)}"></div>`;
  });
};

const replaceExternalLinksAsCards = (html: string) => {
  const getAttr = (s: string, name: string) => {
    const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
    const m = s.match(re);
    return m ? m[1] : "";
  };
  const normalizeHref = (raw: string) => {
    let s = (raw || "").trim();
    // 去掉反引号与多余引号
    s = s.replace(/^[`'"]+|[`'"]+$/g, "");
    return s;
  };
  let replaced = html.replace(
    /<a([^>]*?)href\s*=\s*["'](https?:\/\/[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi,
    (m, preAttrs, href, postAttrs, inner) => {
      if (/<(?!\/?em|\/?strong|\/?span)[^>]+>/.test(inner)) return m;
      let url: URL | null = null;
      try {
        url = new URL(normalizeHref(href));
      } catch {
        return m;
      }
      const host = url.host;
      const path = url.pathname + url.search;
      const titleAttr = getAttr(preAttrs + " " + postAttrs, "title");
      const textContent = inner.replace(/<[^>]*>/g, "").trim();
      const title = escapeHtmlAttr(textContent || titleAttr || host);
      const desc = escapeHtmlAttr(titleAttr || path || href);
      const safeHref = escapeHtmlAttr(url.toString());
      const iconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
      // 注意：thum.io 的 og 接口不接受编码后的斜杠
      const coverUrl = `https://image.thum.io/get/og/${url.toString()}`;
      return `<a class="nb-external-card" href="${safeHref}" target="_blank" rel="noopener noreferrer" data-host="${escapeHtmlAttr(host)}">
        <span class="nb-ext-cover"><span class="nb-ext-cover-inner" style="background-image:url('${coverUrl}')"></span></span>
        <span class="nb-ext-body">
          <span class="nb-ext-title">${title}</span>
          <span class="nb-ext-desc">${desc}</span>
          <span class="nb-ext-link">
            <span class="nb-ext-fav" style="background-image:url('${iconUrl}')"></span>
            <span class="nb-ext-host">${host}</span>
            <span class="nb-ext-path">${escapeHtmlAttr(path)}</span>
            <span class="nb-ext-arrow" aria-hidden="true">↗</span>
          </span>
        </span>
      </a>`;
    },
  );
  // 删除意外生成的空卡片（无任何子内容）
  replaced = replaced.replace(
    /<a[^>]*class=["'][^"']*nb-external-card[^"']*["'][^>]*>\s*<\/a>/gi,
    "",
  );
  // 去掉仅包裹卡片的 li
  replaced = replaced.replace(
    /<li[^>]*>\s*(<a class="nb-external-card[\s\S]*?<\/a>)\s*<\/li>/gi,
    (_m, anchor) => anchor,
  );
  // 去掉仅包含卡片的 ul/ol 外壳
  replaced = replaced.replace(
    /<(ul|ol)[^>]*>\s*((?:\s*<a class="nb-external-card[\s\S]*?<\/a>\s*)+)\s*<\/\1>/gi,
    (_m, anchors) => anchors,
  );
  // 去重：同一 href 出现多次，仅保留第一次
  const seen = new Set<string>();
  replaced = replaced.replace(
    /<a[^>]*class=["'][^"']*nb-external-card[^"']*["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi,
    (m, href) => {
      let key = normalizeHref(href).replace(/\/$/, "");
      try {
        const u = new URL(normalizeHref(href));
        const normPath = u.pathname.replace(/\/$/, "") || "/";
        key = `${u.protocol}//${u.host}${normPath}${u.search}`;
      } catch {}
      if (seen.has(key)) return "";
      seen.add(key);
      return m;
    },
  );
  return replaced;
};

const replaceInternalLinksAsCards = (html: string) => {
  const hasClass = (attr: string, name: string) => {
    const m = attr.match(/class\s*=\s*["']([^"']+)["']/i);
    if (!m) return false;
    const cls = m[1] || "";
    return cls.split(/\s+/).some((c) => c === name);
  };
  const normalize = (s: string) => (s || "").trim();
  let replaced = html.replace(
    /<a([^>]*?)href\s*=\s*["'](\/[^"']+|\.{1,2}\/[^"']*)["']([^>]*)>([\s\S]*?)<\/a>/gi,
    (m, preAttrs, href, postAttrs, inner) => {
      const attrs = (preAttrs || "") + " " + (postAttrs || "");
      if (
        hasClass(attrs, "nb-external-card") ||
        hasClass(attrs, "nb-internal-card")
      )
        return m;
      if (/<(?!\/?em|\/?strong|\/?span)[^>]+>/.test(inner)) return m;
      const textContent = inner.replace(/<[^>]*>/g, "").trim();
      const path = normalize(href);
      const title = escapeHtmlAttr(textContent || path);
      const desc = escapeHtmlAttr(`站内链接 · ${path}`);
      const safeHref = escapeHtmlAttr(path);
      return `<a class="nb-internal-card" href="${safeHref}" data-int-href="${safeHref}">
        <span class="nb-int-cover"><span class="nb-int-cover-inner"><span class="nb-int-glyph">内</span></span></span>
        <span class="nb-int-body">
          <span class="nb-int-title">${title}</span>
          <span class="nb-int-desc">${desc}</span>
          <span class="nb-int-link">
            <span class="nb-int-path">${escapeHtmlAttr(path)}</span>
            <span class="nb-int-arrow" aria-hidden="true">→</span>
          </span>
        </span>
      </a>`;
    },
  );
  // 去掉仅包裹卡片的 li
  replaced = replaced.replace(
    /<li[^>]*>\s*(<a class="nb-internal-card[\s\S]*?<\/a>)\s*<\/li>/gi,
    (_m, anchor) => anchor,
  );
  // 去掉仅包含卡片的 ul/ol 外壳
  replaced = replaced.replace(
    /<(ul|ol)[^>]*>\s*((?:\s*<a class="nb-internal-card[\s\S]*?<\/a>\s*)+)\s*<\/\1>/gi,
    (_m, anchors) => anchors,
  );
  return replaced;
};

const parseFootnotesFromMarkdown = (md: string) => {
  const lines = md.split(/\r?\n/);
  const footnotes: { id: string; text: string }[] = [];
  const defRe = /^\[\^([A-Za-z0-9_-]+)\]:\s*(.+)$/;
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.match(defRe);
    if (m) {
      const idVal = m[1] || "";
      const textVal = m[2] || "";
      footnotes.push({ id: idVal, text: textVal });
    } else {
      kept.push(line);
    }
  }
  let replaced = kept.join("\n");
  if (footnotes.length > 0) {
    replaced = replaced.replace(
      /\[\^([A-Za-z0-9_-]+)\]/g,
      (_m, id) =>
        `<sup class="nb-footnote-ref" id="ref-${id}"><a href="#fn-${id}">[${id}]</a></sup>`,
    );
  }
  return { md: replaced, footnotes };
};

const stripLeadingTitleHeading = (md: string, title?: string) => {
  if (!title) return md;

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(
        /[\s"'“”‘’《》<>「」『』（）\(\)【】\[\]{}，,。.:：!！?？、·`~\-—–]/g,
        "",
      );

  const normalizedTitle = normalize(title);
  if (!normalizedTitle) return md;

  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && (lines[i]?.trim() ?? "") === "") i += 1;
  if (i >= lines.length) return md;

  const line = lines[i] ?? "";
  const m = line.match(/^#\s+(.+?)\s*$/);
  if (!m?.[1]) return md;

  const normalizedHeading = normalize(m[1]);
  if (!normalizedHeading || normalizedHeading !== normalizedTitle) return md;

  lines.splice(i, 1);
  while (i < lines.length && (lines[i]?.trim() ?? "") === "")
    lines.splice(i, 1);
  return lines.join("\n");
};

const replaceVideoTagsWithPlaceholders = (html: string) => {
  return html.replace(/<video\b[\s\S]*?<\/video>/gi, (videoHtml) => {
    const sourceMatch =
      videoHtml.match(/<source\b[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i) ||
      videoHtml.match(/<video\b[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i);

    if (!sourceMatch?.[1]) return videoHtml;

    const src = sourceMatch[1];
    const { title, host } = getAudioMetaFromSrc(src);

    return `<div class="nb-video-placeholder my-6" data-video-src="${escapeHtmlAttr(src)}" data-video-title="${escapeHtmlAttr(title)}" data-video-host="${escapeHtmlAttr(host)}"></div>`;
  });
};

const unmountAllAudioEmbeds = () => {
  for (const el of mountedAudioRoots) {
    render(null, el);
    el.innerHTML = "";
  }
  mountedAudioRoots.clear();
};

const unmountAllVideoEmbeds = () => {
  for (const el of mountedVideoRoots) {
    render(null, el);
    el.innerHTML = "";
  }
  mountedVideoRoots.clear();
};

const mountAudioEmbeds = () => {
  if (!proseEl.value) return;

  unmountAllAudioEmbeds();

  const placeholders = proseEl.value.querySelectorAll<HTMLElement>(
    ".nb-audio-placeholder",
  );

  placeholders.forEach((el) => {
    const src = el.dataset.audioSrc;
    if (!src) return;
    const title = el.dataset.audioTitle || "音频";
    const host = el.dataset.audioHost || "";
    render(h(AudioEmbed, { src, title, host }), el);
    mountedAudioRoots.add(el);
  });
};

const mountVideoEmbeds = () => {
  if (!proseEl.value) return;

  unmountAllVideoEmbeds();

  const placeholders = proseEl.value.querySelectorAll<HTMLElement>(
    ".nb-video-placeholder",
  );

  placeholders.forEach((el) => {
    const src = el.dataset.videoSrc;
    if (!src) return;
    const title = el.dataset.videoTitle || "视频";
    const host = el.dataset.videoHost || "";
    render(h(VideoEmbed, { src, title, host }), el);
    mountedVideoRoots.add(el);
  });
};

const enhanceInternalLinkCovers = () => {
  if (!proseEl.value || !import.meta.client) return;
  const cards =
    proseEl.value.querySelectorAll<HTMLAnchorElement>("a.nb-internal-card");
  cards.forEach((a) => {
    const href = a.getAttribute("href") || a.dataset.intHref || "";
    if (!href) return;
    const coverInner = a.querySelector<HTMLElement>(".nb-int-cover-inner");
    if (!coverInner) return;
    if ((coverInner as any).__coverSet) return;
    try {
      const absolute = new URL(href, window.location.origin).toString();
      const coverUrl = `https://image.thum.io/get/og/${absolute}`;
      coverInner.style.backgroundImage = `url('${coverUrl}')`;
      (coverInner as any).__coverSet = true;
    } catch {
      // ignore
    }
  });
};

const renderMathInProse = async () => {
  if (!proseEl.value || !import.meta.client) return;
  const mod = await import("katex/contrib/auto-render");
  const renderMathInElement = (mod as any).default as (
    element: HTMLElement,
    options?: Record<string, any>,
  ) => void;
  renderMathInElement(proseEl.value, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
    strict: false,
    trust: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  });
};

// 配置 marked 的渲染器
marked.use({
  renderer: {
    // 自定义代码块渲染
    code({ text, lang }) {
      const validLang = lang || "plaintext";
      const language = hljs.getLanguage(validLang) ? validLang : "plaintext";
      const source = text.replace(/\r\n/g, "\n");
      const highlighted = hljs.highlight(source, { language }).value;
      const highlightedLines = highlighted.split("\n");
      if (highlightedLines[highlightedLines.length - 1] === "") {
        highlightedLines.pop();
      }
      if (highlightedLines.length === 0) {
        highlightedLines.push("");
      }

      const lineNumbersHtml = highlightedLines
        .map(
          (_, index) =>
            `<div class="line-number text-right px-3 text-gray-400 dark:text-gray-500 text-sm select-none font-mono">${index + 1}</div>`,
        )
        .join("");

      const codeLinesHtml = highlightedLines
        .map((line) => `<span class="code-line">${line || "&nbsp;"}</span>`)
        .join("");

      const safeCode = encodeURIComponent(source);

      return `
        <div class="code-block-wrapper relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
          <div class="code-block-header flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-gray-800">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">${language}</span>
            <button class="copy-btn flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" data-code="${safeCode}" title="复制代码">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span class="copy-text">复制</span>
            </button>
          </div>
          <div class="code-block-content flex bg-gray-50 dark:bg-[#1e1e1e] overflow-x-auto">
            <div class="line-numbers shrink-0 py-4 border-r border-gray-200 dark:border-gray-700/50 bg-gray-100/50 dark:bg-[#1e1e1e] flex flex-col">
              ${lineNumbersHtml}
            </div>
            <pre class="!bg-transparent !m-0 !p-4 !rounded-none w-full !border-0 !overflow-x-auto"><code class="hljs language-${language} code-lines font-mono text-sm" style="background: transparent; padding: 0;">${codeLinesHtml}</code></pre>
          </div>
        </div>
      `;
    },
    // 自定义图片渲染
    image({ href, title, text }) {
      const altText = text ? `alt="${text}"` : "";
      const titleAttr = title ? `title="${title}"` : "";
      // 使用 data-zoomable 标记图片支持放大，配合全局事件委托
      return `
        <figure class="image-wrapper my-8 mx-auto flex flex-col items-center justify-center">
          <img src="${href}" ${altText} ${titleAttr} class="cursor-zoom-in rounded-xl shadow-md border border-gray-100 dark:border-gray-800 max-w-full h-auto transition-transform duration-300 hover:scale-[1.02]" data-zoomable="true" loading="lazy" />
          ${text ? `<figcaption class="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">${text}</figcaption>` : ""}
        </figure>
      `;
    },
    hr() {
      const coffeeSvg = `
        <svg class="nb-divider-coffee" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5z" fill="#f59e0b"></path>
          <path d="M16 11h2a2 2 0 1 1 0 4h-2" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M8 3c1.2 1.1 1.2 2.3 0 3.4M12 3c1.2 1.1 1.2 2.3 0 3.4M16 3c1.2 1.1 1.2 2.3 0 3.4" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M6 20h10" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      `;
      return `
        <div class="nb-divider my-10" aria-hidden="true">
          <span class="nb-divider-line nb-divider-line--l"></span>
          <span class="nb-divider-badge">${coffeeSvg}</span>
          <span class="nb-divider-line nb-divider-line--r"></span>
        </div>
      `;
    },
  },
});

const route = useRoute();
const router = useRouter();
const articleSlug = route.params.slug as string;
const unwrapApiData = <T,>(
  response: T | { data?: T } | null | undefined,
): T | null => {
  if (!response) return null;
  if (
    typeof response === "object" &&
    "data" in (response as Record<string, unknown>)
  ) {
    return ((response as { data?: T }).data ?? null) as T | null;
  }
  return response as T;
};

// 从缓存中获取文章基础信息（用于加载时的占位和动画过渡）
const postCache = useState<Record<string, any>>("postCache", () => ({}));
const cachedPost = computed(() => postCache.value[articleSlug]);

const localCachedCover = ref<string | null>(null);
onMounted(() => {
  transitionReady.value = true;
  if (import.meta.client) {
    localCachedCover.value = localStorage.getItem(`post_cover_${articleSlug}`);
  }
});

const displayCoverImage = computed(() => {
  return (
    localCachedCover.value ||
    cachedPost.value?.coverImage ||
    article.value?.coverImage ||
    (article.value ? `https://www.loliapi.com/acg/?id=${article.value.id}` : "")
  );
});

// Fetch article data
const {
  data: article,
  pending,
  error,
} = await useFetch(`/api/article/detail`, {
  credentials: "include",
  transform: (response) => unwrapApiData(response),
  query: { slug: articleSlug },
});

const { data: latestPostsData } = await useFetch(`/api/posts/latest`, {
  credentials: "include",
  transform: (response) => unwrapApiData(response),
  query: { page: 1, size: 12 },
});

// Format date helper
const formatDate = (timestamp?: string | number) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const goToTag = (tag: string) => {
  router.push({
    path: "/",
    query: {
      tag,
      page: 1,
    },
  });
};

const articleTypeLabel = computed(() => {
  const raw = String(
    (article.value as any)?.type ??
      (article.value as any)?.articleType ??
      (article.value as any)?.postType ??
      "original",
  ).toLowerCase();

  if (["original", "原创"].includes(raw)) return "原创";
  if (["co-original", "cooriginal", "原创合作"].includes(raw)) return "原创合作";
  if (["translation", "translate", "翻译"].includes(raw)) return "翻译";
  if (["repost", "转载", "reprint"].includes(raw)) return "转载";
  return "原创";
});

const sourceLink = computed(() => {
  const link =
    (article.value as any)?.sourceUrl ??
    (article.value as any)?.sourceLink ??
    (article.value as any)?.originalUrl ??
    (article.value as any)?.originalLink ??
    "";
  const type = articleTypeLabel.value;
  if (!link) return "";
  if (type === "原创") return "";
  return String(link);
});

const ccLicenseName = computed(() => {
  const cc = (article.value as any)?.license?.cc;
  return cc ? String(cc) : "";
});

const ccLicenseIcons = computed(() => {
  const icons = (article.value as any)?.license?.icon;
  if (!Array.isArray(icons)) return [];
  return icons.filter((x: any) => typeof x === "string" && x.length > 0);
});

const ccLicenseUrl = computed(() => {
  const raw = ccLicenseName.value;
  if (!raw) return "";

  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/^cc\s+/, "")
    .replace(/\s+/g, " ");

  const versionMatch = normalized.match(/(\d\.\d)/);
  const version = versionMatch?.[1] || "4.0";

  if (normalized.includes("cc0") || normalized.includes("zero")) {
    const v = normalized.match(/(\d\.\d|\d)/)?.[1] || "1.0";
    return `https://creativecommons.org/publicdomain/zero/${v}/`;
  }

  const hasBy = /\bby\b/.test(normalized);
  if (!hasBy) return "";

  const parts: string[] = ["by"];
  if (/\bnc\b/.test(normalized)) parts.push("nc");
  if (/\bnd\b/.test(normalized)) parts.push("nd");
  if (/\bsa\b/.test(normalized)) parts.push("sa");

  return `https://creativecommons.org/licenses/${parts.join("-")}/${version}/`;
});

const showCcLicense = computed(() => {
  if (articleTypeLabel.value !== "原创") return false;
  return Boolean(ccLicenseName.value) && ccLicenseIcons.value.length > 0;
});

type RecommendedPost = {
  id?: string | number;
  slug: string;
  title: string;
  description?: string;
  pubDate?: string | number;
};

const recommendedPosts = computed<RecommendedPost[]>(() => {
  const posts = (latestPostsData.value as any)?.posts;
  if (!Array.isArray(posts)) return [];
  return posts
    .filter((p: any) => p && p.slug && p.slug !== articleSlug)
    .slice(0, 3);
});

const showRecommendations = computed(() => {
  const total = Number((latestPostsData.value as any)?.total ?? 0);
  return total > 2 && recommendedPosts.value.length > 0;
});

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
  const headings = Array.from(
    document.querySelectorAll(".prose h2, .prose h3"),
  );
  if (headings.length === 0) return;

  const scrollPosition = window.scrollY + 150; // offset for sticky header
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  let currentId = "";

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

  // Footnote pre-parse
  const cleanedMd = stripLeadingTitleHeading(
    article.value.content as string,
    (article.value as any)?.title,
  );
  const { md, footnotes } = parseFootnotesFromMarkdown(cleanedMd);

  // Parse markdown
  const rawHtml = marked.parse(md) as string;

  const headings: { level: number; text: string; id: string }[] = [];
  let headingIndex = 0;

  let htmlWithIds = rawHtml.replace(
    /<h([2-3])>([\s\S]*?)<\/h\1>/g,
    (match, level, innerHtml) => {
      const pureText = innerHtml.replace(/<[^>]*>?/gm, "").trim();
      const id = `heading-${headingIndex++}`;
      headings.push({ level: Number(level), text: pureText, id });
      return `<h${level} id="${id}" class="scroll-mt-24">${innerHtml}</h${level}>`;
    },
  );

  // 为表格添加包裹容器，以支持横向滚动，并用一个外部容器包裹住整个表格区域
  htmlWithIds = htmlWithIds
    .replace(
      /<table>/g,
      '<div class="table-container"><div class="table-wrapper"><table>',
    )
    .replace(/<\/table>/g, "</table></div></div>");

  htmlWithIds = replaceAudioTagsWithPlaceholders(htmlWithIds);
  htmlWithIds = replaceVideoTagsWithPlaceholders(htmlWithIds);
  htmlWithIds = replaceExternalLinksAsCards(htmlWithIds);
  htmlWithIds = replaceInternalLinksAsCards(htmlWithIds);

  if (footnotes.length > 0) {
    const footHtml =
      `<section class="nb-footnotes mt-10"><h4 class="nb-footnotes-title">注脚</h4><ol>` +
      footnotes
        .map(
          (fn) =>
            `<li id="fn-${fn.id}"><span class="nb-fn-index">[${fn.id}]</span><span class="nb-fn-text">${escapeHtmlAttr(fn.text)}</span> <a class="nb-fn-back" href="#ref-${fn.id}" aria-label="返回引用">↩</a></li>`,
        )
        .join("") +
      `</ol></section>`;
    htmlWithIds += footHtml;
  }

  tocList.value = headings;

  // Clean HTML if we are on client side
  if (import.meta.client) {
    return DOMPurify.sanitize(htmlWithIds, {
      ADD_ATTR: [
        "id",
        "class",
        "style",
        "aria-hidden",
        "target",
        "rel",
        "data-code",
        "data-zoomable",
        "data-audio-src",
        "data-audio-title",
        "data-audio-host",
        "data-video-src",
        "data-video-title",
        "data-video-host",
        "data-int-href",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-width",
        "viewBox",
        "fill",
        "stroke",
        "d",
      ],
      ADD_TAGS: ["svg", "path"],
    });
  }

  return htmlWithIds;
});

onMounted(() => {
  if (!import.meta.client) return;
  nextTick(() => {
    mountAudioEmbeds();
    mountVideoEmbeds();
    enhanceInternalLinkCovers();
    renderMathInProse();
  });
});

watch(
  renderedContent,
  () => {
    if (!import.meta.client) return;
    nextTick(() => {
      mountAudioEmbeds();
      mountVideoEmbeds();
      enhanceInternalLinkCovers();
      renderMathInProse();
    });
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  unmountAllAudioEmbeds();
  unmountAllVideoEmbeds();
});

// 处理文章内容点击事件，例如代码复制和图片放大
const handleProseClick = async (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  const anchor = target.closest("a") as HTMLAnchorElement | null;
  if (anchor && proseEl.value?.contains(anchor)) {
    const href = anchor.getAttribute("href") || "";
    const isFootnote = /^#(fn-|ref-)/.test(href);
    if (isFootnote) {
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const currentY = window.scrollY || window.pageYOffset || 0;
        const bias = Math.max(0, Math.floor(window.innerHeight * 0.28));
        const targetY = Math.max(0, currentY + rect.top - bias);
        window.scrollTo({ top: targetY, behavior: "smooth" });
        history.replaceState(null, "", href);
      }
      return;
    }
  }

  // 处理图片放大
  if (target.tagName.toLowerCase() === "img") {
    const imgSrc = target.getAttribute("src");
    if (imgSrc) {
      // 创建全屏遮罩层
      const overlay = document.createElement("div");
      overlay.className =
        "fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out opacity-0 transition-opacity duration-300 backdrop-blur-sm";

      // 创建放大后的图片
      const zoomedImg = document.createElement("img");
      zoomedImg.src = imgSrc;
      // 增加 w-full h-full 配合 object-contain 使图片尽可能充满视口，实现真正的“放大”效果
      zoomedImg.className =
        "w-full h-full max-w-[90vw] max-h-[90vh] object-contain scale-95 transition-transform duration-300 rounded-lg shadow-2xl";

      // 组装并添加到页面
      overlay.appendChild(zoomedImg);
      document.body.appendChild(overlay);

      // 禁用页面滚动
      document.body.style.overflow = "hidden";

      // 触发动画
      requestAnimationFrame(() => {
        overlay.classList.remove("opacity-0");
        zoomedImg.classList.remove("scale-95");
        zoomedImg.classList.add("scale-100");
      });

      // 点击关闭处理函数
      const closeZoom = () => {
        overlay.classList.add("opacity-0");
        zoomedImg.classList.remove("scale-100");
        zoomedImg.classList.add("scale-95");

        // 恢复页面滚动
        document.body.style.overflow = "";

        setTimeout(() => {
          overlay.remove();
        }, 300);
      };

      overlay.addEventListener("click", closeZoom);

      // 添加 ESC 键关闭支持
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeZoom();
          document.removeEventListener("keydown", escHandler);
        }
      };
      document.addEventListener("keydown", escHandler);
      return;
    }
  }

  // 处理代码复制
  const copyBtn = target.closest(".copy-btn");
  if (copyBtn) {
    e.preventDefault();
    e.stopPropagation();
    const codeEncoded = copyBtn.getAttribute("data-code");
    if (codeEncoded) {
      try {
        const code = decodeURIComponent(codeEncoded);

        // 兼容处理：在非安全上下文(HTTP)中，navigator.clipboard 可能未定义
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = code;
          // 确保文本域不可见
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
          } catch (err) {
            console.error("Fallback copy failed", err);
          }
          textArea.remove();
        }

        const copyText = copyBtn.querySelector(".copy-text");
        if (copyText) {
          const originalText = copyText.textContent;
          copyText.textContent = "已复制";
          copyText.classList.add("text-green-500", "dark:text-green-400");
          setTimeout(() => {
            copyText.textContent = originalText;
            copyText.classList.remove("text-green-500", "dark:text-green-400");
          }, 2000);
        }
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  }
};
</script>

<style>
@reference "tailwindcss";

/* Markdown 容器基础样式覆盖 */
.custom-prose {
  color: #4b5563;
  font-size: 1.125rem; /* 基础字号调大到18px */
  line-height: 1.85; /* 增加行高，提升阅读舒适度 */
  letter-spacing: 0.5px;
}

html.dark .custom-prose {
  color: #dbeafe; /* text-blue-100 */
}

/* 覆盖 Tailwind Typography 的默认颜色 */
html.dark .custom-prose p,
html.dark .custom-prose ul,
html.dark .custom-prose ol,
html.dark .custom-prose li,
html.dark .custom-prose blockquote,
html.dark .custom-prose figcaption {
  color: #dbeafe; /* text-blue-100 */
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
.custom-prose :is(h1, h2, h3, h4, h5, h6) {
  color: #2a2e33;
  margin-top: 2.6rem;
  margin-bottom: 1.15rem;
  font-weight: 650;
  letter-spacing: 0.4px;
  scroll-margin-top: 7.5rem;
}

html.dark .custom-prose :is(h1, h2, h3, h4, h5, h6) {
  color: #eff6ff;
}

.custom-prose h1 {
  font-size: clamp(1.95rem, 1.35vw + 1.55rem, 2.55rem);
  line-height: 1.15;
  margin-top: 2.8rem;
  margin-bottom: 1.25rem;
}
.custom-prose h2 {
  font-size: clamp(1.55rem, 1.05vw + 1.3rem, 2.05rem);
  line-height: 1.24;
  margin-top: 2.6rem;
  position: relative;
  padding-left: 1.25rem;
  padding-bottom: 0;
  border-bottom: none !important;
}
.custom-prose h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.22em;
  width: 0.34rem;
  height: 0.96em;
  border-radius: 999px;
  background: linear-gradient(180deg, #0284c7, #6366f1);
  box-shadow: 0 10px 26px rgba(2, 132, 199, 0.16);
}
.custom-prose h2::after {
  content: "";
  position: absolute;
  left: 0.5rem;
  top: 0.36em;
  width: 0.14rem;
  height: 0.62em;
  border-radius: 999px;
  background: rgba(2, 132, 199, 0.55);
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.12);
}
html.dark .custom-prose h2::before {
  background: linear-gradient(180deg, #38bdf8, #a5b4fc);
  box-shadow: 0 12px 30px rgba(56, 189, 248, 0.14);
}
html.dark .custom-prose h2::after {
  background: rgba(56, 189, 248, 0.52);
  box-shadow: 0 12px 28px rgba(165, 180, 252, 0.12);
}
.custom-prose h3 {
  font-size: clamp(1.28rem, 0.75vw + 1.1rem, 1.65rem);
  line-height: 1.3;
  margin-top: 2.2rem;
}
.custom-prose h4 {
  font-size: clamp(1.12rem, 0.5vw + 1.02rem, 1.35rem);
  line-height: 1.35;
  margin-top: 1.9rem;
}
.custom-prose h5 {
  font-size: 1.06rem;
  line-height: 1.4;
  margin-top: 1.65rem;
}
.custom-prose h6 {
  font-size: 1rem;
  line-height: 1.45;
  margin-top: 1.45rem;
  opacity: 0.92;
}

.custom-prose strong,
.custom-prose b {
  color: #111827;
  font-weight: 600;
  padding: 0 2px;
}

html.dark .custom-prose strong,
html.dark .custom-prose b {
  color: #bfdbfe; /* text-blue-200 */
}

.custom-prose .nb-divider {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.custom-prose .nb-divider-line {
  height: 1px;
  flex: 1;
  background-size: 200% 100%;
  animation: nb-divider-breathe 3.6s ease-in-out infinite;
  opacity: 0.8;
}
.custom-prose .nb-divider-line--l {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(2, 132, 199, 0.52),
    rgba(99, 102, 241, 0.5),
    rgba(236, 72, 153, 0.28)
  );
}
.custom-prose .nb-divider-line--r {
  background-image: linear-gradient(
    90deg,
    rgba(236, 72, 153, 0.28),
    rgba(99, 102, 241, 0.5),
    rgba(2, 132, 199, 0.52),
    transparent
  );
}
html.dark .custom-prose .nb-divider-line--l {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.5),
    rgba(165, 180, 252, 0.46),
    rgba(244, 63, 94, 0.26)
  );
}
html.dark .custom-prose .nb-divider-line--r {
  background-image: linear-gradient(
    90deg,
    rgba(244, 63, 94, 0.26),
    rgba(165, 180, 252, 0.46),
    rgba(56, 189, 248, 0.5),
    transparent
  );
}
.custom-prose .nb-divider-badge {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 10px 30px rgba(2, 6, 23, 0.08),
    0 0 0 4px rgba(99, 102, 241, 0.06);
  animation: nb-divider-badge-breathe 3.6s ease-in-out infinite;
}
html.dark .custom-prose .nb-divider-badge {
  border-color: rgba(51, 65, 85, 0.9);
  background: rgba(15, 23, 42, 0.65);
  box-shadow:
    0 12px 34px rgba(0, 0, 0, 0.45),
    0 0 0 4px rgba(165, 180, 252, 0.08);
}
.custom-prose .nb-divider-coffee {
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes nb-divider-breathe {
  0% {
    opacity: 0.62;
    filter: blur(0px);
    background-position: 0% 50%;
  }
  50% {
    opacity: 0.92;
    filter: blur(0.2px);
    background-position: 100% 50%;
  }
  100% {
    opacity: 0.62;
    filter: blur(0px);
    background-position: 0% 50%;
  }
}
@keyframes nb-divider-badge-breathe {
  0% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-1px) scale(1.03);
  }
  100% {
    transform: translateY(0px) scale(1);
  }
}

.nb-end-marker {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.nb-end-line {
  height: 1px;
  flex: 1;
  background-size: 200% 100%;
  opacity: 0.78;
  animation: nb-divider-breathe 7.2s ease-in-out infinite;
}
.nb-end-line--l {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(2, 132, 199, 0.5),
    rgba(99, 102, 241, 0.46)
  );
}
.nb-end-line--r {
  background-image: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.46),
    rgba(2, 132, 199, 0.5),
    transparent
  );
}
html.dark .nb-end-line--l {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.48),
    rgba(165, 180, 252, 0.44)
  );
}
html.dark .nb-end-line--r {
  background-image: linear-gradient(
    90deg,
    rgba(165, 180, 252, 0.44),
    rgba(56, 189, 248, 0.48),
    transparent
  );
}
.nb-end-badge {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 12px 34px rgba(2, 6, 23, 0.08),
    0 0 0 4px rgba(2, 132, 199, 0.05);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(90deg, #0284c7, #6366f1, #ec4899);
  animation: nb-divider-badge-breathe 7.2s ease-in-out infinite;
}
html.dark .nb-end-badge {
  border-color: rgba(51, 65, 85, 0.9);
  background: rgba(15, 23, 42, 0.55);
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.5),
    0 0 0 4px rgba(165, 180, 252, 0.07);
  background-image: linear-gradient(90deg, #38bdf8, #a5b4fc, #fb7185);
}

.nb-cc-watermark {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 3.25rem;
  height: 3.25rem;
  color: #94a3b8;
  opacity: 0.14;
  pointer-events: none;
}
html.dark .nb-cc-watermark {
  color: #64748b;
  opacity: 0.18;
}

.custom-prose .katex {
  font-size: 1.06em;
  color: #111827;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}
html.dark .custom-prose .katex {
  color: #e5e7eb;
}
.custom-prose .katex-display {
  position: relative;
  margin: 1.35rem 0;
  padding: 1.1rem 1.25rem;
  border-radius: 1.05rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: transparent;
  box-shadow: 0 1px 14px rgba(2, 6, 23, 0.06);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  transition:
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}
html.dark .custom-prose .katex-display {
  background: transparent;
  border-color: rgba(51, 65, 85, 0.85);
  box-shadow: 0 1px 18px rgba(0, 0, 0, 0.35);
}
.custom-prose .katex-display:hover {
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 1px 22px rgba(2, 6, 23, 0.09);
}
html.dark .custom-prose .katex-display:hover {
  border-color: rgba(165, 180, 252, 0.28);
  box-shadow: 0 1px 26px rgba(0, 0, 0, 0.42);
}
.custom-prose :is(p, li, blockquote, figcaption, h1, h2, h3, h4) .katex {
  display: inline-block;
  padding: 0 0.14rem;
  border-radius: 0.35rem;
  background: transparent;
  box-shadow: none;
  border-bottom: 1px solid rgba(99, 102, 241, 0.28);
  vertical-align: -0.08em;
}
html.dark
  .custom-prose
  :is(p, li, blockquote, figcaption, h1, h2, h3, h4)
  .katex {
  background: transparent;
  box-shadow: none;
  border-bottom-color: rgba(165, 180, 252, 0.3);
}
.custom-prose .katex-display::-webkit-scrollbar {
  height: 10px;
}
.custom-prose .katex-display::-webkit-scrollbar-track {
  background: transparent;
}
.custom-prose .katex-display::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.28);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
html.dark .custom-prose .katex-display::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.28);
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* 代码块包装器及覆盖默认 pre 样式 */
.custom-prose pre {
  background-color: transparent !important;
  color: inherit !important;
  border-radius: 0 !important;
  padding: 1rem !important;
  margin: 0 !important;
  box-shadow: none !important;
  border: none !important;
}

.custom-prose .code-block-wrapper {
  border-radius: 0.9rem;
  border-color: rgba(226, 232, 240, 0.9);
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}

html.dark .custom-prose .code-block-wrapper {
  border-color: rgba(71, 85, 105, 0.6);
  background: linear-gradient(to bottom, #1e293b, #0f172a);
}

.custom-prose .code-block-header {
  backdrop-filter: blur(8px);
}

.custom-prose .code-block-content {
  align-items: flex-start;
}

.custom-prose .line-numbers {
  min-width: 3rem;
}

.custom-prose .code-lines {
  display: block;
  width: 100%;
}

.custom-prose .line-number,
.custom-prose .code-line {
  display: block;
  min-height: 1.75rem;
  line-height: 1.75rem;
}

.custom-prose .code-line {
  white-space: pre;
}

/* 行内代码样式 (排除代码块内的 code) */
.custom-prose code:not(pre code) {
  background-color: rgba(2, 132, 199, 0.1); /* 浅蓝色背景，与主题蓝呼应 */
  color: #0284c7; /* text-sky-600 */
  padding: 0.2em 0.4em; /* 微调内边距，使其更像标签 */
  margin: 0 0.1em; /* 防止与前后文字粘连 */
  border-radius: 0.375rem; /* rounded-md */
  font-family:
    "Fira Code", "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace; /* 优先使用更好看的编程字体 */
  font-size: 0.85em; /* 相对于正文字号稍微缩小 */
  border: 1px solid rgba(2, 132, 199, 0.2); /* 添加极淡的边框，增加精致感 */
  word-break: break-word; /* 防止长代码撑破容器 */
}

html.dark .custom-prose code:not(pre code) {
  background-color: rgba(56, 189, 248, 0.15); /* 暗色模式下的浅蓝色背景 */
  color: #7dd3fc; /* text-sky-300 */
  border-color: rgba(56, 189, 248, 0.25);
}

.custom-prose code:not(pre code)::before,
.custom-prose code:not(pre code)::after {
  content: none;
}

/* 代码块内部代码样式 */
.custom-prose pre code {
  background-color: transparent !important;
  color: inherit;
  padding: 0;
  border: 0;
  font-size: 0.9em;
  font-family:
    "Fira Code", "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;
}

/* 语法高亮覆盖，确保在亮色和暗色模式下的可读性 */
.hljs {
  background: transparent !important;
  padding: 0 !important;
}

/* 外部链接卡片 */
.custom-prose a.nb-external-card {
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-radius: 0.9rem;
  box-shadow: 0 2px 8px rgba(2, 6, 23, 0.03);
  color: inherit;
  text-decoration: none;
  transition:
    box-shadow 0.25s,
    transform 0.15s,
    border-color 0.2s,
    background 0.2s;
  min-height: 176px;
}
.custom-prose a.nb-external-card:hover {
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.12);
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.35);
}
.custom-prose a.nb-external-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.1);
}
.custom-prose a.nb-external-card:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(59, 130, 246, 0.25),
    0 10px 24px rgba(2, 6, 23, 0.12);
}
html.dark .custom-prose a.nb-external-card {
  border-color: rgba(71, 85, 105, 0.5);
  background: linear-gradient(to bottom, #1f2937, #0f172a);
}
.custom-prose a.nb-external-card .nb-ext-cover {
  width: 36%;
  min-width: 180px;
  background: transparent;
  padding: 12px;
  box-sizing: border-box;
  display: block;
  border-radius: 0.9rem 0 0 0.9rem;
  overflow: hidden;
}
.custom-prose a.nb-external-card .nb-ext-cover-inner {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #e2e8f0;
  border-radius: 0.75rem;
  box-shadow:
    inset 0 0 0 1px rgba(226, 232, 240, 0.65),
    0 1px 6px rgba(2, 6, 23, 0.08);
  display: block;
  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}
.custom-prose a.nb-external-card:hover .nb-ext-cover-inner {
  transform: scale(1.03);
}
@media (max-width: 640px) {
  .custom-prose a.nb-external-card .nb-ext-cover {
    width: 38%;
    min-width: 140px;
    padding: 10px;
  }
}
html.dark .custom-prose a.nb-external-card .nb-ext-cover-inner {
  background-color: #0b1220;
  box-shadow:
    inset 0 0 0 1px rgba(71, 85, 105, 0.5),
    0 1px 6px rgba(0, 0, 0, 0.25);
}
.custom-prose a.nb-external-card .nb-ext-body {
  flex: 1;
  padding: 1.2rem 1.3rem 1.3rem 1.3rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
}
.custom-prose a.nb-external-card .nb-ext-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.05rem;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html.dark .custom-prose a.nb-external-card .nb-ext-title {
  color: #e2e8f0;
}
.custom-prose a.nb-external-card .nb-ext-desc {
  margin-top: 0.25rem;
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.45;
  max-height: 3.7em;
  overflow: hidden;
}
html.dark .custom-prose a.nb-external-card .nb-ext-desc {
  color: #cbd5e1;
  opacity: 0.9;
}
.custom-prose a.nb-external-card .nb-ext-host {
  font-size: 0.75rem;
  color: #64748b;
}
html.dark .custom-prose a.nb-external-card .nb-ext-host {
  color: #7dd3fc;
  opacity: 0.85;
}
.custom-prose a.nb-external-card .nb-ext-link {
  margin-top: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  transition: color 0.2s ease;
}
.custom-prose a.nb-external-card .nb-ext-fav {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  background-size: cover;
  background-position: center;
  background-color: #f1f5f9;
  flex-shrink: 0;
  border: 1px solid rgba(226, 232, 240, 0.8);
}
html.dark .custom-prose a.nb-external-card .nb-ext-fav {
  background-color: #0b1220;
  border-color: rgba(71, 85, 105, 0.6);
}
.custom-prose a.nb-external-card .nb-ext-path {
  font-size: 0.75rem;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}
html.dark .custom-prose a.nb-external-card .nb-ext-path {
  color: #93c5fd;
  opacity: 0.85;
}
.custom-prose a.nb-external-card .nb-ext-arrow {
  margin-left: auto;
  color: #0284c7;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}
html.dark .custom-prose a.nb-external-card .nb-ext-arrow {
  color: #38bdf8;
}
.custom-prose a.nb-external-card:hover .nb-ext-arrow {
  transform: translateX(2px);
  color: #0ea5e9;
}
/* 兼容性处理：无需列表包装，已在渲染阶段移除 <li>/<ul>/<ol> */

/* 内部链接卡片 */
.custom-prose a.nb-internal-card {
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
  border-radius: 0.9rem;
  box-shadow: 0 2px 8px rgba(2, 6, 23, 0.03);
  color: inherit;
  text-decoration: none;
  transition:
    box-shadow 0.25s,
    transform 0.15s,
    border-color 0.2s,
    background 0.2s;
  min-height: 148px;
}
.custom-prose a.nb-internal-card:hover {
  box-shadow: 0 8px 18px rgba(2, 6, 23, 0.1);
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.35);
}
.custom-prose a.nb-internal-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.1);
}
.custom-prose a.nb-internal-card:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(99, 102, 241, 0.25),
    0 10px 24px rgba(2, 6, 23, 0.12);
}
html.dark .custom-prose a.nb-internal-card {
  border-color: rgba(71, 85, 105, 0.5);
  background: linear-gradient(to bottom, #111827, #0f172a);
}
.custom-prose a.nb-internal-card .nb-int-cover {
  width: 28%;
  min-width: 130px;
  background: transparent;
  padding: 12px;
  box-sizing: border-box;
  display: block;
  border-radius: 0.9rem 0 0 0.9rem;
  overflow: hidden;
}
.custom-prose a.nb-internal-card .nb-int-cover-inner {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: radial-gradient(
    120% 120% at 20% 0%,
    #eef2ff 0%,
    #e0e7ff 40%,
    #c7d2fe 100%
  );
  box-shadow:
    inset 0 0 0 1px rgba(226, 232, 240, 0.7),
    0 1px 6px rgba(2, 6, 23, 0.06);
  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}
.custom-prose a.nb-internal-card:hover .nb-int-cover-inner {
  transform: scale(1.03);
}
.custom-prose a.nb-internal-card .nb-int-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #4338ca;
  background: linear-gradient(145deg, #ffffff, #eef2ff);
  box-shadow:
    0 1px 4px rgba(2, 6, 23, 0.06),
    inset 0 0 0 1px rgba(67, 56, 202, 0.25);
}
@media (max-width: 640px) {
  .custom-prose a.nb-internal-card .nb-int-cover {
    width: 34%;
    min-width: 120px;
    padding: 10px;
  }
}
html.dark .custom-prose a.nb-internal-card .nb-int-cover-inner {
  background: radial-gradient(120% 120% at 20% 0%, #1f2937 0%, #111827 100%);
  box-shadow:
    inset 0 0 0 1px rgba(71, 85, 105, 0.6),
    0 1px 6px rgba(0, 0, 0, 0.25);
}
html.dark .custom-prose a.nb-internal-card .nb-int-glyph {
  color: #c7d2fe;
  background: linear-gradient(145deg, #0b1220, #111827);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.25),
    inset 0 0 0 1px rgba(99, 102, 241, 0.3);
}
.custom-prose a.nb-internal-card .nb-int-body {
  flex: 1;
  padding: 1.05rem 1.15rem 1.15rem 1.15rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
}
.custom-prose a.nb-internal-card .nb-int-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.02rem;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html.dark .custom-prose a.nb-internal-card .nb-int-title {
  color: #e2e8f0;
}
.custom-prose a.nb-internal-card .nb-int-desc {
  margin-top: 0.2rem;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.45;
  max-height: 3.7em;
  overflow: hidden;
}
html.dark .custom-prose a.nb-internal-card .nb-int-desc {
  color: #cbd5e1;
  opacity: 0.9;
}
.custom-prose a.nb-internal-card .nb-int-link {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
}
.custom-prose a.nb-internal-card .nb-int-path {
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 65%;
}
html.dark .custom-prose a.nb-internal-card .nb-int-path {
  color: #93c5fd;
  opacity: 0.85;
}
.custom-prose a.nb-internal-card .nb-int-arrow {
  margin-left: auto;
  color: #6366f1;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}
html.dark .custom-prose a.nb-internal-card .nb-int-arrow {
  color: #a5b4fc;
}
.custom-prose a.nb-internal-card:hover .nb-int-arrow {
  transform: translateX(2px);
  color: #4f46e5;
}

/* 注脚区域 */
.custom-prose .nb-footnotes {
  border-top: 1px dashed rgba(148, 163, 184, 0.35);
  padding-top: 1rem;
}
.custom-prose .nb-footnotes-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}
html.dark .custom-prose .nb-footnotes-title {
  color: #bfdbfe;
}
.custom-prose .nb-footnotes ol {
  margin: 0;
  padding-left: 1.25rem;
}
.custom-prose .nb-footnotes li {
  margin: 0.25rem 0;
  color: #475569;
}
html.dark .custom-prose .nb-footnotes li {
  color: #cbd5e1;
}
.custom-prose .nb-footnote-ref a {
  color: #0284c7;
  text-decoration: none;
}
html.dark .custom-prose .nb-footnote-ref a {
  color: #38bdf8;
}
.custom-prose .nb-fn-back {
  margin-left: 0.35rem;
  color: #64748b;
}
html.dark .custom-prose .nb-fn-back {
  color: #7dd3fc;
  opacity: 0.85;
}

/* Blockquote 简约现代优雅样式 - 面板可见性增强 */
.custom-prose blockquote {
  position: relative;
  font-weight: normal;
  font-style: normal;
  color: #4b5563; /* text-gray-600 */
  border: 1px solid #e5e7eb; /* 浅色边框勾勒面板轮廓 */
  background: #f8fafc; /* 极浅的石板色背景 */
  padding: 1.5rem 1.5rem 1.5rem 3.5rem;
  margin: 2.5rem 0;
  border-radius: 0.75rem; /* 圆角增加现代感 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* 微微的阴影浮起 */
}

.custom-prose blockquote::before {
  content: "“";
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  font-size: 4rem;
  color: #cbd5e1; /* slate-300 */
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1;
  opacity: 0.6;
  pointer-events: none;
}

html.dark .custom-prose blockquote {
  color: #d1d5db; /* dark:text-gray-300 */
  background: #1e293b; /* slate-800 增强暗色模式可见性 */
  border-color: #334155; /* slate-700 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
}

html.dark .custom-prose blockquote::before {
  color: #475569; /* slate-600 */
}

.custom-prose blockquote p:first-of-type::before,
.custom-prose blockquote p:last-of-type::after {
  content: none;
}

.custom-prose blockquote p {
  margin-top: 0;
  margin-bottom: 0.75rem;
  line-height: 1.8;
  font-size: 1.05rem;
  position: relative;
  z-index: 1;
}

.custom-prose blockquote p:last-child {
  margin-bottom: 0;
}

/* 嵌套引用样式 - 视觉美观优化与外层匹配 */
.custom-prose blockquote blockquote {
  margin: 1.25rem 0 0 0;
  padding: 1rem 1.25rem;
  border: 1px dashed #cbd5e1; /* 虚线边框，轻量化且与外层实线呼应 */
  background: transparent; /* 移除背景色，保持整体的留白感 */
  border-radius: 0.5rem; /* 与外层一致的圆角风格 */
  box-shadow: none;
  position: relative;
}

.custom-prose blockquote blockquote::before {
  content: none; /* 嵌套引用不显示引号 */
}

/* 嵌套引用段落的特殊处理，使其略微缩小，增加层级感 */
.custom-prose blockquote blockquote p {
  font-size: 0.95rem;
  color: #64748b; /* 颜色比外层稍浅 */
}

html.dark .custom-prose blockquote blockquote {
  border-color: #475569; /* slate-600 */
  background: transparent;
}

html.dark .custom-prose blockquote blockquote p {
  color: #94a3b8; /* slate-400 */
}

/* 引用来源标签样式 - 靠右下并缩小 */
.custom-prose .cite-source {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: -0.5rem; /* 靠右下调整 */
  font-size: 0.75rem; /* 缩小字号 */
  line-height: 1; /* 占据约1/2普通高度 */
  color: #64748b; /* slate-500 */
  font-weight: 400;
  font-style: normal;
  position: relative;
  z-index: 1;
}

.custom-prose .cite-source::before {
  content: "";
  display: block;
  width: 1.5rem;
  height: 1px; /* 线条变细 */
  background-color: #94a3b8; /* slate-400 颜色更低调 */
  border-radius: 1px;
}

html.dark .custom-prose .cite-source {
  color: #94a3b8; /* slate-400 */
}

html.dark .custom-prose .cite-source::before {
  background-color: #64748b;
}

/* 列表基础样式与交互动效 */
.custom-prose ul,
.custom-prose ol {
  padding-left: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.custom-prose li {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  padding-left: 0.5rem;
  border-radius: 0.375rem;
}

/* 列表项 Hover 动效 - 轻微右移和背景色变化 */
.custom-prose li:hover {
  transform: translateX(4px);
  background-color: #f8fafc; /* slate-50 */
}

html.dark .custom-prose li:hover {
  background-color: rgba(30, 41, 59, 0.5); /* slate-800/50 */
}

/* 无序列表自定义标记 */
.custom-prose ul {
  list-style-type: none;
}

.custom-prose ul > li::before {
  content: "•";
  position: absolute;
  left: -1rem;
  top: 0;
  color: #3b82f6; /* blue-500 */
  font-weight: bold;
  font-size: 1.2em;
  line-height: 1.5;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.custom-prose ul > li:hover::before {
  color: #2563eb; /* blue-600 */
  transform: scale(1.2);
}

html.dark .custom-prose ul > li::before {
  color: #60a5fa; /* blue-400 */
}

html.dark .custom-prose ul > li:hover::before {
  color: #93c5fd; /* blue-300 */
}

/* 嵌套无序列表标记变化 */
.custom-prose ul ul > li::before {
  content: "◦";
  color: #64748b; /* slate-500 */
}

.custom-prose ul ul ul > li::before {
  content: "▪";
  color: #94a3b8; /* slate-400 */
}

/* 有序列表自定义标记 */
.custom-prose ol {
  list-style-type: none;
  counter-reset: custom-counter;
}

.custom-prose ol > li {
  counter-increment: custom-counter;
}

.custom-prose ol > li::before {
  content: counter(custom-counter) ".";
  position: absolute;
  left: -1.5rem;
  top: 0;
  color: #0284c7; /* 主题蓝 */
  font-weight: 600;
  font-size: 0.9em;
  min-width: 1.2rem;
  text-align: right;
  transition: color 0.3s ease;
}

html.dark .custom-prose ol > li::before {
  color: #38bdf8;
}

/* 待办列表样式美化 */
.custom-prose .todo-list {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem; /* 减小外层内边距，使整体更紧凑 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

html.dark .custom-prose .todo-list {
  background: #1e293b;
  border-color: #334155;
}

.custom-prose .todo-list > div {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 减小复选框与文本的间距 */
  padding: 0.25rem 0.5rem; /* 减小每一项的上下内边距 */
  margin: 0.125rem 0; /* 增加微小的项间距代替大 padding */
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.custom-prose .todo-list > div:hover {
  background-color: #f1f5f9; /* slate-100 */
}

html.dark .custom-prose .todo-list > div:hover {
  background-color: rgba(51, 65, 85, 0.5); /* slate-700/50 */
}

.custom-prose .todo-list input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #cbd5e1; /* slate-300 */
  border-radius: 0.25rem;
  background-color: #ffffff;
  cursor: not-allowed;
  position: relative;
  transition: all 0.2s ease;
  margin: 0; /* 覆盖默认 margin */
}

html.dark .custom-prose .todo-list input[type="checkbox"] {
  border-color: #64748b;
  background-color: #0f172a;
}

.custom-prose .todo-list input[type="checkbox"]:checked {
  background-color: #10b981; /* emerald-500 */
  border-color: #10b981;
}

.custom-prose .todo-list input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  top: 0.125rem;
  left: 0.375rem;
  width: 0.375rem;
  height: 0.625rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-prose .todo-list div:has(input[type="checkbox"]:checked) {
  color: #94a3b8; /* slate-400 */
  text-decoration: line-through;
  opacity: 0.8;
}

html.dark .custom-prose .todo-list div:has(input[type="checkbox"]:checked) {
  color: #64748b;
}

.custom-prose audio[controls] {
  width: 100%;
  margin: 2rem 0;
  display: block;
  border-radius: 0.9rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  box-shadow:
    0 12px 24px -18px rgba(15, 23, 42, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.85) inset;
  padding: 0.35rem;
}

.custom-prose audio[controls]::-webkit-media-controls-enclosure {
  border-radius: 0.7rem;
}

.custom-prose audio[controls]::-webkit-media-controls-panel {
  background: rgba(248, 250, 252, 0.95);
}

html.dark .custom-prose audio[controls] {
  border-color: rgba(51, 65, 85, 0.85);
  background: linear-gradient(to bottom, #0f172a, #111827);
  box-shadow:
    0 12px 24px -18px rgba(2, 6, 23, 0.8),
    0 1px 0 rgba(148, 163, 184, 0.1) inset;
}

html.dark .custom-prose audio[controls]::-webkit-media-controls-panel {
  background: rgba(30, 41, 59, 0.96);
}

/* 图片样式 */
.custom-prose img {
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
  cursor: zoom-in; /* 默认显示可放大鼠标样式 */
  border: 1px solid #f3f4f6; /* border-gray-100 */
}

/* 单图居中显示，使用更具体的选择器以避免破坏 flex 布局中的多图 */
.custom-prose p > img,
.custom-prose > img,
.custom-prose figure > img {
  margin: 2rem auto;
  display: block;
}

/* 多图画廊排版 */
.custom-prose .image-gallery {
  display: grid;
  gap: 1rem;
  margin: 2.5rem 0;
  align-items: start;
  grid-template-columns: minmax(0, 1fr);
}

.custom-prose .image-gallery.layout-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .custom-prose .image-gallery.layout-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .custom-prose .image-gallery.layout-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .custom-prose .image-gallery.layout-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.custom-prose .image-gallery figure.image-wrapper {
  margin: 0 !important;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.custom-prose .image-gallery figure.image-wrapper img {
  margin: 0 !important;
  width: 100%;
  aspect-ratio: 1 / 1;
  height: auto;
  max-height: 300px;
  object-fit: cover; /* 保证多图排版时尺寸一致不拉伸 */
  border-radius: 0.5rem;
}

html.dark .custom-prose img {
  border-color: #1f2937; /* border-gray-800 */
}

/* 自定义 Feature Card 样式 */
.custom-prose .feature-card {
  background-image: linear-gradient(
    to bottom right,
    #eff6ff,
    #eef2ff
  ); /* from-blue-50 to-indigo-50 */
  padding: 1.5rem; /* p-6 */
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid #dbeafe; /* border-blue-100 */
  margin: 2rem 0; /* my-8 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
}

/* 黑幕样式 (Heimu) */
.custom-prose .heimu {
  background-color: #252525;
  color: transparent;
  text-shadow: none;
  transition: color 0.3s ease;
  padding: 0 0.25rem;
  border-radius: 0.125rem;
}

html.dark .custom-prose .heimu {
  background-color: #e5e7eb;
}

.custom-prose .heimu:hover,
.custom-prose .heimu:active {
  color: #ffffff;
}

html.dark .custom-prose .heimu:hover,
html.dark .custom-prose .heimu:active {
  color: #111827;
}

html.dark .custom-prose .feature-card {
  background-image: linear-gradient(
    to bottom right,
    #1f2937,
    #111827
  ); /* from-gray-800 to-gray-900 */
  border-color: #374151; /* border-gray-700 */
}

.custom-prose .feature-card ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.custom-prose .feature-card ul > * + * {
  margin-top: 0.75rem; /* space-y-3 */
}

.custom-prose .feature-card li {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  margin: 0;
  padding: 0;
}

.custom-prose .feature-card li::before {
  content: none;
}

.custom-prose .table-container {
  margin: 2.5rem 0 1rem 0; /* 减小底部外边距，拉近与下方元素的距离 */
}

.custom-prose .table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0; /* 内部滚动容器不需要额外的上下边距 */
  position: relative;
  z-index: 1;
  padding: 1px 1px 15px 1px; /* 适当减小底部 padding，只要够放阴影即可 */
  clear: both;
}

/* 添加一个微妙的渐变遮罩提示可滚动（当内容超出时） */
.custom-prose .table-wrapper::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2rem;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.9));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  border-top-right-radius: 0.875rem;
  border-bottom-right-radius: 0.875rem;
}
/* 添加一个微妙的渐变遮罩提示可滚动（当内容超出时） */
.custom-prose .table-wrapper::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2rem;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.9));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-top-right-radius: 0.875rem;
  border-bottom-right-radius: 0.875rem;
}
.custom-prose .table-wrapper:hover::after {
  opacity: 1; /* 鼠标悬停时提示右侧可滚动区域 */
}

html.dark .custom-prose .table-wrapper::after {
  background: linear-gradient(to right, transparent, rgba(30, 41, 59, 0.9));
}

/* 阴影需要加在 table 上，否则 margin 会被 wrapper 的阴影包围 */
.custom-prose table {
  width: 100%;
  border-collapse: separate; /* 改为 separate 以支持单元格间距和更精细的圆角控制 */
  border-spacing: 0;
  margin: 0;
  font-size: 0.95em;
  line-height: 1.6; /* 增加行高，提升文字呼吸感 */
  min-width: 600px;
  border: 1px solid rgba(226, 232, 240, 0.8); /* 添加外部边框 */
  border-radius: 0.875rem; /* 与 wrapper 保持一致的圆角 */
  background-color: #ffffff; /* 移到这里 */
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    /* 更明显的底部阴影 */ 0 8px 10px -6px rgba(0, 0, 0, 0.02),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset; /* 多层阴影+内发光，增加立体感 */
}

/* 强制让 table 后面的相邻元素向下偏移，避免紧贴导致负 margin 的重叠，但保持合适的距离 */
.custom-prose .table-wrapper + * {
  margin-top: 0; /* 移除之前的额外 margin，靠 container 控制 */
}

html.dark .custom-prose table {
  border-color: rgba(51, 65, 85, 0.6); /* 暗色模式外部边框 */
  background-color: #1e293b; /* 移到这里 */
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.4),
    /* 暗色模式更明显的底部阴影 */ 0 8px 10px -6px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.custom-prose thead {
  position: relative;
}

/* 表头背景改为非常淡的渐变，增加细节质感 */
.custom-prose thead th {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #cbd5e1; /* 加深表头底边框，区分内容区 */
  border-right: 1px solid rgba(226, 232, 240, 0.6); /* 柔和的列分割线 */
  padding: 1.125rem 1.25rem; /* 增加内边距 */
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.025em; /* 轻微字间距 */
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px); /* 玻璃态效果 */
  /* 移除 text-align，允许 markdown 解析结果生效 */
}

html.dark .custom-prose thead th {
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.8),
    rgba(15, 23, 42, 0.95)
  );
  border-bottom-color: #475569;
  border-right-color: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
}

/* 单元格基础样式，强制尊重 markdown 解析出的 align 属性，覆盖 tailwind prose 的默认 start 对齐 */
.custom-prose th[align="center"],
.custom-prose td[align="center"] {
  text-align: center !important;
}
.custom-prose th[align="right"],
.custom-prose td[align="right"] {
  text-align: right !important;
}
.custom-prose th[align="left"],
.custom-prose td[align="left"] {
  text-align: left !important;
}

.custom-prose tbody td {
  padding: 1rem 1.25rem; /* 宽裕的内边距 */
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  border-right: 1px solid rgba(226, 232, 240, 0.4); /* 更淡的列分割线，不喧宾夺主 */
  color: #475569;
  transition: all 0.2s ease;
}

html.dark .custom-prose tbody td {
  border-bottom-color: rgba(51, 65, 85, 0.6);
  border-right-color: rgba(51, 65, 85, 0.3);
  color: #94a3b8;
}

/* 去除最右侧列的右边框 */
.custom-prose th:last-child,
.custom-prose td:last-child {
  border-right: none;
}

/* 斑马线与交互层次感 */
.custom-prose tbody tr {
  background-color: transparent;
  transition:
    background-color 0.25s ease,
    transform 0.2s ease;
}

/* 偶数行极淡背景色 */
.custom-prose tbody tr:nth-child(even) {
  background-color: rgba(248, 250, 252, 0.5); /* #f8fafc with opacity */
}
html.dark .custom-prose tbody tr:nth-child(even) {
  background-color: rgba(15, 23, 42, 0.2);
}

/* Hover 状态的高级层次感：轻微背景色+当前行文字提亮 */
.custom-prose tbody tr:hover {
  background-color: #f1f5f9; /* #slate-100 */
}
.custom-prose tbody tr:hover td {
  color: #0f172a; /* hover时文字变深，聚焦视线 */
}

html.dark .custom-prose tbody tr:hover {
  background-color: rgba(30, 41, 59, 0.8); /* slate-800 */
}
html.dark .custom-prose tbody tr:hover td {
  color: #f8fafc; /* 暗色模式hover文字变亮 */
}

/* 解决 border-collapse: separate 导致的圆角溢出问题 */
.custom-prose thead tr:first-child th:first-child {
  border-top-left-radius: calc(0.875rem - 1px);
}
.custom-prose thead tr:first-child th:last-child {
  border-top-right-radius: calc(0.875rem - 1px);
}
.custom-prose tbody tr:last-child td {
  border-bottom: none; /* 去除最后一行底部边框 */
}
.custom-prose tbody tr:last-child td:first-child {
  border-bottom-left-radius: calc(0.875rem - 1px);
}
.custom-prose tbody tr:last-child td:last-child {
  border-bottom-right-radius: calc(0.875rem - 1px);
}
</style>
