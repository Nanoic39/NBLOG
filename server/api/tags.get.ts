import { requestUpstream, unwrapApiData } from "../utils/session";

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/tags",
  });
  const payload = unwrapApiData<any>(upstream);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.tags)) return payload.tags;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
});
