import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import noticeMock from "../api/MockData/GlobalNotice.json";

export type NoticeData = {
  theme: string;
  title: string;
  content: string;
  updatedAt: number;
  updatedBy: string;
};

const getDataDir = () =>
  process.env.NBLOG_DATA_DIR || path.join(process.cwd(), ".data", "nblog");

const getNoticeFilePath = () => path.join(getDataDir(), "notice.json");

const ensureDataDir = async () => {
  await mkdir(getDataDir(), { recursive: true });
};

const normalizeNotice = (raw: Partial<NoticeData>): NoticeData => {
  return {
    theme: String(raw.theme || "info"),
    title: String(raw.title || ""),
    content: String(raw.content || ""),
    updatedAt:
      typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : Date.now(),
    updatedBy: String(raw.updatedBy || "system"),
  };
};

export const readNotice = async (): Promise<NoticeData> => {
  await ensureDataDir();
  const filePath = getNoticeFilePath();
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as Partial<NoticeData>;
    return normalizeNotice(parsed);
  } catch {
    const initial = normalizeNotice({
      ...noticeMock,
      updatedAt: Date.now(),
      updatedBy: "system",
    });
    await writeFile(filePath, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
};

export const saveNotice = async (raw: Partial<NoticeData>): Promise<NoticeData> => {
  await ensureDataDir();
  const normalized = normalizeNotice(raw);
  await writeFile(getNoticeFilePath(), JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
};
