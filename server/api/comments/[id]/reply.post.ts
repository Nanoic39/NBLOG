import { createError, getRouterParam, readBody } from "h3";
import {
  getSessionUser,
  requestUpstream,
  unwrapApiData,
} from "../../../utils/session";

const getDefaultAvatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export default defineEventHandler(async (event) => {
  const commentId = String(getRouterParam(event, "id") || "").trim();
  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少评论ID",
    });
  }

  const body = await readBody<Record<string, any>>(event);
  const user = getSessionUser(event);
  const bodyAuthor = String(
    body?.author ||
      body?.authorName ||
      body?.nickname ||
      body?.guestName ||
      "",
  ).trim();
  const userName = String(
    user?.name || user?.nickname || user?.username || user?.email || "",
  ).trim();
  const finalAuthor = userName || bodyAuthor || "匿名用户";
  const userId = String(user?.id || user?.userId || user?.uid || "").trim();
  const bodyAuthorId = String(body?.authorId || body?.userId || "").trim();
  const finalAuthorId = userId || bodyAuthorId;
  const userAvatar = String(user?.picture || user?.avatar || "").trim();
  const bodyAvatar = String(body?.avatar || body?.authorAvatar || "").trim();
  const finalAvatar = userAvatar || bodyAvatar || getDefaultAvatar(finalAuthor);
  const replyToUserId = String(body?.replyToUserId || "").trim();
  const payload = {
    ...body,
    authorId: finalAuthorId || undefined,
    userId: finalAuthorId || undefined,
    author: finalAuthor,
    authorName: finalAuthor,
    nickname: finalAuthor,
    avatar: finalAvatar,
    authorAvatar: finalAvatar,
    replyToUserId: replyToUserId || undefined,
  };
  const upstream = await requestUpstream<any>(event, {
    path: `/api/comments/${encodeURIComponent(commentId)}/reply`,
    method: "POST",
    body: payload,
    auth: "none",
  });
  const data = unwrapApiData<any>(upstream);

  return {
    message: "回复成功",
    data,
  };
});
