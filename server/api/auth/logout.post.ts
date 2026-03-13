export default defineEventHandler(async (event) => {
  deleteCookie(event, 'user_session')
  return { success: true }
})
