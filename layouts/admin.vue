<template>
  <div class="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-[#0f172a] dark:via-[#101828] dark:to-[#111827]">
    <div class="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_35%)]"></div>
    <div class="relative flex min-h-screen">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        @click="isMobileMenuOpen = false"
      ></div>
      <aside
        :class="[
          'fixed lg:static z-40 inset-y-0 left-0 border-r border-white/50 dark:border-white/10 bg-white/70 dark:bg-[#111827]/75 backdrop-blur-xl transition-all duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64',
        ]"
      >
        <div class="h-16 px-4 flex items-center justify-between border-b border-white/70 dark:border-white/10">
          <NuxtLink
            to="/admin/dashboard"
            class="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate"
          >
            {{ isCollapsed ? "NB" : "NBLOG 控制台" }}
          </NuxtLink>
          <button
            class="hidden lg:inline-flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
            @click="isCollapsed = !isCollapsed"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <nav class="p-3 space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
            active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
            exact-active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
            @click="isMobileMenuOpen = false"
          >
            <span v-html="item.icon" class="w-4 h-4"></span>
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </aside>
      <main class="flex-1 min-w-0 lg:ml-0">
        <header class="h-16 px-4 lg:px-6 border-b border-white/70 dark:border-white/10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
              @click="isMobileMenuOpen = true"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-base font-medium text-slate-900 dark:text-slate-100">站长管理后台</h1>
          </div>
          <NuxtLink
            to="/"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
          >
            返回站点
          </NuxtLink>
        </header>
        <div class="p-4 lg:p-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isMobileMenuOpen = ref(false);
const isCollapsed = ref(false);

const menuItems = [
  {
    label: "控制台概览",
    to: "/admin/dashboard",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z"/></svg>',
  },
  {
    label: "系统管理",
    to: "/admin/dashboard/system",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1 1 0 011.35-.936l1.11.417a1 1 0 00.95-.083l.965-.579a1 1 0 011.37.366l.5.866a1 1 0 00.787.5l1.002.12a1 1 0 01.877 1.154l-.171.99a1 1 0 00.225.865l.66.792a1 1 0 010 1.282l-.66.792a1 1 0 00-.225.865l.171.99a1 1 0 01-.877 1.154l-1.002.12a1 1 0 00-.787.5l-.5.866a1 1 0 01-1.37.366l-.965-.579a1 1 0 00-.95-.083l-1.11.417a1 1 0 01-1.35-.936v-1.16a1 1 0 00-.486-.857l-.99-.59a1 1 0 010-1.716l.99-.59a1 1 0 00.486-.857v-1.16z"/></svg>',
  },
  {
    label: "文章管理",
    to: "/admin/dashboard/posts",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 17A2.5 2.5 0 014 14.5v-10A2.5 2.5 0 016.5 2H20v15M8 7h8M8 11h8"/></svg>',
  },
  {
    label: "标签管理",
    to: "/admin/dashboard/tags",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M3 11l8.586 8.586a2 2 0 002.828 0l6.172-6.172a2 2 0 000-2.828L12 2H5a2 2 0 00-2 2v7z"/></svg>',
  },
];
</script>
