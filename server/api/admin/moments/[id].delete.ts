import { createError, getRouterParam } from "h3";
import { readMomentsStore, saveMomentsStore } from "../../../utils/moments-store";
import { requireAdmin } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少碎碎念 ID",
    });
  }
  const moments = await readMomentsStore();
  const nextMoments = moments.filter((item) => item.id !== id);
  if (nextMoments.length === moments.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "碎碎念不存在",
    });
  }
  await saveMomentsStore(nextMoments);
  return {
    message: "删除成功",
  };
});
