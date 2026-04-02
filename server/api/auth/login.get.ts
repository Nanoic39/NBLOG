export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { oauthAuthBaseUrl, oauthClientId, oauthRedirectUri } = config.public
  
  if (!oauthAuthBaseUrl || !oauthClientId || !oauthRedirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OAuth 配置缺失，请检查环境变量'
    })
  }

  const state = Math.random().toString(36).substring(7)
  // Store state in a cookie to verify later
  setCookie(event, 'oauth_state', state, { 
    httpOnly: true, 
    maxAge: 600, // 10 minutes
    path: '/',
    sameSite: 'lax'
  })
  
  const params = new URLSearchParams({
    client_id: oauthClientId,
    redirect_uri: oauthRedirectUri,
    response_type: 'code',
    scope: 'all',
    state
  })
  
  return sendRedirect(event, `${oauthAuthBaseUrl}/oauth/authorize?${params.toString()}`)
})
