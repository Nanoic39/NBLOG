import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  author: string;
  authors?: Array<{
    name: string;
    socialUrl?: string;
  }>;
  tags: string[];
  coverImage: string;
  articleType?: "original" | "co-original" | "translation" | "repost";
  sourceUrl?: string;
  license?: {
    cc?: string;
    icon?: string[];
  };
  content: string;
  wordCount: number;
  views: number;
};

export const getStableCoverById = (id: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(String(id || "post"))}`;

type PostsStorePayload = {
  regular: PostItem[];
  pinned: PostItem[];
};

const getDataDir = () =>
  process.env.NBLOG_DATA_DIR || path.join(process.cwd(), ".data", "nblog");

const getPostsFilePath = () => path.join(getDataDir(), "posts.json");

const ensureDataDir = async () => {
  await mkdir(getDataDir(), { recursive: true });
};

export const computeWordCountFromContent = (content: string): number => {
  const text = String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_\-\[\]\(\)!~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.length : 0;
};

const normalizePost = (raw: Partial<PostItem>): PostItem => {
  const normalizedId = String(raw.id || Date.now());
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];
  const content = String(raw.content || "");
  const authors = Array.isArray(raw.authors)
    ? raw.authors
        .map((item) => {
          if (!item) return null;
          const name = String((item as any).name || "").trim();
          const socialUrl = String((item as any).socialUrl || "").trim();
          if (!name) return null;
          return socialUrl ? { name, socialUrl } : { name };
        })
        .filter(Boolean) as Array<{ name: string; socialUrl?: string }>
    : [];
  const fallbackAuthor = String(raw.author || "").trim();
  const normalizedAuthors = authors.length
    ? authors
    : fallbackAuthor
      ? [{ name: fallbackAuthor }]
      : [{ name: "nanoic39" }];
  const articleTypeRaw = String(raw.articleType || "original").trim().toLowerCase();
  const articleType: PostItem["articleType"] = ["original", "co-original", "translation", "repost"].includes(
    articleTypeRaw,
  )
    ? (articleTypeRaw as PostItem["articleType"])
    : "original";
  const sourceUrl = String(raw.sourceUrl || "").trim();
  const licenseRaw = (raw.license || {}) as Record<string, any>;
  const licenseCc = String(licenseRaw.cc || "").trim();
  const licenseIcons = Array.isArray(licenseRaw.icon)
    ? licenseRaw.icon.map((item: any) => String(item || "").trim()).filter(Boolean)
    : [];
  const wordCount =
    typeof raw.wordCount === "number" && Number.isFinite(raw.wordCount)
      ? raw.wordCount
      : computeWordCountFromContent(content);

  return {
    id: normalizedId,
    title: String(raw.title || ""),
    slug: String(raw.slug || ""),
    description: String(raw.description || ""),
    pubDate: String(raw.pubDate || Math.floor(Date.now() / 1000)),
    author: normalizedAuthors.map((item) => item.name).join(" / "),
    authors: normalizedAuthors,
    tags,
    coverImage: String(raw.coverImage || getStableCoverById(normalizedId)),
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
    wordCount: Math.max(0, wordCount),
    views:
      typeof raw.views === "number" && Number.isFinite(raw.views) ? raw.views : 0,
  };
};

const normalizeStore = (raw: Partial<PostsStorePayload> | null | undefined): PostsStorePayload => {
  const regular = Array.isArray(raw?.regular)
    ? raw!.regular.map((item) => normalizePost(item))
    : [];
  const pinned = Array.isArray(raw?.pinned)
    ? raw!.pinned.map((item) => normalizePost(item))
    : [];

  return { regular, pinned };
};

export const readPostsStore = async (): Promise<PostsStorePayload> => {
  await ensureDataDir();
  const filePath = getPostsFilePath();
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as Partial<PostsStorePayload>;
    return normalizeStore(parsed);
  } catch {
    const initial = normalizeStore(null);
    await writeFile(filePath, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
};

export const savePostsStore = async (
  payload: Partial<PostsStorePayload>,
): Promise<PostsStorePayload> => {
  await ensureDataDir();
  const normalized = normalizeStore(payload);
  await writeFile(getPostsFilePath(), JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
};

export const getAllPostsWithFlag = async (): Promise<Array<PostItem & { isPinned: boolean }>> => {
  const store = await readPostsStore();
  const pinned = store.pinned.map((post) => ({ ...post, isPinned: true }));
  const regular = store.regular.map((post) => ({ ...post, isPinned: false }));
  return [...pinned, ...regular];
};
