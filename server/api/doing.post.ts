import { createError, readBody } from "h3";
import { publishDoing } from "../utils/doing-channel";
import { readDoing, saveDoing } from "../utils/doing-store";
import { requireAdmin } from "../utils/session";

type DoingUpdateBody = {
  action?: string;
  target?: string;
  type?: string;
  startTime?: string | number;
};

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const body = (await readBody(event)) as DoingUpdateBody | null;

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "请求体格式无效",
    });
  }

  const action = String(body.action || "").trim();
  const target = String(body.target || "").trim();
  const type = String(body.type || "").trim();
  const startTimeRaw = String(body.startTime || "").trim();
  const startTime = startTimeRaw || String(Date.now());

  const previous = await readDoing();
  const saved = await saveDoing({
    ...previous,
    action,
    target,
    type,
    startTime,
    updatedAt: Date.now(),
    updatedBy: user.email || "admin",
  });

  publishDoing(saved);

  return {
    success: true,
    data: saved,
  };
});
