<template>
  <div class="archive">
    <div class="banner">
      <div class="banner-inner">
        <h1 class="title">归档</h1>
        <p class="sub">归档页正在建设中，稍后上线</p>
      </div>
    </div>
    <div class="actions">
      <RouterLink class="btn" :to="{ name: 'home' }">返回首页</RouterLink>
      <RouterLink class="btn outline" :to="{ name: 'about' }">前往关于</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.banner {
  position: relative;
  height: 240px;
  border-radius: 12px;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(16, 185, 129, 0.18)), var(--panel);
  overflow: hidden;
  margin-bottom: 16px;
}
.banner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 12px 12px;
}
.banner-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}
.title {
  font-size: 24px;
  margin: 0 0 8px;
}
.sub {
  margin: 0;
  color: var(--muted);
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color-active);
}
.btn.outline {
  background: transparent;
}
</style>
