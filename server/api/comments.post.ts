import { readBody } from "h3";
import {
  getSessionUser,
  requestUpstream,
  unwrapApiData,
} from "../utils/session";

const getDefaultAvatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export default defineEventHandler(async (event) => {
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
    user?.name ||
      user?.nickname ||
      user?.username ||
      user?.displayName ||
      user?.email ||
      "",
  ).trim();
  const finalAuthor = userName || bodyAuthor || "匿名用户";
  const userId = String(
    user?.id || user?.userId || user?.uid || user?.sub || user?.openid || "",
  ).trim();
  const bodyAuthorId = String(body?.authorId || body?.userId || "").trim();
  const finalAuthorId = userId || bodyAuthorId;
  const userAvatar = String(
    user?.picture || user?.avatar || user?.headImg || "",
  ).trim();
  const bodyAvatar = String(body?.avatar || body?.authorAvatar || "").trim();
  const finalAvatar = userAvatar || bodyAvatar || getDefaultAvatar(finalAuthor);
  const payload = {
    ...body,
    articleId: String(body?.articleId || body?.postId || "").trim(),
    authorId: finalAuthorId || undefined,
    userId: finalAuthorId || undefined,
    author: finalAuthor,
    authorName: finalAuthor,
    nickname: finalAuthor,
    avatar: finalAvatar,
    authorAvatar: finalAvatar,
  };
  const upstream = await requestUpstream<any>(event, {
    path: "/api/comments",
    method: "POST",
    body: payload,
    auth: "none",
  });
  const data = unwrapApiData<any>(upstream);

  return {
    message: "评论成功",
    data,
  };
});
