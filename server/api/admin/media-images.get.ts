import { createError } from "h3";
import { getSessionUser, requireAdmin } from "../../utils/session";

const unwrap = <T>(value: T | { data?: T } | null | undefined): T | null => {
  if (!value) return null;
  if (typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
};

const toAbsoluteUrl = (apiBaseUrl: string, raw: string): string => {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/api/file/")) return `${apiBaseUrl}${raw}`;
  if (raw.startsWith("/file/")) return `${apiBaseUrl}/api${raw}`;
  if (raw.startsWith("/")) return `${apiBaseUrl}${raw}`;
  return `${apiBaseUrl}/${raw}`;
};

const collectImageUrls = (payload: any, apiBaseUrl: string, output: Set<string>) => {
  if (!payload) return;
  if (typeof payload === "string") {
    const value = payload.trim();
    if (!value) return;
    if (!/\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(value) && !value.includes("/api/file/") && !value.includes("/file/")) {
      return;
    }
    output.add(toAbsoluteUrl(apiBaseUrl, value));
    return;
  }
  if (Array.isArray(payload)) {
    payload.forEach((item) => collectImageUrls(item, apiBaseUrl, output));
    return;
  }
  if (typeof payload !== "object") return;
  for (const [key, val] of Object.entries(payload)) {
    if (/url|path|src|thumb|image|cover/i.test(key)) {
      collectImageUrls(val, apiBaseUrl, output);
      continue;
    }
    if (/list|items|records|data|files/i.test(key)) {
      collectImageUrls(val, apiBaseUrl, output);
    }
  }
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const user = getSessionUser(event);
  if (!user?.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录或会话已失效",
    });
  }

  const config = useRuntimeConfig();
  const apiBaseUrl = String(config.public.oauthApiBaseUrl || "").trim().replace(/\/+$/, "");
  if (!apiBaseUrl) {
    return { data: [] };
  }

  const endpoints = [
    `${apiBaseUrl}/api/file/mine`,
    `${apiBaseUrl}/api/file/my`,
    `${apiBaseUrl}/api/file/list`,
    `${apiBaseUrl}/api/file/images`,
  ];
  const urls = new Set<string>();

  for (const endpoint of endpoints) {
    try {
      const response = await $fetch.raw(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        query: { page: 1, size: 80 },
        ignoreResponseError: true,
      });
      if (!response.ok) continue;
      const payload = unwrap<any>(response._data as any) ?? response._data;
      collectImageUrls(payload, apiBaseUrl, urls);
      if (urls.size >= 120) break;
    } catch {}
  }

  return {
    data: Array.from(urls).slice(0, 120),
  };
});
