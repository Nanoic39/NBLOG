import { createError } from "h3";
import { requestUpstream } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少评论 ID",
    });
  }
  return await requestUpstream(event, {
    path: `/api/comments/${encodeURIComponent(id)}`,
    method: "DELETE",
    auth: "admin",
  });
});
