import { createError, getCookie, getRequestHeader, setCookie, type H3Event } from "h3";

export type SessionUser = {
  role?: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  [key: string]: any;
};

const normalizeAccessToken = (raw: unknown): string => {
  let token = "";
  if (typeof raw === "string") {
    token = raw;
  } else if (raw && typeof raw === "object") {
    const fromObject = raw as Record<string, any>;
    const candidate =
      fromObject.access_token ??
      fromObject.accessToken ??
      fromObject.token ??
      fromObject.value ??
      fromObject.jwt;
    if (typeof candidate === "string") {
      token = candidate;
    }
  }
  token = String(token || "").trim();
  token = token.replace(/^Bearer\s+/i, "").trim();
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }
  if (!token) return "";
  if (/^(undefined|null|nan)$/i.test(token)) return "";
  return token;
};

const encodeSessionCookie = (user: SessionUser) => {
  const compact = {
    i: user.id ?? user.userId ?? user.uid ?? "",
    n: user.name ?? user.nickname ?? "",
    u: user.username ?? "",
    e: user.email ?? "",
    p: user.picture ?? user.avatar ?? "",
    t: normalizeAccessToken(user.access_token),
    f: normalizeAccessToken(user.refresh_token),
    r: user.role ?? "user",
  };
  return Buffer.from(JSON.stringify(compact))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const getTokenMeta = (token: string) => {
  const normalized = normalizeAccessToken(token);
  const parts = normalized.split(".");
  if (parts.length !== 3) {
    return {
      isJwt: false,
      exp: 0,
      iat: 0,
      expired: false,
      expiresInSeconds: 0,
    };
  }
  try {
    const payloadPart = String(parts[1] || "");
    const payloadBase64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (payloadBase64.length % 4)) % 4;
    const padded = payloadBase64 + "=".repeat(padLength);
    const raw = Buffer.from(padded, "base64").toString("utf-8");
    const payload = JSON.parse(raw) as Record<string, any>;
    const exp = Number(payload.exp || 0);
    const iat = Number(payload.iat || 0);
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = exp > 0 ? exp - now : 0;
    return {
      isJwt: true,
      exp,
      iat,
      expired: exp > 0 ? exp <= now : false,
      expiresInSeconds,
    };
  } catch {
    return {
      isJwt: true,
      exp: 0,
      iat: 0,
      expired: false,
      expiresInSeconds: 0,
    };
  }
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
      parsed.access_token = normalizeAccessToken(parsed.access_token);
      parsed.refresh_token = normalizeAccessToken(
        parsed.refresh_token ?? parsed.refreshToken ?? parsed.f,
      );
      return parsed as SessionUser;
    }
    if ("t" in parsed || "f" in parsed || "r" in parsed || "e" in parsed) {
      return {
        id: parsed.i ?? "",
        name: parsed.n ?? "",
        username: parsed.u ?? "",
        email: parsed.e ?? "",
        picture: parsed.p ?? "",
        access_token: normalizeAccessToken(parsed.t),
        refresh_token: normalizeAccessToken(parsed.f),
        role: parsed.r ?? "user",
      };
    }
    parsed.access_token = normalizeAccessToken(parsed.access_token ?? parsed.t);
    parsed.refresh_token = normalizeAccessToken(
      parsed.refresh_token ?? parsed.refreshToken ?? parsed.f,
    );
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

