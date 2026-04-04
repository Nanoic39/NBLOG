import { createError } from "h3";
import { getSessionUser } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = String(config.public.backendBaseUrl || config.public.oauthApiBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "上游接口地址未配置",
    });
  }
  const user = getSessionUser(event);
  const token = String(user?.access_token || "").trim();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const upstream = await fetch(`${baseUrl}/api/doing/stream`, {
    method: "GET",
    headers,
  });
  if (!upstream.ok || !upstream.body) {
    throw createError({
      statusCode: upstream.status || 502,
      statusMessage: "连接状态流失败",
    });
  }

  const contentType = upstream.headers.get("content-type") || "text/event-stream";
  setHeader(event, "Content-Type", contentType);
  setHeader(event, "Cache-Control", "no-cache, no-transform");
  setHeader(event, "Connection", "keep-alive");

  const reader = upstream.body.getReader();
  const res = event.node.res;

  event.node.req.on("close", async () => {
    try {
      await reader.cancel();
    } catch {}
    if (!res.writableEnded) res.end();
  });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value?.length) {
      res.write(Buffer.from(value));
    }
  }
  if (!res.writableEnded) res.end();
  return;
});
