<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 10 }" />
    </NuxtLayout>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from "naive-ui";

const { user } = useAuth()
// fetchUser is called automatically by useFetch in useAuth

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
