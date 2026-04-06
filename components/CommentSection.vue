<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useHeadImage } from "~/composables/useHeadImage";
const adminAvatarImg = useHeadImage();

const props = defineProps<{
  articleId: string | number;
}>();

const { user, login } = useAuth();
const config = useRuntimeConfig();
const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
};
const yunaApiBaseUrl = String(config.public.oauthApiBaseUrl || "").replace(
  /\/+$/,
  "",
);

interface Reply {
  id: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  images?: string[];
  createdAt: number;
  isAdmin?: boolean;
  replyTo?: string;
  replyToUserId?: string;
}

interface Comment {
  id: string;
  articleId: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  images?: string[];
  createdAt: number;
  isAdmin?: boolean;
  replies: Reply[];
}

const comments = ref<Comment[]>([]);
const newCommentContent = ref("");
const isSubmitting = ref(false);
const replyTargetId = ref<string | null>(null); // null means replying to article
const replyTargetAuthor = ref<string>("");
const replyContent = ref("");
const newCommentImages = ref<string[]>([]);
const replyImages = ref<string[]>([]);
const isUploadingImage = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadTargetIsReply = ref(false);

const normalizeTimestamp = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
};

const resolveCommentAvatar = (avatar?: string) => {
  const raw = String(avatar || "").trim();
  if (!raw) return getAvatarUrl("user");
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
};

const resolveCurrentUserAvatar = () => {
  const picture = String((user.value as any)?.picture || "").trim();
  if (!picture)
    return getAvatarUrl(String((user.value as any)?.name || "User"));
  if (picture.startsWith("data:")) {
    return picture;
  }
  return "/api/auth/avatar";
};

const resolveAssetUrl = (url?: string) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  if (raw.startsWith("/api/file/")) {
    return yunaApiBaseUrl ? `${yunaApiBaseUrl}${raw}` : raw;
  }
  if (raw.startsWith("/file/")) {
    return yunaApiBaseUrl ? `${yunaApiBaseUrl}/api${raw}` : raw;
  }
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
};

const normalizeImages = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === "string") return resolveAssetUrl(item);
      if (item && typeof item === "object") {
        return resolveAssetUrl(
          item.url || item.fileUrl || item.path || item.src || item.downloadUrl,
        );
      }
      return "";
    })
    .filter(Boolean);
};

const normalizeReply = (raw: any): Reply => ({
  id: String(raw?.id || raw?._id || Date.now()),
  authorId: raw?.authorId || raw?.userId || raw?.author?.id,
  author: String(raw?.author || raw?.authorName || raw?.user?.name || "用户"),
  avatar: resolveCommentAvatar(
    raw?.avatar || raw?.authorAvatar || raw?.user?.avatar || raw?.user?.picture,
  ),
  content: String(raw?.content || ""),
  images: normalizeImages(raw?.images || raw?.imageList || raw?.attachments),
  createdAt: normalizeTimestamp(
    raw?.createdAt || raw?.createTime || raw?.created_at,
  ),
  isAdmin: Boolean(
    raw?.isAdmin || raw?.role === "admin" || raw?.authorRole === "admin",
  ),
  replyTo: raw?.replyTo || raw?.replyToName || raw?.replyToUserName,
  replyToUserId: raw?.replyToUserId,
});

const normalizeComment = (raw: any): Comment => ({
  id: String(raw?.id || raw?._id || Date.now()),
  articleId: String(raw?.articleId || raw?.postId || props.articleId),
  authorId: raw?.authorId || raw?.userId || raw?.author?.id,
  author: String(raw?.author || raw?.authorName || raw?.user?.name || "用户"),
  avatar: resolveCommentAvatar(
    raw?.avatar || raw?.authorAvatar || raw?.user?.avatar || raw?.user?.picture,
  ),
  content: String(raw?.content || ""),
  images: normalizeImages(raw?.images || raw?.imageList || raw?.attachments),
  createdAt: normalizeTimestamp(
    raw?.createdAt || raw?.createTime || raw?.created_at,
  ),
  isAdmin: Boolean(
    raw?.isAdmin || raw?.role === "admin" || raw?.authorRole === "admin",
  ),
  replies: Array.isArray(raw?.replies)
    ? raw.replies.map((reply: any) => normalizeReply(reply))
    : [],
});

