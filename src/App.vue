<template>
  <div class="app">
    <TopBar />
    <transition name="back">
      <button class="back" v-if="route.name === 'post'" @click="goBack">
        ← 返回
      </button>
    </transition>
  <div class="main-container">
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
  <Sidebar class="sidebar-fixed" />
  <div class="toc-fixed" v-if="route.name === 'post'">
    <TocAccordion />
  </div>
  <button
    class="to-top-float"
    v-show="showTop"
    :style="{ bottom: bottomOffset + 'px' }"
    @click="goTop"
    aria-label="回到顶部"
  >⬆️</button>
  <FooterBar />
</div>
</template>

<script setup>
import TopBar from "@/components/TopBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import FooterBar from "@/components/FooterBar.vue";
import TocAccordion from "@/components/TocAccordion.vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
function goBack() {
  const canBack = typeof window !== 'undefined' && window.history.length > 1;
  if (canBack) router.back();
  else router.push('/');
}

import { ref, onMounted, onBeforeUnmount } from 'vue';
const showTop = ref(false);
const bottomOffset = ref(90);
let tickingTop = false;
function onScrollTop() {
  if (tickingTop) return;
  tickingTop = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    showTop.value = y > 400;
    const doc = document.documentElement;
    const dist = doc.scrollHeight - (y + window.innerHeight);
    const extra = Math.max(0, 150 - dist);
    bottomOffset.value = 90 + extra;
    tickingTop = false;
  });
}
function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
onMounted(() => {
  window.addEventListener('scroll', onScrollTop, { passive: true });
  onScrollTop();
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollTop);
});
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
  font-family: "JetBrainsMonoNerdMono";
}
.app {
  min-height: 100%;
}
.back {
  position: fixed;
  left: calc(50% - (var(--content-w, 1200px) / 2) - 95px);
  top: calc(60px + 24px);
  z-index: 20;
  height: 50px;
  padding: 0 20px;
  border-radius: 8px;
  border: 0;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease;
}
.back:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
.back:active {
  transform: scale(0.98);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
}
.back:focus-visible {
  outline: 2px solid var(--theme-color-active);
  outline-offset: 2px;
}
.back-enter-active,
.back-leave-active {
  transition: transform 300ms ease, opacity 180ms ease;
}
.back-enter-from {
  transform: translateY(10px);
  opacity: 0;
}
.back-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.back-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.back-leave-to {
  transform: translateY(10px);
  opacity: 0;
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
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  padding: 16px;
}
.toc-fixed {
  position: fixed;
  width: 320px;
  left: calc(50% + (var(--content-w) / 2) + var(--gap));
  top: calc(var(--topbar-h) + var(--gap) + 400px);
  background: var(--panel);
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  padding: 16px;
  height: 470px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.toc-title {
  font-weight: 700;
}
@media (max-width: 1899px) {
  .sidebar-fixed {
    display: none;
  }
  .toc-fixed {
    display: none;
  }
  .back {
    display: none;
  }
}

.to-top-float {
  position: fixed;
  right: calc(50% - (var(--content-w) / 2) - 95px);
  bottom: 90px;
  z-index: 1002;
  height: 44px;
  width: 44px;
  border-radius: 999px;
  border: 1px solid var(--theme-color-border);
  background: rgba(0,0,0,0.06);
  color: var(--text);
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.18);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease;
}
.to-top-float:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
.to-top-float:active { transform: scale(0.98); box-shadow: 0 3px 8px rgba(0,0,0,0.18); }
@media (max-width: 1899px) {
  .to-top-float { display: none; }
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
