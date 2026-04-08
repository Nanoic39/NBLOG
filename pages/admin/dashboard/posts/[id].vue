<template>
  <section class="h-full min-h-0 flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2
          class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          {{ isCreateMode ? "新建文章" : "编辑文章内容" }}
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          编辑与预览同步进行，元数据和评论在右侧维护
        </p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/dashboard/posts"
          class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
        >
          返回列表
        </NuxtLink>
        <button
          @click="savePost"
          :disabled="isSaving"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-60 shadow-sm"
        >
          {{ isSaving ? "保存中..." : "保存文章" }}
        </button>
      </div>
    </div>

    <p
      v-if="saveMessage"
      class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300"
    >
      {{ saveMessage }}
    </p>
    <p
      v-if="editorNotice.text"
      class="rounded-xl px-3 py-2 text-sm"
      :class="editorNoticeClass"
    >
      {{ editorNotice.text }}
    </p>

    <div class="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-5 flex-1 min-h-0">
      <section
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3 overflow-auto min-h-0"
      >
        <div
          class="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start"
        >
          <div
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 min-h-[100dvh] md:min-h-0"
          >
            <div
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-2.5 mb-2 md:sticky md:top-0 md:z-10"
            >
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="item in toolbarItems"
                  :key="item.key"
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg text-xs border transition-colors"
                  :class="[
                    isToolbarActive(item.key)
                      ? 'border-sky-500 bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 bg-white dark:bg-slate-900',
                    item.requiresSelection && !hasSelection ? 'opacity-45' : '',
                  ]"
                  :disabled="item.requiresSelection && !hasSelection"
                  @click="applyToolbar(item.key)"
                >
                  {{ item.label }}
                </button>
              </div>
              <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                快捷键：Ctrl/⌘+S 保存，Ctrl/⌘+B 加粗，Ctrl/⌘+I 斜体，Ctrl/⌘+K
                链接，Ctrl/⌘+Shift+X 删除线，Ctrl/⌘+Shift+L 布局菜单
              </p>
            </div>
            <p class="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Markdown 编辑区（回车即换行）
            </p>
            <textarea
              ref="editorRef"
              v-model="form.content"
              rows="1"
              class="w-full min-h-[calc(100dvh-15rem)] md:min-h-[560px] resize-none overflow-hidden rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-3 font-mono text-sm leading-7 outline-none focus:border-sky-500"
              :style="{ height: `${editorHeight}px` }"
              placeholder="在此输入 Markdown 正文内容"
              @input="handleEditorInteraction"
              @select="handleEditorInteraction"
              @keyup="handleEditorInteraction"
              @keydown="handleEditorKeydown"
              @mouseup="handleEditorInteraction"
              @scroll="syncFloatingToolbar"
            ></textarea>
          </div>

          <div
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3"
          >
            <p class="mb-2 text-xs text-slate-500 dark:text-slate-400">
              实时预览
            </p>
            <div
              class="min-h-[560px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3"
            >
              <article
                class="bg-white dark:bg-[#242424] backdrop-blur rounded-2xl p-5 md:p-7 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div
                  class="w-full h-44 rounded-xl overflow-hidden mb-5 border border-slate-200/60 dark:border-slate-700/70"
                >
                  <img
                    :src="coverPreviewUrl"
                    :alt="form.title || '文章封面'"
                    class="w-full h-full object-cover"
                  />
                </div>
                <header
                  class="border-b border-slate-200/80 dark:border-slate-700/70 pb-4 mb-5"
                >
                  <h1
                    class="text-2xl md:text-3xl font-bold text-[#2A2E33] dark:text-[#e0e0e0] leading-tight"
                  >
                    {{ form.title || "未命名文章" }}
                  </h1>
                  <p
                    class="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2"
                  >
                    {{ form.description || "这里会显示文章摘要。" }}
                  </p>
                </header>
                <article
                  class="prose custom-prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-xl prose-pre:rounded-lg"
                  v-html="renderedPreview"
                ></article>
              </article>
            </div>
          </div>
        </div>
      </section>

      <aside
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4 h-full min-h-0 overflow-auto"
      >
        <div
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50 dark:bg-slate-800/60"
        >
          <p
            class="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400"
          >
            基础信息
          </p>
          <input
            v-model="form.title"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80"
            placeholder="标题"
          />
          <select
            v-model="form.slugMode"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          >
            <option value="id">slug 类型：使用 id（默认）</option>
            <option value="pinyin">slug 类型：英文+短横线（中文转拼音）</option>
            <option value="title">slug 类型：与标题一致</option>
          </select>
          <input
            v-model="form.slug"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80"
            placeholder="slug（会随标题和类型自动更新）"
          />
          <select
            v-model="form.publishStatus"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          >
            <option value="draft">保存为草稿</option>
            <option value="published">发布</option>
          </select>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80"
            placeholder="摘要"
          ></textarea>
        </div>

        <div
          class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              作者（可多个，可排序）
            </p>
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
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
              placeholder="作者名"
            />
            <input
              v-model="item.socialUrl"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
              placeholder="社交链接（可空）"
            />
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600"
                @click="moveAuthor(index, -1)"
              >
                上移
              </button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600"
                @click="moveAuthor(index, 1)"
              >
                下移
              </button>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded border border-rose-300 text-rose-600"
                @click="removeAuthor(index)"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <div
          class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              标签（可选已有 + 可输入新标签 + 拖动排序）
            </p>
            <span class="text-[11px] text-slate-400">拖动标签胶囊可排序</span>
          </div>
          <div
            class="rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/45 px-2.5 py-2 flex flex-wrap gap-1.5 min-h-11"
          >
            <button
              v-for="tag in selectedTags"
              :key="tag"
              type="button"
              draggable="true"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30 cursor-move"
              @dragstart="handleTagDragStart(tag)"
              @dragenter.prevent="handleTagDragEnter(tag)"
              @dragover.prevent
              @dragend="handleTagDragEnd"
              @click="removeTag(tag)"
            >
              <span class="opacity-60">⋮⋮</span>
              <span>{{ tag }}</span>
              <span>×</span>
            </button>
            <input
              v-model="tagInput"
              class="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg bg-transparent text-sm outline-none"
              placeholder="输入标签后回车"
              @keydown.enter.prevent="addTagFromInput"
              @keydown.backspace="handleTagInputBackspace"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm"
              @click="addTagFromInput"
            >
              添加标签
            </button>
          </div>
          <div
            class="max-h-28 overflow-auto flex flex-wrap gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 p-2"
          >
            <button
              v-for="tag in allTags"
              :key="tag"
              type="button"
              class="px-2 py-1 rounded-lg text-xs border"
              :class="
                selectedTags.includes(tag)
                  ? 'border-sky-500 text-sky-600 dark:text-sky-300'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              "
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div
          class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">原创类型</p>
          <select
            v-model="form.articleType"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          >
            <option value="original">原创</option>
            <option value="co-original">原创合作</option>
            <option value="translation">翻译</option>
            <option value="repost">转载</option>
          </select>
          <input
            v-if="
              form.articleType === 'translation' ||
              form.articleType === 'repost'
            "
            v-model="form.sourceUrl"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
            placeholder="文章来源链接（可空）"
          />
        </div>

        <div
          class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <div class="flex items-center gap-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              CC 许可（可空）
            </p>
            <div class="relative group">
              <button
                type="button"
                class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 text-[10px] text-slate-500 dark:text-slate-300"
              >
                ?
              </button>
              <div
                class="absolute z-20 hidden group-hover:block top-6 left-0 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2.5 space-y-1.5"
              >
                <p
                  v-for="item in ccLicenseTips"
                  :key="item.value"
                  class="text-[11px] leading-5 text-slate-600 dark:text-slate-300"
                >
                  <span class="font-medium text-slate-800 dark:text-slate-200"
                    >{{ item.value }}：</span
                  >{{ item.desc }}
                </p>
              </div>
            </div>
          </div>
          <select
            v-model="form.licenseCc"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          >
            <option value="">不设置</option>
            <option
              v-for="item in ccLicenseTips"
              :key="item.value"
              :value="item.value"
              :title="item.desc"
            >
              {{ item.value }}
            </option>
          </select>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            {{ selectedCcDesc }}
          </p>
        </div>

        <div
          class="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">
            封面图（从 YunaNexusCore 文件系统选择 / 手输链接 / 上传）
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
              @click="openCoverPicker"
            >
              选择已有
            </button>
            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
              :disabled="isLoadingMedia"
              @click="loadMyImages"
            >
              {{ isLoadingMedia ? "加载中..." : "刷新图库" }}
            </button>
            <input
              type="file"
              accept="image/*"
              @change="uploadCoverImage"
              class="text-xs"
            />
          </div>
          <input
            v-model="form.coverImage"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
            placeholder="封面链接（空则默认）"
          />
          <div class="max-h-28 overflow-auto grid grid-cols-4 gap-2">
            <button
              v-for="url in mediaImages.slice(0, 8)"
              :key="url"
              type="button"
              class="rounded-lg overflow-hidden border"
              :class="
                form.coverImage === url
                  ? 'border-sky-500'
                  : 'border-slate-300 dark:border-slate-700'
              "
              @click="form.coverImage = url"
            >
              <img :src="url" alt="media" class="w-full h-12 object-cover" />
            </button>
          </div>
          <div class="space-y-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">预览效果</p>
            <div
              class="rounded-lg border border-slate-200 dark:border-slate-700 p-2"
            >
              <p class="text-[11px] text-slate-500 mb-1">PC</p>
              <img
                :src="coverPreviewUrl"
                alt="cover-pc"
                class="w-full h-24 object-cover rounded"
              />
            </div>
            <div
              class="rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-w-[170px]"
            >
              <p class="text-[11px] text-slate-500 mb-1">移动端</p>
              <img
                :src="coverPreviewUrl"
                alt="cover-mobile"
                class="w-full h-36 object-cover rounded"
              />
            </div>
          </div>
        </div>

        <label
          class="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          <span
            class="relative inline-flex h-5 w-5 items-center justify-center"
          >
            <input
              v-model="form.isPinned"
              type="checkbox"
              class="peer absolute inset-0 h-full w-full appearance-none rounded-md border border-slate-300 bg-white/90 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 checked:border-sky-500 checked:bg-sky-500 dark:border-slate-600 dark:bg-slate-900/80 dark:checked:border-sky-500 dark:checked:bg-sky-500"
            />
            <svg
              class="pointer-events-none h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10.5L8.2 13.5L15 6.8"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          设为置顶
        </label>

        <div
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1"
        >
          <p class="text-slate-600 dark:text-slate-300">
            自动字数：{{ estimatedWordCount }}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            当前浏览：{{ form.views }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            字数由正文自动计算，浏览量由实际访问累加
          </p>
        </div>

        <div
          v-if="!isCreateMode"
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              文章评论（真实接口）
            </p>
            <button
              type="button"
              class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600"
              :disabled="isLoadingComments"
              @click="loadEditorComments"
            >
              {{ isLoadingComments ? "刷新中..." : "刷新评论" }}
            </button>
          </div>
          <div class="max-h-64 overflow-auto space-y-2">
            <div
              v-for="comment in editorComments"
              :key="comment.id"
              class="rounded-lg border border-slate-200 dark:border-slate-700 p-2"
            >
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ comment.author }} ·
                {{ formatCommentDate(comment.createdAt) }}
              </p>
              <p
                class="mt-1 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words"
              >
                {{ comment.content }}
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                回复 {{ comment.replyCount }}
              </p>
            </div>
            <p
              v-if="editorComments.length === 0"
              class="text-xs text-slate-400"
            >
              暂无评论
            </p>
          </div>
        </div>
      </aside>
    </div>

    <div
      v-if="floatingToolbar.visible"
      class="fixed z-30 -translate-x-1/2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 shadow-xl px-1.5 py-1 flex items-center gap-1"
      :style="{
        top: `${floatingToolbar.top}px`,
        left: `${floatingToolbar.left}px`,
      }"
    >
      <button
        v-for="item in floatingItems"
        :key="item.key"
        type="button"
        class="px-2 py-1 rounded text-xs border transition-colors"
        :class="
          isToolbarActive(item.key)
            ? 'border-sky-500 bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
            : 'border-transparent text-slate-700 dark:text-slate-200 hover:bg-sky-100/80 dark:hover:bg-sky-500/20'
        "
        @click="applyToolbar(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div
      v-if="showCoverPicker"
      class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showCoverPicker = false"
    >
      <div
        class="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4"
      >
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <h3
              class="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              选择已有封面
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              来源：YunaNexusCore 当前用户文件系统图片
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
              :disabled="isLoadingMedia"
              @click="loadMyImages"
            >
              {{ isLoadingMedia ? "刷新中..." : "刷新列表" }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
              @click="showCoverPicker = false"
            >
              关闭
            </button>
          </div>
        </div>
        <input
          v-model="coverKeyword"
          class="w-full mb-3 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          placeholder="输入关键词过滤图片地址"
        />
        <div
          class="max-h-[62vh] overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-1"
        >
          <button
            v-for="url in filteredMediaImages"
            :key="url"
            type="button"
            class="rounded-xl overflow-hidden border text-left"
            :class="
              form.coverImage === url
                ? 'border-sky-500 ring-2 ring-sky-200 dark:ring-sky-500/30'
                : 'border-slate-300 dark:border-slate-700'
            "
            @click="selectCoverImage(url)"
          >
            <img
              :src="url"
              alt="cover-option"
              class="w-full h-28 object-cover"
            />
            <p
              class="px-2 py-1 text-[10px] text-slate-500 dark:text-slate-400 truncate"
            >
              {{ url }}
            </p>
          </button>
          <p
            v-if="!isLoadingMedia && filteredMediaImages.length === 0"
            class="col-span-full text-center text-sm text-slate-400 py-8"
          >
            暂无可选图片
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="toolbarPrompt.visible"
      class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeToolbarPrompt"
    >
      <div
        class="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4 space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3
              class="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ toolbarPrompt.title }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ toolbarPrompt.hint }}
            </p>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
            @click="closeToolbarPrompt"
          >
            关闭
          </button>
        </div>
        <select
          v-if="toolbarPrompt.mode === 'layoutMenu'"
          v-model="toolbarPrompt.value"
          class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
        >
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
          <option value="grid2">双图排版</option>
          <option value="grid3">三图排版</option>
        </select>
        <input
          v-else
          ref="toolbarPromptInputRef"
          v-model="toolbarPrompt.value"
          class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 text-sm"
          :placeholder="toolbarPrompt.placeholder"
          @keydown.enter.prevent="submitToolbarPrompt"
        />
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600"
            @click="closeToolbarPrompt"
          >
            取消
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            @click="submitToolbarPrompt"
          >
            确认插入
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { pinyin } from "pinyin-pro";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

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
  slugMode: "id" | "pinyin" | "title";
  publishStatus: "draft" | "published";
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

type EditorCommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  replyCount: number;
};

