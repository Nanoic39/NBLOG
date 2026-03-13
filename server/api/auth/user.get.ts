export default defineEventHandler(async (event) => {
  const sessionCookie = getCookie(event, 'user_session')
  
  if (!sessionCookie) {
    return { user: null }
  }
  
  try {
    const sessionData = Buffer.from(sessionCookie, 'base64').toString('utf-8')
    const user = JSON.parse(sessionData)
    return { user }
  } catch (e) {
    return { user: null }
  }
})
