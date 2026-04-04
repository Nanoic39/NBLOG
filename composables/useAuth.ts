export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = String(config.public.backendBaseUrl || '').trim().replace(/\/+$/, '')
  const withApiBase = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath
  }

  const parseUser = (response: any) => {
    if (!response) return null
    if (response.user !== undefined) return response.user
    if (response.data !== undefined) return response.data
    return response
  }

  const { data: user, refresh } = useFetch(withApiBase('/api/auth/user'), {
    credentials: 'include',
    key: 'auth-user',
    transform: parseUser
  })
  
  const login = () => {
    window.location.href = withApiBase('/api/auth/login')
  }
  
  const logout = async () => {
    await $fetch(withApiBase('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include'
    })
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
