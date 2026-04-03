import { getHeader, getRequestURL } from "h3";
import { readDoing } from "../../utils/doing-store";
import { readNotice } from "../../utils/notice-store";
import { readPostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

type AdminCommentItem = {
  id: string;
  articleId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: number;
  postTitle?: string;
  postSlug?: string;
};

const normalizeTimestamp = (value: unknown) => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return Date.now();
  return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
};

const normalizeComment = (raw: any): AdminCommentItem => ({
  id: String(raw?.id || raw?._id || ""),
  articleId: String(raw?.articleId || raw?.postId || ""),
  authorId: String(raw?.authorId || raw?.userId || raw?.author?.id || ""),
  author: String(raw?.author || raw?.authorName || raw?.user?.name || "用户"),
  content: String(raw?.content || ""),
  createdAt: normalizeTimestamp(raw?.createdAt || raw?.createTime || raw?.created_at),
});

const fetchLatestComments = async (event: any): Promise<AdminCommentItem[]> => {
  try {
    const origin = getRequestURL(event).origin;
    const cookie = String(getHeader(event, "cookie") || "");
    const payload = (await $fetch("/api/comments", {
      baseURL: origin,
      headers: cookie ? { cookie } : undefined,
      query: { page: 1, size: 20 },
    })) as any;
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.comments)
          ? payload.comments
          : [];
    return list
      .map((item: any) => normalizeComment(item))
      .filter((item: AdminCommentItem) => item.id)
      .sort((a: AdminCommentItem, b: AdminCommentItem) => b.createdAt - a.createdAt)
      .slice(0, 20);
  } catch {
    return [];
  }
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const [doing, notice, posts, latestComments] = await Promise.all([
    readDoing(),
    readNotice(),
    readPostsStore(),
    fetchLatestComments(event),
  ]);
  const allPosts = [...posts.pinned, ...posts.regular];
  const totalViews = allPosts.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const tagTotal = new Set(allPosts.flatMap((item) => item.tags || [])).size;

  const dayBuckets = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    return {
      key,
      label: `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      posts: 0,
      views: 0,
    };
  });
  const dayMap = new Map(dayBuckets.map((item) => [item.key, item]));
  allPosts.forEach((post) => {
    const ts = normalizeTimestamp(post.pubDate);
    const date = new Date(ts);
    date.setHours(0, 0, 0, 0);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    const bucket = dayMap.get(key);
    if (!bucket) return;
    bucket.posts += 1;
    bucket.views += Number(post.views || 0);
  });

  const hotPosts = [...allPosts]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      views: Number(item.views || 0),
      wordCount: Number(item.wordCount || 0),
      isPinned: posts.pinned.some((post) => post.id === item.id),
    }));
  const postMap = new Map(
    allPosts.map((item) => [String(item.id), { title: item.title, slug: item.slug }]),
  );
  const latestCommentsWithPost = latestComments.map((item) => {
    const post = postMap.get(String(item.articleId));
    return {
      ...item,
      postTitle: post?.title,
      postSlug: post?.slug,
    };
  });

  return {
    doing,
    notice: {
      theme: notice.theme,
      title: notice.title,
      content: notice.content,
      active: notice.active,
    },
    stats: {
      postTotal: allPosts.length,
      pinnedTotal: posts.pinned.length,
      regularTotal: posts.regular.length,
      tagTotal,
      totalViews,
      commentTotal: latestCommentsWithPost.length,
    },
    analysis30d: dayBuckets,
    latestComments: latestCommentsWithPost,
    hotPosts,
  };
});
