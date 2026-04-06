import { createError, readBody } from "h3";
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
  const body = await readBody(event);
  const content = String(body?.content || "").trim();
  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "内容不能为空",
    });
  }
  const payload = {
    content,
    images: Array.isArray(body?.images)
      ? body.images.map((x: any) => String(x || "").trim()).filter(Boolean)
      : [],
    mood: String(body?.mood || "").trim(),
    visibility:
      String(body?.visibility || "public").trim().toLowerCase() === "private"
        ? ("private" as const)
        : ("public" as const),
  };
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/moments",
    method: "POST",
    body: payload,
    auth: "admin",
    baseUrl: resolveMomentsBaseUrl(),
  });
  const data = unwrapApiData<any>(upstream);
  return {
    message: "创建成功",
    data,
  };
});
