import { createError, readBody } from "h3";
import { requestUpstream } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少文章 ID",
    });
  }
  const body = await readBody(event);
  return await requestUpstream(event, {
    path: `/api/admin/posts/${encodeURIComponent(id)}`,
    method: "PUT",
    body,
    auth: "admin",
  });
});