type ToolbarKey =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "quote"
  | "heimu"
  | "ul"
  | "code"
  | "image"
  | "link"
  | "math"
  | "custom"
  | "divider"
  | "layoutMenu"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "imageGrid2"
  | "imageGrid3"
  | "imageCenter"
  | "imageCaption";
type ToolbarPromptMode = "image" | "link" | "layoutMenu";

const route = useRoute();
const router = useRouter();
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};
const postId = computed(() => String(route.params.id || ""));
const isCreateMode = computed(() => postId.value === "new");
const isSaving = ref(false);
const isLoadingMedia = ref(false);
const isLoadingComments = ref(false);
const saveMessage = ref("");
const allTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const draggingTag = ref("");
const tagInput = ref("");
const mediaImages = ref<string[]>([]);
const showCoverPicker = ref(false);
const coverKeyword = ref("");
const editorComments = ref<EditorCommentItem[]>([]);
const editorRef = ref<HTMLTextAreaElement | null>(null);
const editorHeight = ref(560);
const selectionState = ref({
  start: 0,
  end: 0,
  text: "",
  isImage: false,
});
const floatingToolbar = ref({
  visible: false,
  top: 0,
  left: 0,
});
const editorNotice = ref<{
  type: "error" | "warning" | "success";
  text: string;
}>({
  type: "error",
  text: "",
});
const toolbarPromptInputRef = ref<HTMLInputElement | null>(null);
const toolbarPromptSelection = ref({
  start: 0,
  end: 0,
});
const toolbarPrompt = ref<{
  visible: boolean;
  mode: ToolbarPromptMode;
  title: string;
  hint: string;
  placeholder: string;
  value: string;
}>({
  visible: false,
  mode: "image",
  title: "",
  hint: "",
  placeholder: "",
  value: "",
});

