import { readBody } from "h3";
import { requestUpstream } from "../utils/session";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Record<string, any>;
  const activeRaw = body?.active;
  const active =
    typeof activeRaw === "boolean"
      ? activeRaw
      : String(activeRaw ?? "")
          .trim()
          .toLowerCase() !== "false" &&
        String(activeRaw ?? "").trim() !== "0";
  const payload = {
    ...body,
    active,
    enabled: active,
    isActive: active,
  };
  return await requestUpstream(event, {
    path: "/api/notice",
    method: "POST",
    body: payload,
    auth: "admin",
  });
});
