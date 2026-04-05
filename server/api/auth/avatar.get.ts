import { defineEventHandler, createError, getRequestHeader } from "h3";
import { getSessionUser } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const user = getSessionUser(event);
  const baseUrl = String(config.public.backendBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  const debugRaw = String((config as any).debugProxyLog || "")
    .trim()
    .toLowerCase();
  const debugEnabled =
    ["1", "true", "on", "yes"].includes(debugRaw) ||
    ["1", "true", "on", "yes"].includes(
      String((config.public as any)?.debugProxyLog || "")
        .trim()
        .toLowerCase(),
    );
  const traceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const log = (stage: string, payload: Record<string, any>) => {
    if (!debugEnabled) return;
    try {
      console.info(
        `[NBLOG_AVATAR][${traceId}][${stage}] ${JSON.stringify(payload)}`,
      );
    } catch {
      console.info(`[NBLOG_AVATAR][${traceId}][${stage}]`, payload);
    }
  };

  if (!user) {
    log("avatar.missing_user", {
      hasUser: false,
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "未登录",
    });
  }

  if (!user.access_token) {
    log("avatar.missing_token", { hasUser: true, hasAccessToken: false });
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "缺少访问令牌，请重新登录",
    });
  }

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "AvatarUpstreamConfigMissing",
      message: "头像服务地址未配置",
    });
  }

  const cleanBaseUrl = baseUrl;
  let targetUrl = "";
  let pictureRaw = String(user.picture || "").trim();
  const incomingCookie = String(getRequestHeader(event, "cookie") || "").trim();
  const yunaBase = String(
    (config.public as any).yunaCoreApiBaseUrl || config.public.oauthApiBaseUrl || "",
  )
    .trim()
    .replace(/\/+$/, "");

  if (yunaBase) {
    try {
      const upstream: unknown = await $fetch(`${yunaBase}/api/user/oauth2/userinfo`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const payload: Record<string, any> =
        upstream &&
        typeof upstream === "object" &&
        "data" in (upstream as Record<string, unknown>)
          ? ((upstream as { data?: Record<string, any> }).data ?? {})
          : ((upstream as Record<string, any>) ?? {});
      const latestPicture = String(
        payload?.picture ?? payload?.avatar ?? payload?.headImg ?? "",
      ).trim();
      if (latestPicture) {
        pictureRaw = latestPicture;
      }
      log("avatar.picture_refresh", {
        yunaBase,
        hasLatestPicture: Boolean(latestPicture),
      });
    } catch (error) {
      const current = error as any;
      log("avatar.picture_refresh_failed", {
        yunaBase,
        statusCode: Number(current?.statusCode || 0),
        message: String(current?.message || ""),
      });
    }
  }

  if (!pictureRaw) {
    log("avatar.missing_picture", {
      hasUser: Boolean(user),
      hasPicture: false,
      hasYunaBase: Boolean(yunaBase),
    });
    throw createError({
      statusCode: 404,
      statusMessage: "AvatarNotFound",
      message: "未找到头像",
    });
  }

  if (pictureRaw.startsWith("http://") || pictureRaw.startsWith("https://")) {
    const apiOrigin = new URL(cleanBaseUrl).origin;
    const pictureUrl = new URL(pictureRaw);
    targetUrl = `${apiOrigin}${pictureUrl.pathname}${pictureUrl.search}`;
  } else if (pictureRaw.startsWith("/file/")) {
    targetUrl = `${cleanBaseUrl}/api${pictureRaw}`;
  } else if (pictureRaw.startsWith("/api/file/")) {
    targetUrl = `${cleanBaseUrl}${pictureRaw}`;
  } else {
    targetUrl = pictureRaw.startsWith("/")
      ? `${cleanBaseUrl}${pictureRaw}`
      : `${cleanBaseUrl}/${pictureRaw}`;
  }

  if (targetUrl.includes("?")) {
    if (!targetUrl.includes("inline=true")) {
      targetUrl += "&inline=true";
    }
  } else {
    targetUrl += "?inline=true";
  }
  log("avatar.upstream_request", {
    baseUrl: cleanBaseUrl,
    targetUrl,
    pictureRaw,
    hasAccessToken: true,
    hasCookieForwarded: Boolean(incomingCookie),
    cookieLength: incomingCookie.length,
  });

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        access_token: String(user.access_token),
        "X-Access-Token": String(user.access_token),
        ...(incomingCookie ? { Cookie: incomingCookie } : {}),
        Accept: "image/*,*/*;q=0.8",
      },
    });

    const bytes = Buffer.from(await response.arrayBuffer());

    if (!response.ok) {
      const errorText = bytes.toString("utf-8");
      log("avatar.upstream_error", {
        statusCode: response.status,
        statusText: response.statusText || "",
        errorText: errorText.slice(0, 500),
        bytes: bytes.length,
      });

      throw createError({
        statusCode: response.status,
        statusMessage: `AvatarUpstream_${response.status}`,
        message: errorText || "上游服务返回异常",
      });
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
      setHeader(event, "Content-Type", contentType);
    } else {
      setHeader(event, "Content-Type", "image/jpeg");
    }

    setHeader(event, "Content-Length", bytes.length);

    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
    log("avatar.upstream_ok", {
      statusCode: response.status,
      contentType: contentType || "image/jpeg",
      contentLength: bytes.length,
    });
    return bytes;
  } catch (error) {
    const current = error as any;
    if (current?.statusCode) {
      throw current;
    }
    log("avatar.proxy_exception", {
      message: String(current?.message || ""),
    });
    throw createError({
      statusCode: 500,
      statusMessage: "AvatarProxyFailed",
      message: "获取头像失败",
    });
  }
});