const toolbarItems: Array<{
  key: ToolbarKey;
  label: string;
  requiresSelection?: boolean;
}> = [
  { key: "bold", label: "加粗", requiresSelection: true },
  { key: "italic", label: "斜体", requiresSelection: true },
  { key: "underline", label: "下划线", requiresSelection: true },
  { key: "strike", label: "删除线", requiresSelection: true },
  { key: "quote", label: "引用" },
  { key: "heimu", label: "黑幕", requiresSelection: true },
  { key: "ul", label: "列表" },
  { key: "code", label: "代码块" },
  { key: "image", label: "图片" },
  { key: "link", label: "链接", requiresSelection: true },
  { key: "math", label: "公式" },
  { key: "custom", label: "提示块" },
  { key: "divider", label: "分割线" },
  { key: "layoutMenu", label: "布局设置" },
  { key: "alignLeft", label: "左对齐", requiresSelection: true },
  { key: "alignCenter", label: "居中", requiresSelection: true },
  { key: "alignRight", label: "右对齐", requiresSelection: true },
  { key: "imageGrid2", label: "双图排版" },
  { key: "imageGrid3", label: "三图排版" },
];

const floatingItems = computed(() => {
  if (!selectionState.value.text) return [];
  if (selectionState.value.isImage) {
    return [
      { key: "imageCenter" as ToolbarKey, label: "居中图" },
      { key: "imageCaption" as ToolbarKey, label: "图注" },
      { key: "link" as ToolbarKey, label: "包裹链接" },
    ];
  }
  return [
    { key: "bold" as ToolbarKey, label: "加粗" },
    { key: "italic" as ToolbarKey, label: "斜体" },
    { key: "link" as ToolbarKey, label: "链接" },
    { key: "quote" as ToolbarKey, label: "引用" },
  ];
});

