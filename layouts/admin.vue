<template>
  <div class="min-h-screen bg-[#f5f7fb] dark:bg-[#141414]">
    <div class="flex min-h-screen">
      <aside class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f1f1f]">
        <div class="h-16 px-5 flex items-center border-b border-gray-200 dark:border-gray-800">
          <NuxtLink to="/admin/dashboard" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            NBLOG 控制台
          </NuxtLink>
        </div>
        <nav class="p-3 space-y-1">
          <NuxtLink
            to="/admin/dashboard"
            class="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-[#e8f3ff] dark:hover:bg-[#273547]"
            active-class="bg-[#e8f3ff] dark:bg-[#273547] text-[#0369a1] dark:text-[#7dd3fc]"
            exact-active-class="bg-[#e8f3ff] dark:bg-[#273547] text-[#0369a1] dark:text-[#7dd3fc]"
          >
            控制台概览
          </NuxtLink>
          <NuxtLink
            to="/admin/dashboard/system"
            class="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-[#e8f3ff] dark:hover:bg-[#273547]"
            active-class="bg-[#e8f3ff] dark:bg-[#273547] text-[#0369a1] dark:text-[#7dd3fc]"
          >
            系统管理
          </NuxtLink>
          <NuxtLink
            to="/admin/dashboard/posts"
            class="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-[#e8f3ff] dark:hover:bg-[#273547]"
            active-class="bg-[#e8f3ff] dark:bg-[#273547] text-[#0369a1] dark:text-[#7dd3fc]"
          >
            文章管理
          </NuxtLink>
        </nav>
      </aside>
      <main class="flex-1 min-w-0">
        <header class="h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f1f1f] flex items-center justify-between">
          <h1 class="text-base font-medium text-gray-900 dark:text-gray-100">站长管理后台</h1>
          <NuxtLink
            to="/"
            class="text-sm text-gray-600 dark:text-gray-300 hover:text-[#0284C7] transition-colors"
          >
            返回站点
          </NuxtLink>
        </header>
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