const refreshSessionToken = async (
  event: H3Event,
  user: SessionUser,
): Promise<string> => {
  const refreshToken = normalizeAccessToken(user?.refresh_token);
  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "登录已过期，请重新登录",
    });
  }
  const config = useRuntimeConfig();
  const oauthApiBaseUrl = String(config.public.oauthApiBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!oauthApiBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "OAuthConfigMissing",
      message: "认证服务地址未配置",
    });
  }
  const tokenRaw = await $fetch<any>(`${oauthApiBaseUrl}/api/user/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: String(config.public.oauthClientId || ""),
      client_secret: String(config.oauthClientSecret || ""),
    }).toString(),
  });
  const tokenPayload = unwrapApiData<Record<string, any>>(tokenRaw) || {};
  const nextAccessToken = normalizeAccessToken(
    tokenPayload.access_token || tokenPayload.accessToken || tokenPayload.token,
  );
  if (!nextAccessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "登录已过期，请重新登录",
    });
  }
  const nextRefreshToken = normalizeAccessToken(
    tokenPayload.refresh_token ||
      tokenPayload.refreshToken ||
      tokenPayload.r_token ||
      refreshToken,
  );
  user.access_token = nextAccessToken;
  user.refresh_token = nextRefreshToken;
  const cookieValue = encodeSessionCookie(user);
  setCookie(event, "user_session", cookieValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
  return nextAccessToken;
};

const getAccessContext = (event: H3Event, auth: UpstreamAuthMode) => {
  if (auth === "none") {
    return {
      user: null as SessionUser | null,
      token: "",
    };
  }
  const user = auth === "admin" ? requireAdmin(event) : getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "未登录或登录已过期",
    });
  }
  const token = String(user.access_token || "").trim();
  const normalizedToken = normalizeAccessToken(token);
  if (!normalizedToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "缺少访问令牌，请重新登录",
    });
  }
  return {
    user,
    token: normalizedToken,
  };
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
  const traceId = getTraceId(event);
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
  const authContext = getAccessContext(event, auth);
  const incomingCookie = String(getRequestHeader(event, "cookie") || "").trim();
  const createHeaders = (token: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers.access_token = token;
      headers["X-Access-Token"] = token;
    }
    if (incomingCookie) {
      headers.Cookie = incomingCookie;
    }
    return headers;
  };
  let headers = createHeaders(authContext.token);
  const bearerToken = String(headers.Authorization || "").replace(/^Bearer\s+/i, "");
  const tokenMeta = getTokenMeta(bearerToken);
  debugProxyLog(event, "upstream.request", {
    traceId,
    method,
    auth,
    path,
    baseUrl,
    hasAuthorization: Boolean(headers.Authorization),
    hasCookieForwarded: Boolean(headers.Cookie),
    cookieLength: incomingCookie.length,
    tokenLength: bearerToken.length,
    tokenLooksJwt: bearerToken.split(".").length === 3,
    tokenExpired: tokenMeta.expired,
    tokenExpiresInSeconds: tokenMeta.expiresInSeconds,
    queryKeys: Object.keys(options.query || {}),
    hasBody: options.body !== undefined,
  });

  let response = await $fetch.raw(`${baseUrl}${path}`, {
    method,
    headers,
    query: options.query,
    body: options.body,
    ignoreResponseError: true,
  });

  if (
    !response.ok &&
    (response.status === 401 || response.status === 403) &&
    auth !== "none" &&
    authContext.user
  ) {
    try {
      const nextToken = await refreshSessionToken(event, authContext.user);
      headers = createHeaders(nextToken);
      response = await $fetch.raw(`${baseUrl}${path}`, {
        method,
        headers,
        query: options.query,
        body: options.body,
        ignoreResponseError: true,
      });
      debugProxyLog(event, "upstream.retry_with_refreshed_token", {
        traceId,
        method,
        path,
        statusCode: response.status,
      });
    } catch (refreshError: any) {
      debugProxyLog(event, "upstream.refresh_failed", {
        traceId,
        method,
        path,
        statusCode: Number(refreshError?.statusCode || 500),
        message: String(refreshError?.message || ""),
      });
    }
  }

  if (!response.ok) {
    const currentBearerToken = String(headers.Authorization || "").replace(
      /^Bearer\s+/i,
      "",
    );
    const currentTokenMeta = getTokenMeta(currentBearerToken);
    const message = pickErrorMessage(response._data, "上游服务返回异常");
    debugProxyLog(event, "upstream.response_error", {
      traceId,
      method,
      path,
      statusCode: response.status,
      message,
    });
    throw createError({
      statusCode: response.status,
      statusMessage: `Upstream_${response.status}`,
      message,
      data: {
        traceId,
        path,
        method,
        auth,
        hasAuthorization: Boolean(headers.Authorization),
        hasCookieForwarded: Boolean(headers.Cookie),
        cookieLength: incomingCookie.length,
        tokenLength: currentBearerToken.length,
        tokenLooksJwt: currentBearerToken.split(".").length === 3,
        tokenExpired: currentTokenMeta.expired,
        tokenExpiresInSeconds: currentTokenMeta.expiresInSeconds,
      },
    });
  }
  debugProxyLog(event, "upstream.response_ok", {
    traceId,
    method,
    path,
    statusCode: response.status,
    contentType: response.headers.get("content-type") || "",
  });
  return response._data as T;
};