const fetchComments = async () => {
  try {
    const payload = await $fetch<any>(withApiBase("/api/comments"), {
      credentials: "include",
      query: { articleId: props.articleId },
    });
    if (Array.isArray(payload)) {
      comments.value = payload.map((item) => normalizeComment(item));
      return;
    }
    if (Array.isArray(payload?.data)) {
      comments.value = payload.data.map((item: any) => normalizeComment(item));
      return;
    }
    if (Array.isArray(payload?.comments)) {
      comments.value = payload.comments.map((item: any) =>
        normalizeComment(item),
      );
      return;
    }
    comments.value = [];
  } catch (error) {
    console.error("Failed to load comments:", error);
  }
};

onMounted(() => {
  fetchComments();
});

watch(
  () => props.articleId,
  () => {
    fetchComments();
  },
);

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

const openReply = (commentId: string, author: string) => {
  replyTargetId.value = commentId;
  replyTargetAuthor.value = author;
  replyContent.value = "";
  replyImages.value = [];
};

const cancelReply = () => {
  replyTargetId.value = null;
  replyTargetAuthor.value = "";
  replyContent.value = "";
  replyImages.value = [];
};

const removeImage = (url: string, isReply: boolean) => {
  if (isReply) {
    replyImages.value = replyImages.value.filter((item) => item !== url);
    return;
  }
  newCommentImages.value = newCommentImages.value.filter(
    (item) => item !== url,
  );
};

const openUploadPicker = (isReply: boolean = false) => {
  if (!user.value) {
    alert("请先登录后再上传图片。");
    return;
  }
  uploadTargetIsReply.value = isReply;
  fileInputRef.value?.click();
};

const handleImageSelected = async (event: Event, isReply: boolean) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  target.value = "";
  if (!files.length) return;
  if (!user.value) {
    alert("请先登录后再上传图片。");
    return;
  }

  const currentImages = isReply ? replyImages.value : newCommentImages.value;
  if (currentImages.length >= 9) {
    alert("最多上传 9 张图片。");
    return;
  }

  isUploadingImage.value = true;
  try {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("仅支持上传图片文件。");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("单张图片大小不能超过 5MB。");
        continue;
      }

      if ((isReply ? replyImages.value : newCommentImages.value).length >= 9) {
        break;
      }

      const formData = new FormData();
      formData.append("file", file);
      const uploadApi = withApiBase("/api/comments/upload") as string;
      const result = await $fetch(uploadApi, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadedUrl = String(
        (result as any)?.data?.url || (result as any)?.url || "",
      ).trim();
      if (!uploadedUrl) {
        alert("图片上传成功，但未返回可用地址。");
        continue;
      }
      if (isReply) {
        replyImages.value = [...replyImages.value, uploadedUrl];
      } else {
        newCommentImages.value = [...newCommentImages.value, uploadedUrl];
      }
    }
  } catch (error: any) {
    alert(
      error?.data?.message ||
        error?.statusMessage ||
        "图片上传失败，请稍后重试",
    );
  } finally {
    isUploadingImage.value = false;
  }
};

