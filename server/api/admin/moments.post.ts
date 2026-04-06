import { createError, readBody } from "h3";
import { readMomentsStore, saveMomentsStore } from "../../utils/moments-store";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const body = await readBody(event);
  const content = String(body?.content || "").trim();
  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "内容不能为空",
    });
  }
  const now = Date.now();
  const nextItem = {
    id: String(now),
    content,
    images: Array.isArray(body?.images)
      ? body.images.map((x: any) => String(x || "").trim()).filter(Boolean)
      : [],
    mood: String(body?.mood || "").trim(),
    visibility:
      String(body?.visibility || "public").trim().toLowerCase() === "private"
        ? ("private" as const)
        : ("public" as const),
    author: String(user.name || user.username || user.email || "admin"),
    createdAt: now,
    updatedAt: now,
  };
  const moments = await readMomentsStore();
  moments.unshift(nextItem);
  await saveMomentsStore(moments);
  return {
    message: "创建成功",
    data: nextItem,
  };
});
