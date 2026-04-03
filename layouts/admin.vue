<template>
  <div class="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-[#0f172a] dark:via-[#101828] dark:to-[#111827]">
    <div class="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_35%)]"></div>
    <div class="relative flex min-h-screen">
      <aside class="w-64 shrink-0 border-r border-white/50 dark:border-white/10 bg-white/70 dark:bg-[#111827]/75 backdrop-blur-xl">
        <div class="h-16 px-5 flex items-center border-b border-white/70 dark:border-white/10">
          <NuxtLink to="/admin/dashboard" class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            NBLOG 控制台
          </NuxtLink>
        </div>
        <nav class="p-3 space-y-1">
          <NuxtLink
            to="/admin/dashboard"
            class="block px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
            active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
            exact-active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
          >
            控制台概览
          </NuxtLink>
          <NuxtLink
            to="/admin/dashboard/system"
            class="block px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
            active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
          >
            系统管理
          </NuxtLink>
          <NuxtLink
            to="/admin/dashboard/posts"
            class="block px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50/90 dark:hover:bg-sky-500/15"
            active-class="bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sm"
          >
            文章管理
          </NuxtLink>
        </nav>
      </aside>
      <main class="flex-1 min-w-0">
        <header class="h-16 px-6 border-b border-white/70 dark:border-white/10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl flex items-center justify-between">
          <h1 class="text-base font-medium text-slate-900 dark:text-slate-100">站长管理后台</h1>
          <NuxtLink
            to="/"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
          >
            返回站点
          </NuxtLink>
        </header>
        <div class="p-6 lg:p-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
