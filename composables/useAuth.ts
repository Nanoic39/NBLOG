export const useAuth = () => {
  const config = useRuntimeConfig()
  const backendBaseUrl = String(config.public.backendBaseUrl || '').replace(/\/+$/, '')

  const parseUser = (response: any) => {
    if (!response) return null
    if (response.user !== undefined) return response.user
    if (response.data !== undefined) return response.data
    return response
  }

  const { data: user, refresh } = useFetch('/api/auth/user', {
    baseURL: backendBaseUrl || undefined,
    credentials: 'include',
    key: 'auth-user',
    transform: parseUser
  })
  
  const login = () => {
    const loginUrl = `${backendBaseUrl}/api/auth/login`
    window.location.href = backendBaseUrl ? loginUrl : '/api/auth/login'
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      baseURL: backendBaseUrl || undefined,
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
