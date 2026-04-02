import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const sessionCookie = getCookie(event, 'user_session')

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录或登录已失效'
    })
  }

  let user: any = null
  try {
    const sessionData = Buffer.from(sessionCookie, 'base64').toString('utf-8')
    user = JSON.parse(sessionData)
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: '会话无效，请重新登录'
    })
  }

  if (!user || !user.picture) {
    throw createError({
      statusCode: 404,
      statusMessage: '未找到头像'
    })
  }
  
  // If no access token in session, we can't proxy protected resource
  if (!user.access_token) {
     throw createError({
      statusCode: 401,
      statusMessage: '缺少访问令牌，请重新登录'
    })
  }

  // If picture is already a full URL, redirect to it (unless it needs token proxying, but usually full URLs are public)
  if (user.picture.startsWith('http')) {
    return sendRedirect(event, user.picture)
  }

  // Construct API URL
  const baseUrl = config.public.oauthApiBaseUrl || ''
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  let targetUrl = ''

  if (user.picture.startsWith('/file/')) {
    // 默认情况：/api + /file/... = /api/file/...
    targetUrl = `${cleanBaseUrl}/api${user.picture}`

    // 特殊处理：如果原始路径是 /file/download/... 但目标需要 /api/file/file/download/...
    // 即需要在 /api 和 /file/download 之间再插一个 /file
    if (user.picture.startsWith('/file/download/')) {
       targetUrl = `${cleanBaseUrl}/api/file${user.picture}`
    }
  } else if (user.picture.startsWith('/api/file/')) {
    // 如果已经是 /api/file 开头，直接拼接
    targetUrl = `${cleanBaseUrl}${user.picture}`
  } else {
    // 处理可能的相对路径问题
    targetUrl = user.picture.startsWith('/') 
      ? `${cleanBaseUrl}${user.picture}`
      : `${cleanBaseUrl}/${user.picture}`
  }
  
  // 确保URL中包含 inline=true 参数
  if (targetUrl.includes('?')) {
    if (!targetUrl.includes('inline=true')) {
        targetUrl += '&inline=true'
    }
  } else {
    targetUrl += '?inline=true'
  }

  try {
    // Proxy request with Authorization header
    const response = await $fetch.raw(targetUrl, {
      headers: {
        Authorization: `Bearer ${user.access_token}`
      },
      responseType: 'arrayBuffer',
      ignoreResponseError: true 
    })

    if (!response.ok) {
        console.error('Avatar fetch failed:', response.status, response.statusText)
        // 尝试解析错误信息
        const errorText = new TextDecoder().decode(response._data as ArrayBuffer)
        console.error('Error body:', errorText)
        
        throw createError({
            statusCode: response.status,
            statusMessage: '上游服务返回异常'
        })
    }

    // Forward content type
    const contentType = response.headers.get('content-type')
    if (contentType) {
      setHeader(event, 'Content-Type', contentType)
    } else {
        // 如果后端没有返回 Content-Type，我们尝试猜测或者是默认图片
        // 通常图片应该是 image/jpeg, image/png 等
        setHeader(event, 'Content-Type', 'image/jpeg') 
    }
    
    // 强制设置 Content-Length (如果能获取到)
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
        setHeader(event, 'Content-Length', Number(contentLength))
    }

    // 禁用缓存，防止调试时看到旧的错误图片
    // setHeader(event, 'Cache-Control', 'private, max-age=3600')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    
    // 直接返回 Buffer 数据，而不是 response._data
    // $fetch.raw 的 response._data 在 arrayBuffer 模式下应该就是 ArrayBuffer
    // 但是为了保险，我们将其转换为 Node.js Buffer
    return Buffer.from(response._data as ArrayBuffer)
  } catch (error) {
    console.error('Avatar proxy error:', error)
    // Fallback to a default avatar or error
    throw createError({
      statusCode: 500,
      statusMessage: '获取头像失败'
    })
  }
})
