import { readBody } from "h3";
import { requestUpstream, unwrapApiData } from "../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const upstream = await requestUpstream<any>(event, {
    path: "/api/comments",
    method: "POST",
    body,
    auth: "user",
  });
  const data = unwrapApiData<any>(upstream);

  return {
    message: "评论成功",
    data,
  };
});
