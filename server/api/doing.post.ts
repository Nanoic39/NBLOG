import { readBody } from "h3";
import { requestUpstream } from "../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const candidates = ["/api/doing", "/api/admin/doing"];
  let lastError: unknown = null;
  for (const path of candidates) {
    try {
      return await requestUpstream(event, {
        path,
        method: "POST",
        body,
        auth: "admin",
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
});
