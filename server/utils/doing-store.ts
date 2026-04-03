import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type DoingData = {
  action: string;
  target: string;
  type: string;
  startTime: string;
  updatedAt: number;
  updatedBy: string;
};

const getDataDir = () =>
  process.env.NBLOG_DATA_DIR || path.join(process.cwd(), ".data", "nblog");

const getDoingFilePath = () => path.join(getDataDir(), "doing.json");

const normalizeTimestamp = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return Date.now();
  return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
};

const normalizeDoingData = (input: Partial<DoingData>): DoingData => {
  const startTime = normalizeTimestamp(input.startTime);
  return {
    action: String(input.action || ""),
    target: String(input.target || ""),
    type: String(input.type || ""),
    startTime: String(startTime),
    updatedAt:
      typeof input.updatedAt === "number" ? input.updatedAt : Date.now(),
    updatedBy: String(input.updatedBy || "system"),
  };
};

const ensureDataDir = async () => {
  await mkdir(getDataDir(), { recursive: true });
};

export const readDoing = async (): Promise<DoingData> => {
  await ensureDataDir();
  const filePath = getDoingFilePath();

  try {
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content) as Partial<DoingData>;
    return normalizeDoingData(data);
  } catch {
    const initial = normalizeDoingData({
      action: "",
      target: "",
      type: "",
      startTime: String(Date.now()),
      updatedAt: Date.now(),
      updatedBy: "system",
    });
    await writeFile(filePath, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
};

export const saveDoing = async (data: Partial<DoingData>): Promise<DoingData> => {
  await ensureDataDir();
  const merged = normalizeDoingData(data);
  await writeFile(getDoingFilePath(), JSON.stringify(merged, null, 2), "utf-8");
  return merged;
};
