import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import doingMock from "../api/MockData/doingSth.json";

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

const normalizeDoingData = (input: Partial<DoingData>): DoingData => {
  return {
    action: String(input.action || ""),
    target: String(input.target || ""),
    type: String(input.type || ""),
    startTime: String(input.startTime || Date.now()),
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
    const defaultData = normalizeDoingData({
      ...doingMock,
      updatedAt: Date.now(),
      updatedBy: "system",
    });
    await writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
};

export const saveDoing = async (data: Partial<DoingData>): Promise<DoingData> => {
  await ensureDataDir();
  const merged = normalizeDoingData(data);
  await writeFile(getDoingFilePath(), JSON.stringify(merged, null, 2), "utf-8");
  return merged;
};
