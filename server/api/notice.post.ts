import { readBody } from "h3";
import { requestUpstream } from "../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await requestUpstream(event, {
    path: "/api/notice",
    method: "POST",
    body,
    auth: "admin",
  });
});
