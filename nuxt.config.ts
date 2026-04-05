// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [
      {
        name: "nb-app-manifest-fallback",
        enforce: "post",
        resolveId(id) {
          if (id === "#app-manifest") return "\0nb:#app-manifest";
          return null;
        },
        load(id) {
          if (id === "\0nb:#app-manifest") {
            return "export default {}";
          }
          return null;
        },
      },
    ],
  },
  hooks: {
    "pages:extend"(pages) {
      pages.push({
        name: "not-found",
        path: "/:pathMatch(.*)*",
        file: "~/pages/not-found.vue",
      });
    },
  },
  devServer: {
    port: 3030,
    host: "0.0.0.0",
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
    head: {
      title: "NBLOG",
      htmlAttrs: {
        lang: "zh-CN",
      },
      meta: [
        { "http-equiv": "Content-Language", content: "zh-CN" },
        { name: "google", content: "notranslate" },
      ],
      script: [
        {
          // 防闪烁：在页面渲染前读取 localStorage，提前挂载 dark class
          innerHTML: `(function(){var d=localStorage.getItem('darkMode');if(d==='true')document.documentElement.classList.add('dark')})()`,
          type: "text/javascript",
        },
      ],
      link: [],
    },
  },
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    // Private keys are only available on the server
    oauthClientSecret: process.env.NUXT_OAUTH_CLIENT_SECRET,
    sessionSecret: process.env.NUXT_SESSION_SECRET,
    adminEmail: process.env.NUXT_ADMIN_EMAIL,
    debugProxyLog: process.env.NUXT_DEBUG_PROXY_LOG,

    // Public keys that are exposed to the client
    public: {
      backendBaseUrl: process.env.NUXT_PUBLIC_BACKEND_BASE_URL,
      oauthClientId: process.env.NUXT_OAUTH_CLIENT_ID,
      oauthRedirectUri: process.env.NUXT_OAUTH_REDIRECT_URI,
      oauthAuthBaseUrl: process.env.NUXT_OAUTH_AUTH_BASE_URL,
      oauthApiBaseUrl: process.env.NUXT_OAUTH_API_BASE_URL,
      yunaCoreApiBaseUrl: process.env.NUXT_PUBLIC_YUNA_CORE_API_BASE_URL,
      debugProxyLog: process.env.NUXT_PUBLIC_DEBUG_PROXY_LOG,
    },
  },
  devtools: { enabled: true },
  modules: ["@bg-dev/nuxt-naiveui"],
  css: ["~/assets/css/tailwind.css", "~/assets/css/main.css"],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },
  naiveui: {
    colorModePreference: "light",
    iconSize: 18,
    themeConfig: {
      // 日间模式主题（保持原有）
      shared: {
        common: {
          primaryColor: "#BFE9FF",
          primaryColorHover: "#A0D8FF",
          primaryColorPressed: "#8CC4FF",
          primaryColorSuppl: "#BFE9FF",
          infoColor: "#BFE9FF",
          successColor: "#18a058",
          warningColor: "#f0a020",
          errorColor: "#d03050",
          textColorBase: "#2A2E33",
          textColor1: "#2A2E33",
          textColor2: "#6B7280",
          textColor3: "#9CA3AF",
          bodyColor: "#F9FAFB",
          cardColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          fontFamily: "var(--font-sans)",
        },
      },
      // 夜间模式主题（深灰色系）
      dark: {
        common: {
          primaryColor: "#BFE9FF",
          primaryColorHover: "#A0D8FF",
          primaryColorPressed: "#8CC4FF",
          primaryColorSuppl: "#BFE9FF",
          infoColor: "#BFE9FF",
          successColor: "#18a058",
          warningColor: "#f0a020",
          errorColor: "#d03050",
          textColorBase: "#e0e0e0",
          textColor1: "#e0e0e0",
          textColor2: "#9ca3af",
          textColor3: "#6b7280",
          bodyColor: "#1a1a1a",
          cardColor: "#242424",
          borderColor: "#333333",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
    },
  },
});
