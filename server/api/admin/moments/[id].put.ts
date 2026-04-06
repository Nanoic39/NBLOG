import { createError, getRouterParam, readBody } from "h3";
import { requestUpstream, unwrapApiData } from "../../../utils/session";

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
  const id = String(getRouterParam(event, "id") || "").trim();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少碎碎念 ID",
    });
  }
  const body = await readBody(event);
  const payload: Record<string, any> = {};
  if (body?.content !== undefined) {
    payload.content = String(body.content || "").trim();
  }
  if (body?.mood !== undefined) {
    payload.mood = String(body.mood || "").trim();
  }
  if (body?.visibility !== undefined) {
    payload.visibility =
      String(body.visibility || "").trim().toLowerCase() === "private"
        ? "private"
        : "public";
  }
  if (Array.isArray(body?.images)) {
    payload.images = body.images
      .map((x: any) => String(x || "").trim())
      .filter(Boolean);
  }
  const upstream = await requestUpstream<any>(event, {
    path: `/api/admin/moments/${encodeURIComponent(id)}`,
    method: "PUT",
    body: payload,
    auth: "admin",
    baseUrl: resolveMomentsBaseUrl(),
  });
  const data = unwrapApiData<any>(upstream);
  return {
    message: "更新成功",
    data,
  };
});
