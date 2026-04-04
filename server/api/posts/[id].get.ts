import { createError } from "h3";
import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少文章 ID",
    });
  }

  const upstream = await requestUpstream<any>(event, {
    path: `/api/posts/${encodeURIComponent(id)}`,
  });
  const data = unwrapApiData<any>(upstream);
  return { data };
});
