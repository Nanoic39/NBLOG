export const useAuth = () => {
  const parseUser = (response: any) => {
    if (!response) return null
    if (response.user !== undefined) return response.user
    if (response.data !== undefined) return response.data
    return response
  }

  const { data: user, refresh } = useFetch('/api/auth/user', {
    credentials: 'include',
    key: 'auth-user',
    transform: parseUser
  })
  
  const login = () => {
    window.location.href = '/api/auth/login'
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', {
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
    const roleCandidates = [
      (user.value as any)?.role,
      (user.value as any)?.userRole,
      Array.isArray((user.value as any)?.roles) ? (user.value as any).roles[0] : undefined,
    ]
      .map((item: any) => String(item || '').trim().toLowerCase())
      .filter(Boolean)
    return roleCandidates.some((role: string) => role.includes('admin'))
  })

  return {
    user,
    isAdmin,
    login,
    logout,
    fetchUser
  }
}
