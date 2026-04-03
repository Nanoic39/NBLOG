import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ReplyItem = {
  id: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: number;
  isAdmin?: boolean;
  replyTo?: string;
  replyToUserId?: string;
  images?: string[];
};

export type CommentItem = {
  id: string;
  articleId: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: number;
  isAdmin?: boolean;
  replies: ReplyItem[];
  images?: string[];
};

const getDataDir = () =>
  process.env.NBLOG_DATA_DIR || path.join(process.cwd(), ".data", "nblog");

const getLegacyCommentsPath = () =>
  path.join(process.cwd(), "server", "api", "MockData", "comments.json");

const getCommentsFilePath = () => path.join(getDataDir(), "comments.json");

const ensureDataDir = async () => {
  await mkdir(getDataDir(), { recursive: true });
};

const toTime = (value: unknown) => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return Date.now();
  return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
};

const normalizeReply = (raw: any, index: number): ReplyItem => ({
  id: String(raw?.id || `${Date.now()}-${index}`),
  authorId: raw?.authorId ? String(raw.authorId) : undefined,
  author: String(raw?.author || "用户"),
  avatar: String(
    raw?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(raw?.author || "user"))}`,
  ),
  content: String(raw?.content || ""),
  createdAt: toTime(raw?.createdAt),
  isAdmin: Boolean(raw?.isAdmin),
  replyTo: raw?.replyTo ? String(raw.replyTo) : undefined,
  replyToUserId: raw?.replyToUserId ? String(raw.replyToUserId) : undefined,
  images: Array.isArray(raw?.images)
    ? raw.images.map((item: any) => String(item || "")).filter(Boolean)
    : [],
});

const normalizeComment = (raw: any, index: number): CommentItem => ({
  id: String(raw?.id || `${Date.now()}-${index}`),
  articleId: String(raw?.articleId || raw?.postId || ""),
  authorId: raw?.authorId ? String(raw.authorId) : undefined,
  author: String(raw?.author || "用户"),
  avatar: String(
    raw?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(raw?.author || "user"))}`,
  ),
  content: String(raw?.content || ""),
  createdAt: toTime(raw?.createdAt),
  isAdmin: Boolean(raw?.isAdmin),
  replies: Array.isArray(raw?.replies)
    ? raw.replies.map((item: any, replyIndex: number) =>
        normalizeReply(item, replyIndex),
      )
    : [],
  images: Array.isArray(raw?.images)
    ? raw.images.map((item: any) => String(item || "")).filter(Boolean)
    : [],
});

const normalizeStore = (raw: any): CommentItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => normalizeComment(item, index));
};

const readJsonFile = async (filePath: string) => {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const readCommentsStore = async (): Promise<CommentItem[]> => {
  await ensureDataDir();
  const filePath = getCommentsFilePath();
  const currentData = await readJsonFile(filePath);
  if (currentData) {
    return normalizeStore(currentData);
  }

  const legacyData = await readJsonFile(getLegacyCommentsPath());
  const initial = normalizeStore(legacyData);
  await writeFile(filePath, JSON.stringify(initial, null, 2), "utf-8");
  return initial;
};

export const writeCommentsStore = async (comments: CommentItem[]) => {
  await ensureDataDir();
  const filePath = getCommentsFilePath();
  await writeFile(filePath, JSON.stringify(normalizeStore(comments), null, 2), "utf-8");
};
