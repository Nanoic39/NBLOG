// composables/useDarkMode.ts
export const useDarkMode = () => {
  const isDark = useState<boolean>('darkMode', () => false)

  const applyDarkMode = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const initDarkMode = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('darkMode')
      isDark.value = saved === 'true'
      applyDarkMode(isDark.value)
    }
  }

  const toggleDark = () => {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('darkMode', String(isDark.value))
      applyDarkMode(isDark.value)
    }
  }

  return { isDark, toggleDark, initDarkMode }
}
