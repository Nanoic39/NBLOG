import { requestUpstream, unwrapApiData } from "../../utils/session";

const resolveMomentsBaseUrl = () => {
  const config = useRuntimeConfig();
  return String(
    (config.public as any).momentsApiBaseUrl ||
      config.public.yunaCoreApiBaseUrl ||
      "http://103.39.66.135:8080",
  )
    .trim()
    .replace(/\/+$/, "");
};

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/moments",
    method: "GET",
    auth: "admin",
    baseUrl: resolveMomentsBaseUrl(),
  });
  const payload = unwrapApiData<any>(upstream) || {};
  const moments = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.moments)
      ? payload.moments
      : Array.isArray(payload?.list)
        ? payload.list
        : [];
  return {
    moments,
  };
});
