import { createError } from "h3";
import { requestUpstream, unwrapApiData } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "缺少文章 ID" });
  }
  let current: any = null;
  try {
    const upstream = await requestUpstream<any>(event, {
      path: `/api/admin/posts/${encodeURIComponent(id)}`,
      auth: "admin",
    });
    current = unwrapApiData<any>(upstream);
  } catch (error: any) {
    const shouldFallback =
      Number(error?.statusCode || 500) === 404 ||
      Number(error?.statusCode || 500) === 400;
    if (!shouldFallback) throw error;
    const listUpstream = await requestUpstream<any>(event, {
      path: "/api/admin/posts",
      auth: "admin",
    });
    const listPayload = unwrapApiData<any>(listUpstream);
    const list = Array.isArray(listPayload)
      ? listPayload
      : Array.isArray(listPayload?.posts)
        ? listPayload.posts
        : Array.isArray(listPayload?.list)
          ? listPayload.list
          : Array.isArray(listPayload?.records)
            ? listPayload.records
            : [];
    current =
      list.find(
        (item: any) =>
          String(item?.id || "").trim() === id ||
          String(item?.slug || "").trim() === id,
      ) || null;
    if (!current) {
      throw createError({ statusCode: 404, statusMessage: "未找到文章" });
    }
  }

  return {
    data: {
      ...current,
    },
  };
});
