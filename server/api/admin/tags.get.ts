import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/tags",
    auth: "admin",
  });
  const payload = unwrapApiData<any>(upstream);
  const tags = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.tags)
      ? payload.tags
      : Array.isArray(payload?.list)
        ? payload.list
        : [];
  return { tags };
});
