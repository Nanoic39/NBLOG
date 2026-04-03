import { createError, readBody } from "h3";
import {
  computeWordCountFromContent,
  getStableCoverById,
  type PostItem,
  readPostsStore,
  savePostsStore,
} from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

type CreatePostBody = Partial<PostItem> & {
  isPinned?: boolean;
};

const normalizeAuthors = (raw: unknown, fallback: string) => {
  if (!Array.isArray(raw)) {
    const name = String(fallback || "nanoic39").trim();
    return [{ name: name || "nanoic39" }];
  }
  const list = raw
    .map((item) => {
      const name = String((item as any)?.name || "").trim();
      const socialUrl = String((item as any)?.socialUrl || "").trim();
      if (!name) return null;
      return socialUrl ? { name, socialUrl } : { name };
    })
    .filter(Boolean) as Array<{ name: string; socialUrl?: string }>;
  if (list.length) return list;
  const name = String(fallback || "nanoic39").trim();
  return [{ name: name || "nanoic39" }];
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
  const body = (await readBody(event)) as CreatePostBody | null;
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "请求体格式无效" });
  }

  const content = String(body.content || "").trim();
  const fallbackTitle = extractTitleFromContent(content);
  const title = String(body.title || fallbackTitle || `未命名文章-${Date.now()}`).trim();
  const description = String(body.description || extractDescription(content)).trim();
  const slugInput = String(body.slug || "").trim();
  const slug = sanitizeSlug(slugInput || title);
  const author = String(body.author || "nanoic39").trim();
  const requestedCoverImage = String(body.coverImage || "").trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const articleTypeRaw = String(body.articleType || "original").trim().toLowerCase();
  const articleType: PostItem["articleType"] = ["original", "co-original", "translation", "repost"].includes(
    articleTypeRaw,
  )
    ? (articleTypeRaw as PostItem["articleType"])
    : "original";
  const sourceUrl = String(body.sourceUrl || "").trim();
  const authors = normalizeAuthors(body.authors, author);
  const licenseRaw = (body.license || {}) as Record<string, any>;
  const licenseCc = String(licenseRaw.cc || "").trim();
  const licenseIcons = Array.isArray(licenseRaw.icon)
    ? licenseRaw.icon.map((item: any) => String(item || "").trim()).filter(Boolean)
    : [];
  const isPinned = Boolean(body.isPinned);

  if (!title || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "title、slug 为必填项",
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

  const postId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const newPost: PostItem = {
    id: postId,
    title,
    slug,
    description,
    pubDate: String(Math.floor(Date.now() / 1000)),
    author: authors.map((item) => item.name).join(" / "),
    authors,
    tags,
    coverImage: requestedCoverImage || getStableCoverById(postId),
    articleType,
    sourceUrl:
      articleType === "translation" || articleType === "repost"
        ? sourceUrl
        : "",
    license:
      licenseCc || licenseIcons.length
        ? {
            ...(licenseCc ? { cc: licenseCc } : {}),
            ...(licenseIcons.length ? { icon: licenseIcons } : {}),
          }
        : undefined,
    content,
    wordCount: computeWordCountFromContent(content),
    views: 0,
  };

  if (isPinned) {
    store.pinned.unshift(newPost);
  } else {
    store.regular.unshift(newPost);
  }

  await savePostsStore(store);
  return { success: true, data: { ...newPost, isPinned } };
});
