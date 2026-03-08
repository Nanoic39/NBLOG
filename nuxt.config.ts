// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap'
        }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@bg-dev/nuxt-naiveui'
  ],
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/main.css'
  ],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
  naiveui: {
    colorModePreference: 'light',
    iconSize: 18,
    themeConfig: {
      shared: {
        common: {
          primaryColor: '#BFE9FF',
          primaryColorHover: '#A0D8FF',
          primaryColorPressed: '#8CC4FF',
          primaryColorSuppl: '#BFE9FF',
          infoColor: '#BFE9FF',
          successColor: '#18a058',
          warningColor: '#f0a020',
          errorColor: '#d03050',
          textColorBase: '#2A2E33',
          textColor1: '#2A2E33',
          textColor2: '#6B7280',
          textColor3: '#9CA3AF',
          bodyColor: '#F9FAFB',
          cardColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }
    }
  }
})
