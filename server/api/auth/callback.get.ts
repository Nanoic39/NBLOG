export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const unwrap = <T>(value: T | { data?: T } | null | undefined): T | null => {
    if (!value) return null
    if (typeof value === 'object' && 'data' in (value as Record<string, unknown>)) {
      return ((value as { data?: T }).data ?? null) as T | null
    }
    return value as T
  }
  const query = getQuery(event)
  const error = typeof query.error === 'string' ? query.error : ''
  const errorDescription = typeof query.error_description === 'string' ? query.error_description : ''
  const codeRaw = Array.isArray(query.code) ? query.code[0] : query.code
  const stateRaw = Array.isArray(query.state) ? query.state[0] : query.state
  const code = typeof codeRaw === 'string' ? codeRaw : ''
  const state = typeof stateRaw === 'string' ? stateRaw : ''
  const storedState = getCookie(event, 'oauth_state')
  
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: errorDescription || `OAuth 授权失败：${error}`
    })
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少授权码（code）'
    })
  }

  if (storedState && state && state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: '登录状态校验失败（state 不匹配）'
    })
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await $fetch(`${config.public.oauthApiBaseUrl}/api/user/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.public.oauthClientId,
        client_secret: config.oauthClientSecret,
        redirect_uri: config.public.oauthRedirectUri
      }).toString()
    })
    
    const tokenPayload = unwrap<Record<string, any>>(tokenResponse as Record<string, any>) || {}
    const access_token =
      String(tokenPayload.access_token || tokenPayload.token || tokenPayload.accessToken || '').trim()
    if (!access_token) {
      throw createError({
        statusCode: 502,
        statusMessage: '令牌交换失败：缺少 access_token'
      })
    }
    
    // Fetch user info
    const userInfoResponse = await $fetch(`${config.public.oauthApiBaseUrl}/api/user/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }) as Record<string, any>
    const userInfo = unwrap<Record<string, any>>(userInfoResponse) || {}
    
    const adminEmail = String(config.adminEmail || '').trim().toLowerCase()
    const currentEmail = String(userInfo.email || '').trim().toLowerCase()
    const upstreamRole = String(
      userInfo.role ??
      userInfo.userRole ??
      userInfo.roles?.[0] ??
      ''
    ).trim().toLowerCase()
    const isAdmin = upstreamRole === 'admin' || (Boolean(adminEmail) && currentEmail === adminEmail)
    const sessionObj = {
      i: userInfo.id ?? userInfo.userId ?? userInfo.uid ?? '',
      n: userInfo.name ?? userInfo.nickname ?? userInfo.username ?? '',
      u: userInfo.username ?? userInfo.name ?? '',
      e: userInfo.email ?? '',
      p: userInfo.picture ?? userInfo.avatar ?? userInfo.headImg ?? '',
      t: access_token,
      r: isAdmin ? 'admin' : 'user'
    }
    const sessionData = JSON.stringify(sessionObj)
    const sessionCookie = Buffer.from(sessionData)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
    if (sessionCookie.length > 3800) {
      throw createError({
        statusCode: 500,
        statusMessage: '登录会话超长，请联系管理员调整认证字段'
      })
    }
    
    setCookie(event, 'user_session', sessionCookie, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production'
    })
    
    // Clear state cookie
    deleteCookie(event, 'oauth_state', { path: '/' })
    
    return sendRedirect(event, '/')
  } catch (error) {
    console.error('OAuth Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '认证失败，请稍后重试'
    })
  }
})
