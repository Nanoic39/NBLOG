<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <NuxtLoadingIndicator color="#38bdf8" :height="3" :throttle="0" />
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 10 }" />
    </NuxtLayout>
    <Transition name="route-loading-fade">
      <div v-if="isRouteLoading" class="nb-route-loading">
        <div class="nb-route-loading-spinner"></div>
      </div>
    </Transition>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from "naive-ui";
import { ref } from "vue";

const { user } = useAuth()
// fetchUser is called automatically by useFetch in useAuth
const isRouteLoading = ref(false);
const nuxtApp = useNuxtApp();
if (import.meta.client) {
  const stopLoading = () => {
    window.setTimeout(() => {
      isRouteLoading.value = false;
    }, 120);
  };
  nuxtApp.hook("page:start", () => {
    isRouteLoading.value = true;
  });
  nuxtApp.hook("page:finish", stopLoading);
}

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#BFE9FF",
    primaryColorHover: "#A0D8FF",
    primaryColorPressed: "#8CC4FF",
    primaryColorSuppl: "#BFE9FF",
    bodyColor: "#F9FAFB",
    cardColor: "#FFFFFF",
    textColorBase: "#2A2E33",
    textColor1: "#2A2E33",
    textColor2: "#6B7280",
    textColor3: "#9CA3AF",
    borderColor: "#E5E7EB",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  Card: {
    borderRadius: "8px",
    borderColor: "#E5E7EB",
  },
  Button: {
    borderRadiusMedium: "6px",
    textColorPrimary: "#2A2E33",
    colorHoverPrimary: "#E9E0FF", // 辅助色：浅紫
    colorPressedPrimary: "#BFE9FF",
    borderPrimary: "1px solid #BFE9FF",
    borderHoverPrimary: "1px solid #E9E0FF",
  },
};
</script>
<style scoped>
.route-loading-fade-enter-active,
.route-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.route-loading-fade-enter-from,
.route-loading-fade-leave-to {
  opacity: 0;
}

.nb-route-loading {
  position: fixed;
  inset: 0;
  z-index: 120;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.55),
    rgba(226, 232, 240, 0.45)
  );
  backdrop-filter: blur(2px);
}

:global(html.dark) .nb-route-loading {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.5),
    rgba(30, 41, 59, 0.4)
  );
}

.nb-route-loading-spinner {
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top-color: #0ea5e9;
  animation: nb-route-spin 0.72s linear infinite;
}

@keyframes nb-route-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
