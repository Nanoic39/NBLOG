export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser, isAdmin } = useAuth()
  
  // 如果用户状态尚未加载，尝试加载
  if (!user.value) {
    await fetchUser()
  }
  
  // 如果加载后仍未登录或不是管理员，重定向到首页
  if (!user.value || !isAdmin.value) {
    return navigateTo('/')
  }
})
