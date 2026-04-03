import { createError, getRouterParam, readBody } from "h3";
import { readCommentsStore, writeCommentsStore } from "../../../utils/comments-store";
import { getSessionUser } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "请先登录后再回复",
    });
  }

  const commentId = String(getRouterParam(event, "id") || "").trim();
  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少评论ID",
    });
  }

  const body = await readBody(event);
  const content = String(body?.content || "").trim();
  const replyToUserId = String(body?.replyToUserId || "").trim();
  const images = Array.isArray(body?.images)
    ? body.images.map((item: any) => String(item || "")).filter(Boolean)
    : [];

  if (!content && images.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "回复内容不能为空",
    });
  }

  const comments = await readCommentsStore();
  const target = comments.find((item) => String(item.id) === commentId);
  if (!target) {
    throw createError({
      statusCode: 404,
      statusMessage: "评论不存在",
    });
  }

  const author = String(user.name || user.username || user.email || "用户");
  const avatar = String(user.picture || "").trim()
    ? "/api/auth/avatar"
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`;
  const replyItem = {
    id: `${Date.now()}`,
    authorId: String(user.id || ""),
    author,
    avatar,
    content,
    createdAt: Date.now(),
    isAdmin: user.role === "admin",
    replyTo: target.author,
    replyToUserId: replyToUserId || target.authorId,
    images,
  };

  target.replies = Array.isArray(target.replies) ? target.replies : [];
  target.replies.push(replyItem);
  await writeCommentsStore(comments);

  return {
    message: "回复成功",
    data: replyItem,
  };
});
