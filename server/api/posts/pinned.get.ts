import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/posts/pinned",
  });
  const payload = unwrapApiData<any>(upstream);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
});
