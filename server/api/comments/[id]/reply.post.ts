import { createError, getRouterParam, readBody } from "h3";
import { requestUpstream, unwrapApiData } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const commentId = String(getRouterParam(event, "id") || "").trim();
  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少评论ID",
    });
  }

  const body = await readBody(event);
  const upstream = await requestUpstream<any>(event, {
    path: `/api/comments/${encodeURIComponent(commentId)}/reply`,
    method: "POST",
    body,
    auth: "user",
  });
  const data = unwrapApiData<any>(upstream);

  return {
    message: "回复成功",
    data,
  };
});
