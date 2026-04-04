import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/posts",
    auth: "admin",
  });
  const payload = unwrapApiData<any>(upstream);
  const posts = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.posts)
      ? payload.posts
      : Array.isArray(payload?.list)
        ? payload.list
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
  return {
    posts,
  };
});