const submitComment = async (
  isReply: boolean = false,
  parentId: string | null = null,
) => {
  const content = isReply ? replyContent.value : newCommentContent.value;
  const images = isReply ? replyImages.value : newCommentImages.value;

  if (!content.trim() && images.length === 0) return;

  isSubmitting.value = true;
  try {
    if (isReply && parentId) {
      const parentComment = comments.value.find((c) => c.id === parentId);
      const targetReply = parentComment?.replies?.find(
        (r) => r.author === replyTargetAuthor.value,
      );
      const replyToUserId = String(
        targetReply?.authorId || parentComment?.authorId || "",
      ).trim();

      const replyApi = withApiBase(`/api/comments/${parentId}/reply`) as string;
      await $fetch(replyApi, {
        method: "POST",
        credentials: "include",
        body: {
          content: content.trim(),
          replyToUserId: replyToUserId || undefined,
          images,
        },
      });
      cancelReply();
    } else {
      const commentsApi = withApiBase("/api/comments") as string;
      await $fetch(commentsApi, {
        method: "POST",
        credentials: "include",
        body: {
          articleId: String(props.articleId),
          content: content.trim(),
          images,
        },
      });
      newCommentContent.value = "";
      newCommentImages.value = [];
    }
    await fetchComments();
  } catch (error: any) {
    alert(
      error?.data?.message || error?.statusMessage || "提交失败，请稍后重试",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const handleTextareaInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
};
</script>

<template>
  <div
    class="mt-12 bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-sm border border-transparent dark:border-[#333333] transition-colors duration-300"
  >
    <h3
      class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6 text-[#0284C7] dark:text-[#38bdf8]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      评论区 ({{
        comments.length +
        comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)
      }})
    </h3>

    <!-- 发布新评论区域 -->
    <div
      class="mb-10 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50"
    >
      <div
        v-if="!user"
        class="mb-4 rounded-lg border border-yellow-200/70 bg-yellow-50/70 px-4 py-2 text-sm text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-900/20 dark:text-yellow-300"
      >
        当前支持匿名评论，登录后可自动带出昵称与头像。
      </div>

      <div class="relative">
        <textarea
          v-model="newCommentContent"
          @input="(e) => handleTextareaInput(e)"
          rows="3"
          placeholder="写下你的评论吧..."
          class="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/50 resize-none transition-all"
        ></textarea>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="(e) => handleImageSelected(e, uploadTargetIsReply)"
        />
        <div
          v-if="newCommentImages.length > 0"
          class="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2"
        >
          <div
            v-for="img in newCommentImages"
            :key="img"
            class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <img
              :src="img"
              class="w-full h-20 object-cover"
              alt="uploaded-image"
            />
            <button
              @click="removeImage(img, false)"
              class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <span v-if="user" class="flex items-center gap-2">
              <img
                :src="
                  user.isAdmin ? adminAvatarImg : resolveCurrentUserAvatar()
                "
                class="w-6 h-6 rounded-full object-cover"
              />
              以
              <span class="font-medium text-[#0284C7] dark:text-[#38bdf8]">{{
                user.name
              }}</span>
              身份评论
            </span>
            <span v-else class="flex items-center gap-2">
              匿名身份评论
              <button @click="login" class="text-[#0284C7] hover:underline">
                去登录
              </button>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="openUploadPicker(false)"
              :disabled="isUploadingImage || !user"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:border-[#0284C7] hover:text-[#0284C7] disabled:opacity-50 transition-colors"
            >
              {{ isUploadingImage ? "上传中..." : "上传图片" }}
            </button>
            <button
              @click="submitComment(false)"
              :disabled="
                isSubmitting ||
                (!newCommentContent.trim() && newCommentImages.length === 0)
              "
              class="px-6 py-2 bg-[#0284C7] hover:bg-[#0369a1] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {{ isSubmitting ? "发送中..." : "发表评论" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="space-y-8">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-4">
        <!-- 评论者头像 -->
        <img
          :src="
            comment.isAdmin
              ? adminAvatarImg
              : resolveCommentAvatar(comment.avatar)
          "
          class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 object-cover"
          alt="avatar"
        />

        <div class="flex-1 min-w-0">
          <!-- 评论主内容 -->
          <div class="mb-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-gray-800 dark:text-gray-200">{{
                comment.author
              }}</span>
              <span
                v-if="comment.isAdmin"
                class="px-1.5 py-0.5 rounded bg-[#0284C7]/10 text-[#0284C7] dark:text-[#38bdf8] text-xs font-medium border border-[#0284C7]/20"
                >站长</span
              >
              <span class="text-xs text-gray-400 dark:text-gray-500">{{
                formatDate(comment.createdAt)
              }}</span>
            </div>
            <p
              class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
            >
              {{ comment.content }}
            </p>
            <div
              v-if="comment.images && comment.images.length > 0"
              class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2"
            >
              <a
                v-for="img in comment.images"
                :key="img"
                :href="img"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img
                  :src="img"
                  class="w-full h-28 object-cover"
                  alt="comment-image"
                />
              </a>
            </div>
            <div class="mt-2">
              <button
                @click="openReply(comment.id, comment.author)"
                class="text-sm text-gray-500 hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors flex items-center gap-1"
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
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                回复
              </button>
            </div>
          </div>

          <!-- 回复输入框 (针对当前主评论) -->
          <div
            v-if="replyTargetId === comment.id"
            class="mt-4 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
          >
            <div
              class="text-sm text-gray-600 dark:text-gray-400 mb-2 flex justify-between"
            >
              <span
                >回复
                <span class="font-medium text-[#0284C7]">{{
                  replyTargetAuthor
                }}</span
                >：</span
              >
              <button
                @click="cancelReply"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                取消
              </button>
            </div>

            <div
              v-if="!user"
              class="mb-3 rounded-lg border border-yellow-200/70 bg-yellow-50/70 px-3 py-2 text-xs text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-900/20 dark:text-yellow-300"
            >
              登录后可回复评论。
            </div>

            <textarea
              v-model="replyContent"
              @input="(e) => handleTextareaInput(e)"
              rows="2"
              placeholder="写下你的回复（支持附图）..."
              class="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7] resize-none"
            ></textarea>
            <div
              v-if="replyImages.length > 0"
              class="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2"
            >
              <div
                v-for="img in replyImages"
                :key="img"
                class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img
                  :src="img"
                  class="w-full h-16 object-cover"
                  alt="reply-image"
                />
                <button
                  @click="removeImage(img, true)"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="mt-2 flex items-center justify-end gap-2">
              <button
                @click="openUploadPicker(true)"
                :disabled="isUploadingImage || !user"
                class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:border-[#0284C7] hover:text-[#0284C7] disabled:opacity-50 transition-colors"
              >
                {{ isUploadingImage ? "上传中..." : "上传图片" }}
              </button>
              <button
                @click="submitComment(true, comment.id)"
                :disabled="
                  isSubmitting ||
                  (!replyContent.trim() && replyImages.length === 0) ||
                  !user
                "
                class="px-4 py-1.5 bg-[#0284C7] hover:bg-[#0369a1] disabled:bg-gray-400 text-white text-sm rounded-lg font-medium transition-colors"
              >
                回复
              </button>
            </div>
          </div>

          <!-- 子回复列表 -->
          <div
            v-if="comment.replies && comment.replies.length > 0"
            class="mt-4 space-y-4"
          >
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="flex gap-3"
            >
              <img
                :src="
                  reply.isAdmin
                    ? adminAvatarImg
                    : resolveCommentAvatar(reply.avatar)
                "
                class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 object-cover"
                alt="avatar"
              />
              <div
                class="flex-1 min-w-0 bg-gray-50/80 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50"
              >
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    class="font-medium text-sm text-gray-800 dark:text-gray-200"
                    >{{ reply.author }}</span
                  >
                  <span
                    v-if="reply.isAdmin"
                    class="px-1 py-0.5 rounded bg-[#0284C7]/10 text-[#0284C7] dark:text-[#38bdf8] text-[10px] font-medium border border-[#0284C7]/20"
                    >站长</span
                  >
                  <span
                    v-if="reply.replyTo"
                    class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {{ reply.replyTo }}
                  </span>
                  <span
                    class="text-xs text-gray-400 dark:text-gray-500 ml-auto"
                    >{{ formatDate(reply.createdAt) }}</span
                  >
                </div>
                <p
                  class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                >
                  {{ reply.content }}
                </p>
                <div
                  v-if="reply.images && reply.images.length > 0"
                  class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2"
                >
                  <a
                    v-for="img in reply.images"
                    :key="img"
                    :href="img"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      :src="img"
                      class="w-full h-24 object-cover"
                      alt="reply-image"
                    />
                  </a>
                </div>
                <div class="mt-1.5">
                  <button
                    @click="openReply(comment.id, reply.author)"
                    class="text-xs text-gray-500 hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors"
                  >
                    回复
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="comments.length === 0"
        class="text-center py-10 text-gray-500 dark:text-gray-400"
      >
        暂无评论，快来抢沙发吧！
      </div>
    </div>
  </div>
</template>
