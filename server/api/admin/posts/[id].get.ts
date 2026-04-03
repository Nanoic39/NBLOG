import { createError } from "h3";
import { readPostsStore } from "../../../utils/posts-store";
import { requireAdmin } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "缺少文章 ID" });
  }

  const store = await readPostsStore();
  const current = [...store.pinned, ...store.regular].find((item) => item.id === id);
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "文章不存在" });
  }

  return {
    data: {
      ...current,
      isPinned: store.pinned.some((item) => item.id === id),
    },
  };
});
