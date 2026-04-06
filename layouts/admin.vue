<template>
  <div class="min-h-screen bg-[#f4f7fb] dark:bg-[#0b1220]">
    <div class="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(circle_at_8%_10%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_92%_4%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(99,102,241,0.12),transparent_42%)]"></div>
    <div class="relative flex min-h-screen">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-30 bg-slate-900/45 backdrop-blur-sm lg:hidden"
        @click="isMobileMenuOpen = false"
      ></div>
      <aside
        :class="[
          'fixed lg:sticky top-0 z-40 inset-y-0 left-0 h-screen border-r border-slate-200/70 dark:border-slate-800/90 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl transition-[width,transform] duration-300 ease-out flex flex-col shadow-xl shadow-slate-900/5 dark:shadow-none',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[92px]' : 'w-[286px]',
        ]"
      >
        <div class="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/90">
          <NuxtLink
            to="/admin/dashboard"
            class="text-base font-semibold text-slate-900 dark:text-slate-100 truncate tracking-wide"
          >
            {{ isCollapsed ? "NB" : "NBLOG 控制台" }}
          </NuxtLink>
          <button
            class="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="toggleCollapse"
            :aria-label="isCollapsed ? '展开菜单' : '收起菜单'"
          >
            <svg
              :class="[
                'w-4 h-4 transition-transform duration-300 ease-out',
                isCollapsed ? 'rotate-180' : 'rotate-0',
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <nav class="px-3 py-4 space-y-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            :title="isCollapsed ? item.label : ''"
            class="group relative flex items-center rounded-xl text-sm text-slate-700 dark:text-slate-200 transition-all duration-200"
            :class="[
              isCollapsed ? 'justify-center px-0 h-11' : 'gap-3 px-3 h-11',
              isItemActive(item.to) ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30 dark:shadow-sky-900/40' : 'hover:bg-slate-100 dark:hover:bg-slate-800/70',
            ]"
            @click="isMobileMenuOpen = false"
          >
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 transition-colors text-base"
              :class="isItemActive(item.to) ? 'bg-white/20 border-white/20 text-white' : ''"
            >{{ item.icon }}</span>
            <span
              v-if="!isCollapsed"
              class="truncate font-medium"
            >{{ item.label }}</span>
            <span
              v-if="!isCollapsed && isItemActive(item.to)"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"
            ></span>
          </NuxtLink>
        </nav>
      </aside>
      <main class="flex-1 min-w-0">
        <header class="h-16 px-4 lg:px-7 border-b border-slate-200/80 dark:border-slate-800/90 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-xl flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="isMobileMenuOpen = true"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ currentPageTitle }}</h1>
          </div>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 transition-colors bg-white dark:bg-slate-900"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回站点
          </NuxtLink>
        </header>
        <div class="p-4 lg:p-7">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const isMobileMenuOpen = ref(false);
const isCollapsed = ref(false);
const route = useRoute();
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const menuItems = [
  {
    label: "控制台概览",
    to: "/admin/dashboard",
    icon: "🏠",
  },
  {
    label: "系统管理",
    to: "/admin/dashboard/system",
    icon: "⚙️",
  },
  {
    label: "文章管理",
    to: "/admin/dashboard/posts",
    icon: "📝",
  },
  {
    label: "标签管理",
    to: "/admin/dashboard/tags",
    icon: "🏷️",
  },
];

const currentPageLabel = computed(() => {
  const path = String(route.path || "");
  const hit = menuItems.find((item) => path === item.to || path.startsWith(`${item.to}/`));
  return hit?.label || "后台";
});

const isItemActive = (to: string) => {
  const path = String(route.path || "");
  if (to === "/admin/dashboard") {
    return path === "/admin/dashboard";
  }
  return path === to || path.startsWith(`${to}/`);
};

const currentPageTitle = computed(() => {
  const path = String(route.path || "");
  if (path === "/admin/dashboard/posts/new") return "新建文章";
  if (/^\/admin\/dashboard\/posts\/[^/]+$/.test(path)) return "编辑文章";
  return currentPageLabel.value;
});
</script>