const createDefaultForm = (): PostForm => ({
  title: "",
  slug: "",
  slugMode: "id",
  publishStatus: "draft",
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
const pendingCreateId = ref(String(Date.now()));

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

const normalizeSlugText = (value: string) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const buildPinyinSlug = (title: string) => {
  const py = pinyin(String(title || ""), { toneType: "none", type: "array" });
  const merged = Array.isArray(py) ? py.join(" ") : String(py || "");
  return normalizeSlugText(merged);
};

const buildTitleSlug = (title: string) =>
  String(title || "")
    .trim()
    .replace(/[/?#%]/g, "-")
    .replace(/\s+/g, "-");

const buildSlugByMode = (mode: PostForm["slugMode"], title: string) => {
  if (mode === "id") {
    return isCreateMode.value ? pendingCreateId.value : postId.value;
  }
  if (mode === "pinyin") {
    const pySlug = buildPinyinSlug(title);
    if (pySlug) return pySlug;
    return normalizeSlugText(String(title || ""));
  }
  return buildTitleSlug(title);
};

const applyAutoSlug = () => {
  form.value.slug = buildSlugByMode(form.value.slugMode, form.value.title);
};

const normalizePublishStatus = (post: any): PostForm["publishStatus"] => {
  const rawStatus = String(
    post?.status ?? post?.publishStatus ?? "",
  ).toLowerCase();
  if (rawStatus.includes("draft")) return "draft";
  if (rawStatus.includes("publish")) return "published";
  if (post?.isDraft === true) return "draft";
  if (post?.published === false) return "draft";
  return "published";
};

const inferSlugMode = (
  slug: string,
  title: string,
  id: string,
): PostForm["slugMode"] => {
  const currentSlug = String(slug || "").trim();
  if (!currentSlug) return "id";
  if (currentSlug === String(id || "").trim()) return "id";
  if (currentSlug === buildPinyinSlug(title)) return "pinyin";
  if (currentSlug === buildTitleSlug(title)) return "title";
  return "id";
};

const estimatedWordCount = computed(() => computeWordCount(form.value.content));
const hasSelection = computed(
  () => selectionState.value.end > selectionState.value.start,
);
const editorNoticeClass = computed(() =>
  editorNotice.value.type === "success"
    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300"
    : editorNotice.value.type === "warning"
      ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-300"
      : "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/20 dark:text-rose-300",
);

const getDefaultCoverUrl = (id: string) =>
  `https://www.loliapi.com/acg/?id=${encodeURIComponent(String(id || "post"))}`;

const coverPreviewUrl = computed(() => {
  const custom = String(form.value.coverImage || "").trim();
  if (custom) return custom;
  return getDefaultCoverUrl(isCreateMode.value ? "post" : postId.value);
});

const ccLicenseTips = [
  { value: "CC BY 4.0", desc: "可传播与改编，需署名原作者。" },
  { value: "CC BY-SA 4.0", desc: "可改编与商用，需署名且衍生作品同协议共享。" },
  { value: "CC BY-NC 4.0", desc: "可改编但禁止商业用途，需署名。" },
  { value: "CC BY-NC-SA 4.0", desc: "禁止商用，衍生作品需同协议共享并署名。" },
  { value: "CC BY-ND 4.0", desc: "允许传播但禁止演绎修改，需署名。" },
  { value: "CC0 1.0", desc: "近似放弃版权限制，可自由使用。" },
];

const selectedCcDesc = computed(() => {
  const current = String(form.value.licenseCc || "").trim();
  if (!current) return "未设置许可。";
  return (
    ccLicenseTips.find((item) => item.value === current)?.desc ||
    "该许可暂无说明。"
  );
});

const filteredMediaImages = computed(() => {
  const keyword = String(coverKeyword.value || "")
    .trim()
    .toLowerCase();
  if (!keyword) return mediaImages.value;
  return mediaImages.value.filter((url) =>
    String(url || "")
      .toLowerCase()
      .includes(keyword),
  );
});

const wrapPreviewTables = (html: string) =>
  html
    .replace(
      /<table>/g,
      '<div class="table-container"><div class="table-wrapper"><table>',
    )
    .replace(/<\/table>/g, "</table></div></div>");

const parseCodeBlockMeta = (langRaw?: string) => {
  const raw = String(langRaw || "").trim();
  if (!raw) {
    return {
      languageLabel: "plaintext",
      language: "plaintext",
      title: "",
    };
  }
  const [rawLang, ...titleParts] = raw.split("|");
  const languageLabel = String(rawLang || "").trim() || "plaintext";
  const normalizedLang = languageLabel.toLowerCase();
  const language = hljs.getLanguage(normalizedLang)
    ? normalizedLang
    : "plaintext";
  const title = titleParts.join("|").trim();
  return {
    languageLabel,
    language,
    title,
  };
};

const enhanceSitePreviewHtml = (html: string) =>
  wrapPreviewTables(html).replace(
    /<img([^>]*?)>/g,
    '<img$1 loading="lazy" data-zoomable="true">',
  );

const renderPreviewMarkdown = (markdown: string) => {
  const previewRenderer = new marked.Renderer();
  previewRenderer.code = ({ text, lang }) => {
    const codeMeta = parseCodeBlockMeta(lang);
    const languageLabel = codeMeta.languageLabel;
    const language = codeMeta.language;
    const title = codeMeta.title;
    const source = String(text || "").replace(/\r\n/g, "\n");
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
    const safeLanguageLabel = DOMPurify.sanitize(languageLabel, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    const safeTitle = DOMPurify.sanitize(title, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    return `
      <div class="code-block-wrapper relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
        <div class="code-block-header grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-gray-800">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">${safeLanguageLabel}</span>
          <span class="text-xs text-gray-500 dark:text-gray-300 text-center truncate">${safeTitle}</span>
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
  };
  previewRenderer.image = ({ href, title, text }) => {
    const altText = text ? `alt="${text}"` : "";
    const titleAttr = title ? `title="${title}"` : "";
    return `
      <figure class="image-wrapper my-8 mx-auto flex flex-col items-center justify-center">
        <img src="${href}" ${altText} ${titleAttr} class="rounded-xl shadow-md border border-gray-100 dark:border-gray-800 max-w-full h-auto" data-zoomable="true" loading="lazy" />
        ${text ? `<figcaption class="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">${text}</figcaption>` : ""}
      </figure>
    `;
  };
  return marked.parse(markdown, {
    gfm: true,
    breaks: true,
    renderer: previewRenderer,
  }) as string;
};

const renderedPreview = computed(() => {
  const markdown = String(form.value.content || "");
  if (!markdown.trim()) {
    return `<p class="text-slate-400">暂无预览内容</p>`;
  }
  const html = renderPreviewMarkdown(markdown);
  const siteLikeHtml = enhanceSitePreviewHtml(html);
  return DOMPurify.sanitize(siteLikeHtml, {
    ADD_ATTR: [
      "id",
      "class",
      "style",
      "target",
      "rel",
      "data-code",
      "data-zoomable",
      "loading",
      "align",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-width",
      "viewBox",
      "fill",
      "stroke",
      "d",
    ],
    ADD_TAGS: ["section", "figure", "figcaption", "svg", "path"],
  });
});

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

const moveTagByValue = (fromTag: string, toTag: string) => {
  if (!fromTag || !toTag || fromTag === toTag) return;
  const fromIndex = selectedTags.value.indexOf(fromTag);
  const toIndex = selectedTags.value.indexOf(toTag);
  if (fromIndex < 0 || toIndex < 0) return;
  const list = [...selectedTags.value];
  const [item] = list.splice(fromIndex, 1);
  if (!item) return;
  list.splice(toIndex, 0, item);
  selectedTags.value = list;
};

const handleTagDragStart = (tag: string) => {
  draggingTag.value = tag;
};

const handleTagDragEnter = (tag: string) => {
  if (!draggingTag.value) return;
  moveTagByValue(draggingTag.value, tag);
};

const handleTagDragEnd = () => {
  draggingTag.value = "";
};

const handleTagInputBackspace = () => {
  if (tagInput.value.trim()) return;
  const last = selectedTags.value[selectedTags.value.length - 1];
  if (last) removeTag(last);
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
    const result = (await $fetch(withApiBase("/api/admin/tags"), {
      credentials: "include",
    })) as any;
    const tags = Array.isArray(result?.tags)
      ? result.tags
          .map((item: any) => String(item?.name || "").trim())
          .filter(Boolean)
      : [];
    allTags.value = tags;
  } catch {}
};

const loadMyImages = async () => {
  isLoadingMedia.value = true;
  try {
    const result = (await $fetch(withApiBase("/api/admin/media-images"), {
      credentials: "include",
    })) as any;
    mediaImages.value = Array.isArray(result?.data)
      ? result.data
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
      : [];
  } catch {
    mediaImages.value = [];
  } finally {
    isLoadingMedia.value = false;
  }
};

const openCoverPicker = async () => {
  showCoverPicker.value = true;
  if (mediaImages.value.length === 0) {
    await loadMyImages();
  }
};

const selectCoverImage = (url: string) => {
  form.value.coverImage = url;
  showCoverPicker.value = false;
};

const normalizeCommentTime = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
  }
  return Date.now();
};

const formatCommentDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const loadEditorComments = async () => {
  if (isCreateMode.value) {
    editorComments.value = [];
    return;
  }
  isLoadingComments.value = true;
  try {
    const result = (await $fetch(withApiBase("/api/comments"), {
      credentials: "include",
      query: {
        articleId: postId.value,
        page: 1,
        size: 50,
      },
    })) as any;
    const rows = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];
    editorComments.value = rows.map((item: any) => ({
      id: String(item?.id || item?._id || Date.now()),
      author: String(item?.author || item?.authorName || "用户"),
      content: String(item?.content || ""),
      createdAt: normalizeCommentTime(
        item?.createdAt || item?.createTime || item?.created_at,
      ),
      replyCount: Array.isArray(item?.replies) ? item.replies.length : 0,
    }));
  } catch {
    editorComments.value = [];
  } finally {
    isLoadingComments.value = false;
  }
};

const syncSelectionState = () => {
  const editor = editorRef.value;
  if (!editor) return;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const text = end > start ? form.value.content.slice(start, end) : "";
  const trimmed = text.trim();
  selectionState.value = {
    start,
    end,
    text,
    isImage: /^!\[[^\]]*\]\([^)]+\)$/.test(trimmed),
  };
};

const createMirrorPosition = (editor: HTMLTextAreaElement, index: number) => {
  const style = window.getComputedStyle(editor);
  const mirror = document.createElement("div");
  const props = [
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "letterSpacing",
    "wordSpacing",
  ] as const;
  props.forEach((prop) => {
    (mirror.style as any)[prop] = (style as any)[prop];
  });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.textContent = editor.value.slice(0, index);
  const marker = document.createElement("span");
  marker.textContent = editor.value.slice(index, index + 1) || " ";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  document.body.removeChild(mirror);
  const editorRect = editor.getBoundingClientRect();
  return {
    left:
      editorRect.left + markerRect.left - mirrorRect.left - editor.scrollLeft,
    top: editorRect.top + markerRect.top - mirrorRect.top - editor.scrollTop,
  };
};

const syncFloatingToolbar = () => {
  const editor = editorRef.value;
  if (!editor) return;
  syncSelectionState();
  if (!hasSelection.value) {
    floatingToolbar.value.visible = false;
    return;
  }
  const point = createMirrorPosition(editor, selectionState.value.end);
  const nextLeft = Math.min(Math.max(point.left, 48), window.innerWidth - 48);
  const nextTop = Math.min(
    Math.max(point.top - 48, 16),
    window.innerHeight - 56,
  );
  floatingToolbar.value = {
    visible: true,
    left: nextLeft,
    top: nextTop,
  };
};

const handleEditorInteraction = () => {
  saveMessage.value = "";
  updateEditorHeight();
  syncFloatingToolbar();
};

const updateEditorHeight = () => {
  const editor = editorRef.value;
  if (!editor) return;
  editor.style.height = "auto";
  const next = Math.max(560, editor.scrollHeight + 2);
  editorHeight.value = next;
};

const syncEditorHeightSoon = () => {
  nextTick(() => {
    updateEditorHeight();
    if (!import.meta.client) return;
    requestAnimationFrame(() => {
      updateEditorHeight();
      requestAnimationFrame(() => {
        updateEditorHeight();
      });
    });
  });
};

const focusEditorSelection = (start: number, end: number) => {
  const editor = editorRef.value;
  if (!editor) return;
  nextTick(() => {
    editor.focus();
    editor.setSelectionRange(start, end);
    syncFloatingToolbar();
  });
};

const insertAtSelection = (snippet: string) => {
  const editor = editorRef.value;
  if (!editor) return;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const value = form.value.content;
  form.value.content = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  const cursor = start + snippet.length;
  focusEditorSelection(cursor, cursor);
};

const replaceSelection = (nextText: string, fallback = "布局内容") => {
  const editor = editorRef.value;
  if (!editor) return;
  const value = form.value.content;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const selected = start === end ? fallback : value.slice(start, end);
  const text = nextText.replace(/\{\{content\}\}/g, selected);
  form.value.content = `${value.slice(0, start)}${text}${value.slice(end)}`;
  focusEditorSelection(start, start + text.length);
};

const extractImageUrls = (text: string) => {
  const source = String(text || "");
  const urls: string[] = [];
  const markdownRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match: RegExpExecArray | null = null;
  while ((match = markdownRegex.exec(source))) {
    const url = String(match[1] || "").trim();
    if (url) urls.push(url);
  }
  while ((match = htmlRegex.exec(source))) {
    const url = String(match[1] || "").trim();
    if (url) urls.push(url);
  }
  return Array.from(new Set(urls));
};

const buildImageGridLayout = (count: 2 | 3) => {
  const selected = selectionState.value.text;
  const urls = extractImageUrls(selected);
  const fallbackUrls =
    count === 2
      ? ["https://example.com/image-1.png", "https://example.com/image-2.png"]
      : [
          "https://example.com/image-1.png",
          "https://example.com/image-2.png",
          "https://example.com/image-3.png",
        ];
  const finalUrls = Array.from(
    { length: count },
    (_, index) => urls[index] || fallbackUrls[index],
  );
  const columns =
    count === 2 ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))";
  return `\n<div class="image-layout image-layout-${count}" style="display:grid;grid-template-columns:${columns};gap:12px;align-items:start;">\n${finalUrls
    .map(
      (url, index) =>
        `  <figure style="margin:0;">\n    <img src="${url}" alt="图片${index + 1}" style="width:100%;display:block;border-radius:10px;" />\n  </figure>`,
    )
    .join("\n")}\n</div>\n`;
};

const isWrappedBy = (
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
) => {
  if (end <= start) return false;
  if (start < prefix.length) return false;
  return (
    value.slice(start - prefix.length, start) === prefix &&
    value.slice(end, end + suffix.length) === suffix
  );
};

const toggleSelectionWrap = (
  prefix: string,
  suffix = prefix,
  emptyText = "文本",
) => {
  const editor = editorRef.value;
  if (!editor) return;
  const value = form.value.content;
  let start = editor.selectionStart || 0;
  let end = editor.selectionEnd || 0;
  if (start === end) {
    const text = emptyText;
    form.value.content = `${value.slice(0, start)}${prefix}${text}${suffix}${value.slice(end)}`;
    const textStart = start + prefix.length;
    focusEditorSelection(textStart, textStart + text.length);
    return;
  }
  const selected = value.slice(start, end);
  if (isWrappedBy(value, start, end, prefix, suffix)) {
    const before = value.slice(0, start - prefix.length);
    const after = value.slice(end + suffix.length);
    form.value.content = `${before}${selected}${after}`;
    start -= prefix.length;
    end -= prefix.length;
    focusEditorSelection(start, end);
    return;
  }
  form.value.content = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
  start += prefix.length;
  end += prefix.length;
  focusEditorSelection(start, end);
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toggleLinePrefix = (prefix: string) => {
  const editor = editorRef.value;
  if (!editor) return;
  const value = form.value.content;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEndPos = value.indexOf("\n", end);
  const lineEnd = lineEndPos === -1 ? value.length : lineEndPos;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const regex = new RegExp(`^${escapeRegExp(prefix)}`);
  const transformed = lines
    .map((line) => (allPrefixed ? line.replace(regex, "") : `${prefix}${line}`))
    .join("\n");
  form.value.content = `${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`;
  const delta = transformed.length - block.length;
  focusEditorSelection(
    start + (allPrefixed ? -prefix.length : prefix.length),
    end + delta,
  );
};

const setEditorNotice = (
  text: string,
  type: "error" | "warning" | "success" = "error",
) => {
  editorNotice.value = {
    text: String(text || "").trim(),
    type,
  };
};

const openToolbarPrompt = (mode: ToolbarPromptMode) => {
  const editor = editorRef.value;
  if (!editor) return;
  toolbarPromptSelection.value = {
    start: editor.selectionStart || 0,
    end: editor.selectionEnd || 0,
  };
  if (mode === "image") {
    toolbarPrompt.value = {
      visible: true,
      mode,
      title: "插入图片",
      hint: "输入图片地址后将生成 Markdown 图片语法。",
      placeholder: "https://example.com/image.png",
      value: "",
    };
  } else if (mode === "link") {
    toolbarPrompt.value = {
      visible: true,
      mode,
      title: "插入链接",
      hint: "输入链接地址后将包裹当前选中文本。",
      placeholder: "https://example.com",
      value: "",
    };
  } else {
    toolbarPrompt.value = {
      visible: true,
      mode,
      title: "选择布局",
      hint: "选择布局类型后会插入对应模板。",
      placeholder: "",
      value: "center",
    };
  }
  nextTick(() => {
    if (toolbarPrompt.value.mode !== "layoutMenu") {
      toolbarPromptInputRef.value?.focus();
      toolbarPromptInputRef.value?.select();
    }
  });
};

const closeToolbarPrompt = () => {
  toolbarPrompt.value.visible = false;
  toolbarPrompt.value.value = "";
  nextTick(() => {
    const editor = editorRef.value;
    if (!editor) return;
    const { start, end } = toolbarPromptSelection.value;
    editor.focus();
    editor.setSelectionRange(start, end);
    syncFloatingToolbar();
  });
};

const submitToolbarPrompt = () => {
  const editor = editorRef.value;
  if (!editor) return;
  const { start, end } = toolbarPromptSelection.value;
  editor.focus();
  editor.setSelectionRange(start, end);
  const mode = toolbarPrompt.value.mode;
  const value = String(toolbarPrompt.value.value || "").trim();
  closeToolbarPrompt();
  if (mode === "image") {
    insertAtSelection(
      `![图片说明](${value || "https://example.com/image.png"})`,
    );
    return;
  }
  if (mode === "link") {
    toggleSelectionWrap(
      "[",
      `](${value || "https://example.com"})`,
      "链接文本",
    );
    return;
  }
  if (mode === "layoutMenu") {
    const normalized = value.toLowerCase();
    if (normalized === "left") return applyToolbar("alignLeft");
    if (normalized === "right") return applyToolbar("alignRight");
    if (normalized === "grid2") return applyToolbar("imageGrid2");
    if (normalized === "grid3") return applyToolbar("imageGrid3");
    if (normalized === "center") return applyToolbar("alignCenter");
    setEditorNotice("布局类型无效，已使用默认居中布局。", "warning");
    return applyToolbar("alignCenter");
  }
};

const isToolbarActive = (key: ToolbarKey) => {
  const editor = editorRef.value;
  if (!editor) return false;
  const start = selectionState.value.start;
  const end = selectionState.value.end;
  const value = form.value.content;
  if (key === "bold") return isWrappedBy(value, start, end, "**", "**");
  if (key === "italic") return isWrappedBy(value, start, end, "*", "*");
  if (key === "underline") return isWrappedBy(value, start, end, "<u>", "</u>");
  if (key === "strike") return isWrappedBy(value, start, end, "~~", "~~");
  if (key === "heimu") {
    return isWrappedBy(value, start, end, '<span class="heimu">', "</span>");
  }
  if (key === "quote" || key === "ul") {
    if (!hasSelection.value) return false;
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEndPos = value.indexOf("\n", end);
    const lineEnd = lineEndPos === -1 ? value.length : lineEndPos;
    const lines = value.slice(lineStart, lineEnd).split("\n");
    return key === "quote"
      ? lines.every((line) => line.startsWith("> "))
      : lines.every((line) => line.startsWith("- "));
  }
  return false;
};

const applyToolbar = (key: ToolbarKey) => {
  if (key === "bold") return toggleSelectionWrap("**");
  if (key === "italic") return toggleSelectionWrap("*");
  if (key === "underline") return toggleSelectionWrap("<u>", "</u>");
  if (key === "strike") return toggleSelectionWrap("~~");
  if (key === "quote") return toggleLinePrefix("> ");
  if (key === "heimu")
    return toggleSelectionWrap('<span class="heimu">', "</span>");
  if (key === "ul") return toggleLinePrefix("- ");
  if (key === "code")
    return toggleSelectionWrap("\n```markdown\n", "\n```\n", "代码内容");
  if (key === "image") {
    return openToolbarPrompt("image");
  }
  if (key === "link") {
    return openToolbarPrompt("link");
  }
  if (key === "math") return insertAtSelection("\n$$\na^2+b^2=c^2\n$$\n");
  if (key === "custom") return insertAtSelection("\n:::info\n提示内容\n:::\n");
  if (key === "divider") return insertAtSelection("\n---\n");
  if (key === "layoutMenu") {
    return openToolbarPrompt("layoutMenu");
  }
  if (key === "alignLeft") {
    return replaceSelection('<div style="text-align:left;">{{content}}</div>');
  }
  if (key === "alignCenter") {
    return replaceSelection(
      '<div style="text-align:center;">{{content}}</div>',
    );
  }
  if (key === "alignRight") {
    return replaceSelection('<div style="text-align:right;">{{content}}</div>');
  }
  if (key === "imageGrid2") return insertAtSelection(buildImageGridLayout(2));
  if (key === "imageGrid3") return insertAtSelection(buildImageGridLayout(3));
  if (key === "imageCenter")
    return toggleSelectionWrap('<div class="text-center">', "</div>");
  if (key === "imageCaption")
    return insertAtSelection("\n<figcaption>图片说明</figcaption>\n");
};

const handleEditorKeydown = (event: KeyboardEvent) => {
  if (event.isComposing) return;
  const isModifier = event.ctrlKey || event.metaKey;
  if (!isModifier) return;
  const key = event.key.toLowerCase();
  if (key === "s") {
    event.preventDefault();
    if (!isSaving.value) {
      void savePost();
    }
    return;
  }
  if (key === "b") {
    event.preventDefault();
    applyToolbar("bold");
    return;
  }
  if (key === "i") {
    event.preventDefault();
    applyToolbar("italic");
    return;
  }
  if (key === "k") {
    event.preventDefault();
    applyToolbar("link");
    return;
  }
  if (event.shiftKey && key === "x") {
    event.preventDefault();
    applyToolbar("strike");
    return;
  }
  if (event.shiftKey && key === "l") {
    event.preventDefault();
    applyToolbar("layoutMenu");
  }
};

const handlePageKeydown = (event: KeyboardEvent) => {
  if (event.isComposing) return;
  const isModifier = event.ctrlKey || event.metaKey;
  if (!isModifier) return;
  if (event.key.toLowerCase() !== "s") return;
  event.preventDefault();
  if (!isSaving.value) {
    void savePost();
  }
};

const loadPost = async () => {
  if (isCreateMode.value) {
    pendingCreateId.value = String(Date.now());
    form.value = createDefaultForm();
    applyAutoSlug();
    selectedTags.value = [];
    editorComments.value = [];
    saveMessage.value = "";
    nextTick(syncFloatingToolbar);
    return;
  }
  try {
    const result = (await $fetch(
      withApiBase(`/api/admin/posts/${postId.value}`),
      {
        credentials: "include",
      },
    )) as any;
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
      slugMode: inferSlugMode(
        String(post.slug || ""),
        String(post.title || ""),
        String(post.id || postId.value),
      ),
      publishStatus: normalizePublishStatus(post),
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
      articleType:
        (String(post.articleType || "original") as any) || "original",
      sourceUrl: String(post.sourceUrl || ""),
      licenseCc: String(post.license?.cc || ""),
    };
    selectedTags.value = Array.isArray(post.tags)
      ? post.tags.map((item: any) => String(item || "").trim()).filter(Boolean)
      : [];
    selectedTags.value.forEach((tag) => {
      if (!allTags.value.includes(tag)) allTags.value.unshift(tag);
    });
    await loadEditorComments();
    nextTick(syncFloatingToolbar);
  } catch (error: any) {
    setEditorNotice(parseError(error), "error");
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
    const result = (await $fetch(withApiBase("/api/comments/upload"), {
      method: "POST",
      credentials: "include",
      body: formData,
    })) as any;
    const url = String(result?.data?.url || result?.url || "").trim();
    if (url) form.value.coverImage = url;
    else setEditorNotice("上传成功但未返回封面链接", "warning");
  } catch (error: any) {
    setEditorNotice(parseError(error), "error");
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
  saveMessage.value = "";
  const authors = form.value.authors
    .map((item) => ({
      name: String(item.name || "").trim(),
      socialUrl: String(item.socialUrl || "").trim(),
    }))
    .filter((item) => item.name);
  const finalAuthors = authors.length
    ? authors
    : [{ name: "nanoic39", socialUrl: "" }];
  const payload: Record<string, any> = {
    title: form.value.title,
    slug: form.value.slug,
    status: form.value.publishStatus,
    publishStatus: form.value.publishStatus,
    isDraft: form.value.publishStatus === "draft",
    published: form.value.publishStatus === "published",
    description: form.value.description,
    author: finalAuthors.map((item) => item.name).join(" / "),
    authors: finalAuthors,
    coverImage: form.value.coverImage,
    content: form.value.content,
    tags: selectedTags.value,
    isPinned: form.value.isPinned,
    articleType: form.value.articleType,
    sourceUrl:
      form.value.articleType === "translation" ||
      form.value.articleType === "repost"
        ? form.value.sourceUrl
        : "",
    license: form.value.licenseCc
      ? {
          cc: form.value.licenseCc,
          icon: createLicenseIcons(form.value.licenseCc),
        }
      : undefined,
    slugType: form.value.slugMode,
  };
  if (isCreateMode.value && form.value.slugMode === "id") {
    payload.id = pendingCreateId.value;
    payload.slug = pendingCreateId.value;
  }
  try {
    if (isCreateMode.value) {
      const result = (await $fetch(withApiBase("/api/admin/posts"), {
        method: "POST",
        credentials: "include",
        body: payload,
      })) as any;
      const createdId = String(result?.data?.id || result?.id || "").trim();
      if (createdId) {
        if (form.value.slugMode === "id" && payload.slug !== createdId) {
          await $fetch(withApiBase(`/api/admin/posts/${createdId}`), {
            method: "PUT",
            credentials: "include",
            body: {
              ...payload,
              id: createdId,
              slug: createdId,
            },
          });
        }
        saveMessage.value = "文章已保存，已进入编辑状态";
        await router.replace(`/admin/dashboard/posts/${createdId}`);
      } else {
        saveMessage.value = "文章已保存";
      }
    } else {
      await $fetch(withApiBase(`/api/admin/posts/${postId.value}`), {
        method: "PUT",
        credentials: "include",
        body: payload,
      });
      saveMessage.value = "文章已保存";
      await loadPost();
    }
  } catch (error: any) {
    setEditorNotice(parseError(error), "error");
  } finally {
    isSaving.value = false;
  }
};

const handleWindowSelectionSync = () => {
  if (!floatingToolbar.value.visible) return;
  syncFloatingToolbar();
};

onMounted(async () => {
  await Promise.all([loadTags(), loadMyImages()]);
  await loadPost();
  window.addEventListener("keydown", handlePageKeydown);
  window.addEventListener("resize", handleWindowSelectionSync);
  window.addEventListener("scroll", handleWindowSelectionSync, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handlePageKeydown);
  window.removeEventListener("resize", handleWindowSelectionSync);
  window.removeEventListener("scroll", handleWindowSelectionSync, true);
});

watch(
  () => [
    form.value.title,
    form.value.slugMode,
    postId.value,
    isCreateMode.value,
  ],
  () => {
    applyAutoSlug();
  },
);

watch(
  () => route.params.id,
  async () => {
    await loadPost();
  },
);

watch(
  () => form.value.content,
  () => {
    syncEditorHeightSoon();
  },
);
</script>

<style>
.custom-prose .code-block-header {
  border-radius: 0;
}

.custom-prose .code-lines {
  display: block;
  white-space: pre;
}

.custom-prose .code-line {
  display: block;
  line-height: 1.7;
}

.custom-prose .line-number {
  line-height: 1.7;
}

.custom-prose .table-container {
  width: 100%;
  margin: 1.5rem 0;
}

.custom-prose .table-wrapper {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
}
</style>
