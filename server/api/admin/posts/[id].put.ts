import { createError, readBody } from "h3";
import {
  computeWordCountFromContent,
  type PostItem,
  readPostsStore,
  savePostsStore,
} from "../../../utils/posts-store";
import { requireAdmin } from "../../../utils/session";

type UpdatePostBody = Partial<PostItem> & {
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

const extractTitleFromContent = (content: string) => {
  const line = String(content || "")
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith("# "));
  return line ? line.replace(/^#\s+/, "").trim() : "";
};

const extractDescription = (content: string) => {
  const plain = String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_\-\[\]\(\)!~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 140);
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "缺少文章 ID" });
  }

  const body = (await readBody(event)) as UpdatePostBody | null;
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "请求体格式无效" });
  }

  const store = await readPostsStore();
  const sourceList = [...store.pinned, ...store.regular];
  const current = sourceList.find((item) => item.id === id);
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "文章不存在" });
  }

  const content = String(body.content ?? current.content ?? "");
  const fallbackTitle = extractTitleFromContent(content);
  const title = String(body.title ?? current.title ?? fallbackTitle).trim();
  const description = String(
    body.description ?? current.description ?? extractDescription(content),
  ).trim();
  const slug = sanitizeSlug(String(body.slug ?? current.slug));
  const author = String(body.author ?? current.author).trim();
  const coverImage = String(body.coverImage ?? current.coverImage).trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((item) => String(item).trim()).filter(Boolean)
    : current.tags;
  const isPinned =
    typeof body.isPinned === "boolean"
      ? body.isPinned
      : store.pinned.some((item) => item.id === id);

  if (!title || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "title、slug 不能为空",
    });
  }

  const duplicate = sourceList.find((item) => item.slug === slug && item.id !== id);
  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: "slug 已存在，请更换",
    });
  }

  const updated: PostItem = {
    ...current,
    title,
    description,
    slug,
    author,
    coverImage,
    tags,
    content,
    wordCount: computeWordCountFromContent(content),
    views: current.views,
  };

  const pinned = store.pinned.filter((item) => item.id !== id);
  const regular = store.regular.filter((item) => item.id !== id);
  if (isPinned) pinned.unshift(updated);
  else regular.unshift(updated);

  await savePostsStore({ pinned, regular });
  return { success: true, data: { ...updated, isPinned } };
});
