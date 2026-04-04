import { createError, getCookie, type H3Event } from "h3";

export type SessionUser = {
  role?: string;
  email?: string;
  access_token?: string;
  [key: string]: any;
};

export const getSessionUser = (event: H3Event): SessionUser | null => {
  const sessionCookie = getCookie(event, "user_session");
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const user = JSON.parse(sessionData) as SessionUser;
    return user;
  } catch {
    return null;
  }
};

export const requireAdmin = (event: H3Event): SessionUser => {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录或登录已过期",
    });
  }

  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "无权限访问该资源",
    });
  }

  return user;
};

type UpstreamAuthMode = "none" | "user" | "admin";

type RequestUpstreamOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, any>;
  body?: any;
  auth?: UpstreamAuthMode;
};

export const unwrapApiData = <T>(response: unknown): T => {
  if (
    response &&
    typeof response === "object" &&
    "success" in (response as Record<string, unknown>) &&
    (response as Record<string, unknown>).success === true &&
    "data" in (response as Record<string, unknown>)
  ) {
    return (response as { data: T }).data;
  }
  if (response && typeof response === "object" && "data" in (response as Record<string, unknown>)) {
    return (response as { data: T }).data;
  }
  return response as T;
};

const getUpstreamApiBaseUrl = () => {
  const config = useRuntimeConfig();
  const baseUrl = String(config.public.oauthApiBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "上游接口地址未配置",
    });
  }
  return baseUrl;
};

const getAccessToken = (event: H3Event, auth: UpstreamAuthMode) => {
  if (auth === "none") return "";
  const user = auth === "admin" ? requireAdmin(event) : getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录或登录已过期",
    });
  }
  const token = String(user.access_token || "").trim();
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "缺少访问令牌，请重新登录",
    });
  }
  return token;
};

const pickErrorMessage = (raw: any, fallback: string) => {
  if (!raw || typeof raw !== "object") return fallback;
  const direct = String(raw.message || raw.statusMessage || "").trim();
  if (direct) return direct;
  const nested = raw.error;
  if (nested && typeof nested === "object") {
    const message = String((nested as any).message || "").trim();
    if (message) return message;
  }
  return fallback;
};

export const requestUpstream = async <T = any>(
  event: H3Event,
  options: RequestUpstreamOptions,
): Promise<T> => {
  const method = options.method || "GET";
  const auth = options.auth || "none";
  const baseUrl = getUpstreamApiBaseUrl();
  const path = String(options.path || "").trim();
  if (!path.startsWith("/")) {
    throw createError({
      statusCode: 500,
      statusMessage: "上游路径格式无效",
    });
  }
  const token = getAccessToken(event, auth);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await $fetch.raw(`${baseUrl}${path}`, {
    method,
    headers,
    query: options.query,
    body: options.body,
    ignoreResponseError: true,
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: pickErrorMessage(response._data, "上游服务返回异常"),
    });
  }
  return response._data as T;
};
