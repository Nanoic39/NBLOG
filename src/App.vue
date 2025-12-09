<template>
  <div class="app">
    <TopBar />
    <div class="main-container">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>
    <Sidebar class="sidebar-fixed" />
  </div>
</template>

<script setup>
import TopBar from "@/components/TopBar.vue";
import Sidebar from "@/components/Sidebar.vue";
</script>

<style>
html,
body,
#app {
  height: 100%;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell,
    "Noto Sans", "Helvetica Neue", Arial;
}
.app {
  min-height: 100%;
}
.main-container {
  width: var(--content-w);
  /* height: 100vh; */
  margin: var(--gap) auto;
  padding: 16px;
  background: var(--panel);
  border-radius: 12px;
  min-height: 480px;
}
.sidebar-fixed {
  position: fixed;
  width: 320px;
  left: calc(50% + (var(--content-w) / 2) + var(--gap));
  top: calc(var(--topbar-h) + var(--gap));
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
@media (max-width: 1899px) {
  .sidebar-fixed {
    display: none;
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
