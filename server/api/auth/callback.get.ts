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
      statusMessage: errorDescription || `OAuth authorize failed: ${error}`
    })
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing authorization code'
    })
  }

  if (!storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session expired or cookie blocked. Please try logging in again.'
    })
  }

  if (state && state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid state (CSRF protection failed)'
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
        statusMessage: 'Token exchange failed: access_token missing'
      })
    }
    
    // Fetch user info
    const userInfoResponse = await $fetch(`${config.public.oauthApiBaseUrl}/api/user/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }) as Record<string, any>
    const userInfo = unwrap<Record<string, any>>(userInfoResponse) || {}
    
    // Set user session cookie
    // Simple base64 encoding for now. In production, use encryption.
    const isAdmin = config.adminEmail && userInfo.email === config.adminEmail
    const sessionObj = { ...userInfo, access_token, role: isAdmin ? 'admin' : 'user' }
    const sessionData = JSON.stringify(sessionObj)
    const sessionCookie = Buffer.from(sessionData).toString('base64')
    
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
      statusMessage: 'Authentication failed'
    })
  }
})
