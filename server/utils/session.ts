import { createError, getCookie, getRequestHeader, type H3Event } from "h3";

export type SessionUser = {
  role?: string;
  email?: string;
  access_token?: string;
  [key: string]: any;
};

const decodeSessionCookie = (sessionCookie: string): SessionUser | null => {
  try {
    const raw = String(sessionCookie || "").trim();
    if (raw.startsWith("{") && raw.endsWith("}")) {
      const parsed = JSON.parse(raw) as Record<string, any>;
      if (parsed && typeof parsed === "object") {
        return parsed as SessionUser;
      }
    }
    const normalized = sessionCookie.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLength);
    const sessionData = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(sessionData) as Record<string, any>;
    if (!parsed || typeof parsed !== "object") return null;
    if ("access_token" in parsed || "role" in parsed || "email" in parsed) {
      return parsed as SessionUser;
    }
    if ("t" in parsed || "r" in parsed || "e" in parsed) {
      return {
        id: parsed.i ?? "",
        name: parsed.n ?? "",
        username: parsed.u ?? "",
        email: parsed.e ?? "",
        picture: parsed.p ?? "",
        access_token: parsed.t ?? "",
        role: parsed.r ?? "user",
      };
    }
    return parsed as SessionUser;
  } catch {
    return null;
  }
};

const isDebugProxyEnabled = () => {
  const config = useRuntimeConfig();
  const raw = String((config as any).debugProxyLog || "").trim().toLowerCase();
  if (["1", "true", "on", "yes"].includes(raw)) return true;
  const rawPublic = String((config.public as any)?.debugProxyLog || "")
    .trim()
    .toLowerCase();
  return ["1", "true", "on", "yes"].includes(rawPublic);
};

const getTraceId = (event: H3Event) => {
  const incoming =
    getRequestHeader(event, "x-request-id") ||
    getRequestHeader(event, "x-trace-id");
  if (incoming) return String(incoming);
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const debugProxyLog = (event: H3Event, stage: string, payload: Record<string, any>) => {
  if (!isDebugProxyEnabled()) return;
  const traceId = getTraceId(event);
  try {
    console.info(
      `[NBLOG_PROXY][${traceId}][${stage}] ${JSON.stringify(payload)}`,
    );
  } catch {
    console.info(`[NBLOG_PROXY][${traceId}][${stage}]`, payload);
  }
};

export const getSessionUser = (event: H3Event): SessionUser | null => {
  const sessionCookie = getCookie(event, "user_session");
  if (!sessionCookie) {
    debugProxyLog(event, "session.missing_cookie", {
      cookieName: "user_session",
    });
    return null;
  }
  const user = decodeSessionCookie(sessionCookie);
  if (!user) {
    debugProxyLog(event, "session.decode_failed", {
      cookieLength: String(sessionCookie || "").length,
    });
    return null;
  }
  debugProxyLog(event, "session.decoded", {
    role: String(user.role || ""),
    email: String(user.email || ""),
    hasAccessToken: Boolean(String(user.access_token || "").trim()),
    hasPicture: Boolean(String(user.picture || "").trim()),
  });
  return user;
};

export const requireAdmin = (event: H3Event): SessionUser => {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "未登录或登录已过期",
    });
  }

  const userRole = String(user.role || "").trim().toLowerCase();
  const userEmail = String(user.email || "").trim().toLowerCase();
  const adminEmail = String(useRuntimeConfig().adminEmail || "")
    .trim()
    .toLowerCase();

  if (userRole !== "admin" && (!adminEmail || userEmail !== adminEmail)) {
    debugProxyLog(event, "auth.require_admin_denied", {
      role: userRole,
      email: userEmail,
      adminEmailConfigured: Boolean(adminEmail),
    });
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "无权限访问该资源",
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
  if (
    response &&
    typeof response === "object" &&
    "data" in (response as Record<string, unknown>)
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
};

const getUpstreamApiBaseUrl = () => {
  const config = useRuntimeConfig();
  const baseUrl = String(config.public.backendBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "UpstreamConfigMissing",
      message: "上游接口地址未配置",
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
      statusMessage: "Unauthorized",
      message: "未登录或登录已过期",
    });
  }
  const token = String(user.access_token || "").trim();
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "缺少访问令牌，请重新登录",
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
      statusMessage: "InvalidUpstreamPath",
      message: "上游路径格式无效",
    });
  }
  const token = getAccessToken(event, auth);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  debugProxyLog(event, "upstream.request", {
    method,
    auth,
    path,
    baseUrl,
    hasAuthorization: Boolean(headers.Authorization),
    queryKeys: Object.keys(options.query || {}),
    hasBody: options.body !== undefined,
  });

  const response = await $fetch.raw(`${baseUrl}${path}`, {
    method,
    headers,
    query: options.query,
    body: options.body,
    ignoreResponseError: true,
  });

  if (!response.ok) {
    const message = pickErrorMessage(response._data, "上游服务返回异常");
    debugProxyLog(event, "upstream.response_error", {
      method,
      path,
      statusCode: response.status,
      message,
    });
    throw createError({
      statusCode: response.status,
      statusMessage: `Upstream_${response.status}`,
      message,
    });
  }
  debugProxyLog(event, "upstream.response_ok", {
    method,
    path,
    statusCode: response.status,
    contentType: response.headers.get("content-type") || "",
  });
  return response._data as T;
};
