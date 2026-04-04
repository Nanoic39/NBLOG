import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const upstream = await requestUpstream<any>(event, {
    path: "/api/posts/latest",
    query,
  });
  const payload = unwrapApiData<any>(upstream);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.posts)
      ? payload.posts
      : Array.isArray(payload?.list)
        ? payload.list
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
  const totalRaw =
    Number(payload?.total ?? payload?.count ?? payload?.meta?.total ?? list.length) || list.length;
  const pageRaw = Number(query.page || payload?.page || payload?.meta?.page || 1);
  const sizeRaw = Number(query.size || query.limit || payload?.size || payload?.meta?.size || list.length || 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const size = Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : 10;
  const hasMore =
    typeof payload?.hasMore === "boolean"
      ? payload.hasMore
      : page * size < totalRaw;

  return {
    posts: list,
    total: totalRaw,
    hasMore,
    meta: {
      page,
      size,
      returned: list.length,
    },
  };
});
