export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
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
        `[NBLOG_OAUTH][${traceId}][${stage}] ${JSON.stringify(payload)}`,
      );
    } catch {
      console.info(`[NBLOG_OAUTH][${traceId}][${stage}]`, payload);
    }
  };
  const unwrap = <T>(value: T | { data?: T } | null | undefined): T | null => {
    if (!value) return null;
    if (
      typeof value === "object" &&
      "data" in (value as Record<string, unknown>)
    ) {
      return ((value as { data?: T }).data ?? null) as T | null;
    }
    return value as T;
  };
  const query = getQuery(event);
  const error = typeof query.error === "string" ? query.error : "";
  const errorDescription =
    typeof query.error_description === "string" ? query.error_description : "";
  const codeRaw = Array.isArray(query.code) ? query.code[0] : query.code;
  const stateRaw = Array.isArray(query.state) ? query.state[0] : query.state;
  const code = typeof codeRaw === "string" ? codeRaw : "";
  const state = typeof stateRaw === "string" ? stateRaw : "";
  const storedState = getCookie(event, "oauth_state");

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "OAuthAuthorizeFailed",
      message: errorDescription || `OAuth 授权失败：${error}`,
    });
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "OAuthCodeMissing",
      message: "缺少授权码（code）",
    });
  }

  if (storedState && state && state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: "OAuthStateMismatch",
      message: "登录状态校验失败（state 不匹配）",
    });
  }

  try {
    log("oauth.callback_start", {
      oauthApiBaseUrl: String(config.public.oauthApiBaseUrl || ""),
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasStoredState: Boolean(storedState),
    });
    const tokenResponse = await $fetch(
      `${config.public.oauthApiBaseUrl}/api/user/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: config.public.oauthClientId,
          client_secret: config.oauthClientSecret,
          redirect_uri: config.public.oauthRedirectUri,
        }).toString(),
      },
    );

    const tokenPayload =
      unwrap<Record<string, any>>(tokenResponse as Record<string, any>) || {};
    const access_token = String(
      tokenPayload.access_token ||
        tokenPayload.token ||
        tokenPayload.accessToken ||
        "",
    )
      .trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^"|"$/g, "")
      .trim();
    const refresh_token = String(
      tokenPayload.refresh_token ||
        tokenPayload.refreshToken ||
        tokenPayload.r_token ||
        "",
    )
      .trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^"|"$/g, "")
      .trim();
    log("oauth.token_response", {
      hasAccessToken: Boolean(access_token),
      hasRefreshToken: Boolean(refresh_token),
      tokenPayloadKeys: Object.keys(tokenPayload || {}),
    });
    if (!access_token) {
      throw createError({
        statusCode: 502,
        statusMessage: "OAuthTokenMissing",
        message: "令牌交换失败：缺少 access_token",
      });
    }

    const userInfoResponse = (await $fetch(
      `${config.public.oauthApiBaseUrl}/api/user/oauth2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )) as Record<string, any>;
    const userInfo = unwrap<Record<string, any>>(userInfoResponse) || {};

    const adminEmail = String(config.adminEmail || "")
      .trim()
      .toLowerCase();
    const currentEmail = String(userInfo.email || "")
      .trim()
      .toLowerCase();
    const upstreamRole = String(
      userInfo.role ?? userInfo.userRole ?? userInfo.roles?.[0] ?? "",
    )
      .trim()
      .toLowerCase();
    const isAdmin =
      upstreamRole === "admin" ||
      (Boolean(adminEmail) && currentEmail === adminEmail);
    log("oauth.userinfo_response", {
      email: currentEmail,
      upstreamRole,
      resolvedAdmin: isAdmin,
    });
    const sessionObj = {
      i: userInfo.id ?? userInfo.userId ?? userInfo.uid ?? "",
      n: userInfo.name ?? userInfo.nickname ?? userInfo.username ?? "",
      u: userInfo.username ?? userInfo.name ?? "",
      e: userInfo.email ?? "",
      p: userInfo.picture ?? userInfo.avatar ?? userInfo.headImg ?? "",
      t: access_token,
      f: refresh_token,
      r: isAdmin ? "admin" : "user",
    };
    const sessionData = JSON.stringify(sessionObj);
    const sessionCookie = Buffer.from(sessionData)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    if (sessionCookie.length > 3800) {
      throw createError({
        statusCode: 500,
        statusMessage: "SessionCookieTooLarge",
        message: "登录会话超长，请联系管理员调整认证字段",
      });
    }

    setCookie(event, "user_session", sessionCookie, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
      // secure: process.env.NODE_ENV === 'production'
    });

    deleteCookie(event, "oauth_state", { path: "/" });
    log("oauth.session_written", {
      role: sessionObj.r,
      email: sessionObj.e,
      hasPicture: Boolean(String(sessionObj.p || "").trim()),
    });
    return sendRedirect(event, "/");
  } catch (error) {
    const current = error as any;
    log("oauth.callback_error", {
      statusCode: Number(current?.statusCode || 500),
      statusMessage: String(current?.statusMessage || ""),
      message: String(current?.message || ""),
    });
    throw createError({
      statusCode: Number(current?.statusCode || 500),
      statusMessage: String(current?.statusMessage || "OAuthCallbackFailed"),
      message: String(current?.message || "认证失败，请稍后重试"),
    });
  }
});
