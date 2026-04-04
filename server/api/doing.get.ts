import { requestUpstream, unwrapApiData } from "../utils/session";

export default defineEventHandler(async (event) => {
  const candidates = ["/api/doing", "/api/admin/doing"];
  let lastError: unknown = null;
  for (const path of candidates) {
    try {
      const upstream = await requestUpstream<any>(event, { path });
      return unwrapApiData<any>(upstream);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
});
