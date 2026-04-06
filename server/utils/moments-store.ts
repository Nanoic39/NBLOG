import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type MomentItem = {
  id: string;
  content: string;
  images: string[];
  mood: string;
  visibility: "public" | "private";
  author: string;
  createdAt: number;
  updatedAt: number;
};

const getDataDir = () =>
  process.env.NBLOG_DATA_DIR || path.join(process.cwd(), ".data", "nblog");

const getMomentsFilePath = () => path.join(getDataDir(), "moments.json");

const ensureDataDir = async () => {
  await mkdir(getDataDir(), { recursive: true });
};

const normalizeTimestamp = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeMoment = (raw: Partial<MomentItem>): MomentItem => {
  const now = Date.now();
  const visibilityRaw = String(raw.visibility || "public").trim().toLowerCase();
  return {
    id: String(raw.id || Date.now()),
    content: String(raw.content || "").trim(),
    images: Array.isArray(raw.images)
      ? raw.images.map((x) => String(x || "").trim()).filter(Boolean)
      : [],
    mood: String(raw.mood || "").trim(),
    visibility: visibilityRaw === "private" ? "private" : "public",
    author: String(raw.author || "").trim() || "admin",
    createdAt: normalizeTimestamp(raw.createdAt, now),
    updatedAt: normalizeTimestamp(raw.updatedAt, now),
  };
};

export const readMomentsStore = async (): Promise<MomentItem[]> => {
  await ensureDataDir();
  const filePath = getMomentsFilePath();
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeMoment(item))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    await writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
};

export const saveMomentsStore = async (items: MomentItem[]) => {
  await ensureDataDir();
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => normalizeMoment(item))
    .sort((a, b) => b.createdAt - a.createdAt);
  await writeFile(getMomentsFilePath(), JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
};
