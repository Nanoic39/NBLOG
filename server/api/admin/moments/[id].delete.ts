import { createError, getRouterParam } from "h3";
import { requestUpstream } from "../../../utils/session";

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
  await requestUpstream(event, {
    path: `/api/admin/moments/${encodeURIComponent(id)}`,
    method: "DELETE",
    auth: "admin",
    baseUrl: resolveMomentsBaseUrl(),
  });
  return {
    message: "删除成功",
  };
});
