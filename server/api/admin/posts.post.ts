import { createError, readBody } from "h3";
import { type PostItem, readPostsStore, savePostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

type CreatePostBody = Partial<PostItem> & {
  isPinned?: boolean;
};

const sanitizeSlug = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = (await readBody(event)) as CreatePostBody | null;
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "请求体格式无效" });
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const slugInput = String(body.slug || "").trim();
  const slug = sanitizeSlug(slugInput || title);
  const author = String(body.author || "nanoic39").trim();
  const coverImage = String(body.coverImage || "").trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const wordCount = Number(body.wordCount || 0);
  const views = Number(body.views || 0);
  const isPinned = Boolean(body.isPinned);

  if (!title || !description || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "title、description、slug 为必填项",
    });
  }

  const store = await readPostsStore();
  const exists = [...store.pinned, ...store.regular].some((item) => item.slug === slug);
  if (exists) {
    throw createError({
      statusCode: 409,
      statusMessage: "slug 已存在，请更换",
    });
  }

  const newPost: PostItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    slug,
    description,
    pubDate: String(Math.floor(Date.now() / 1000)),
    author,
    tags,
    coverImage,
    wordCount: Number.isFinite(wordCount) ? Math.max(0, wordCount) : 0,
    views: Number.isFinite(views) ? Math.max(0, views) : 0,
  };

  if (isPinned) {
    store.pinned.unshift(newPost);
  } else {
    store.regular.unshift(newPost);
  }

  await savePostsStore(store);
  return { success: true, data: { ...newPost, isPinned } };
});
