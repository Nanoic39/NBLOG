import { readBody } from "h3";
import { requestUpstream } from "../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const candidates = ["/api/notice", "/api/admin/notice"];
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
