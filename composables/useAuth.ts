export const useAuth = () => {
  const { data: user, refresh } = useFetch('/api/auth/user', {
    key: 'auth-user',
    transform: (response: any) => response.user
  })
  
  const login = () => {
    window.location.href = '/api/auth/login'
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/')
  }
  
  const fetchUser = async () => {
    await refresh()
  }
  
  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  return {
    user,
    isAdmin,
    login,
    logout,
    fetchUser
  }
}
