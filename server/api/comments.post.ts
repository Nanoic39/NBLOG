import { createError, readBody } from "h3";
import { readCommentsStore, writeCommentsStore } from "../utils/comments-store";
import { getSessionUser } from "../utils/session";

export default defineEventHandler(async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "请先登录后再评论",
    });
  }

  const body = await readBody(event);
  const articleId = String(body?.articleId || "").trim();
  const content = String(body?.content || "").trim();
  const images = Array.isArray(body?.images)
    ? body.images.map((item: any) => String(item || "")).filter(Boolean)
    : [];

  if (!articleId) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少文章ID",
    });
  }

  if (!content && images.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "评论内容不能为空",
    });
  }

  const author = String(user.name || user.username || user.email || "用户");
  const avatar = String(user.picture || "").trim()
    ? "/api/auth/avatar"
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`;
  const nextItem = {
    id: `${Date.now()}`,
    articleId,
    authorId: String(user.id || ""),
    author,
    avatar,
    content,
    createdAt: Date.now(),
    isAdmin: user.role === "admin",
    replies: [],
    images,
  };

  const comments = await readCommentsStore();
  comments.unshift(nextItem);
  await writeCommentsStore(comments);

  return {
    message: "评论成功",
    data: nextItem,
  };
});
