import { requestUpstream, unwrapApiData } from "../utils/session";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const upstream = await requestUpstream<any>(event, {
    path: "/api/comments",
    query,
  });
  const payload = unwrapApiData<any>(upstream);
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.comments)
        ? payload.comments
        : Array.isArray(payload?.list)
          ? payload.list
          : [];
  const total = Number(payload?.total ?? payload?.count ?? data.length) || data.length;
  const page = Number(query.page || payload?.page || 1) || 1;
  const size = Number(query.size || payload?.size || data.length || 20) || 20;
  return {
    data,
    total,
    page,
    size,
  };
});
