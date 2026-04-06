import { createError, getRouterParam, readBody } from "h3";
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
  const body = await readBody(event);
  const moments = await readMomentsStore();
  const target = moments.find((item) => item.id === id);
  if (!target) {
    throw createError({
      statusCode: 404,
      statusMessage: "碎碎念不存在",
    });
  }
  if (body?.content !== undefined) {
    target.content = String(body.content || "").trim();
  }
  if (body?.mood !== undefined) {
    target.mood = String(body.mood || "").trim();
  }
  if (body?.visibility !== undefined) {
    target.visibility =
      String(body.visibility || "").trim().toLowerCase() === "private"
        ? "private"
        : "public";
  }
  if (Array.isArray(body?.images)) {
    target.images = body.images
      .map((x: any) => String(x || "").trim())
      .filter(Boolean);
  }
  target.updatedAt = Date.now();
  await saveMomentsStore(moments);
  return {
    message: "更新成功",
    data: target,
  };
});
