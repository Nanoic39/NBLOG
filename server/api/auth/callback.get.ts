export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const { code, state } = query
  const storedState = getCookie(event, 'oauth_state')
  
  if (!code || !state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing code or state'
    })
  }

  if (!storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session expired or cookie blocked. Please try logging in again.'
    })
  }
  
  if (state !== storedState) {
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
        code: code as string,
        client_id: config.public.oauthClientId,
        client_secret: config.oauthClientSecret,
        redirect_uri: config.public.oauthRedirectUri
      }).toString()
    })
    
    const { access_token } = tokenResponse as { access_token: string }
    
    // Fetch user info
    const userInfo = await $fetch(`${config.public.oauthApiBaseUrl}/api/user/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }) as Record<string, any>
    
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
