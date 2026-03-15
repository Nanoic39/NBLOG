<template>
  <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-9xl font-extrabold text-[#0284C7] dark:text-[#38bdf8] animate-pulse">404</h1>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">页面未找到</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          抱歉，您访问的页面不存在或已被移除。
        </p>
      </div>
      <div class="mt-8">
        <button
          @click="goBack"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0284C7] hover:bg-[#026aa1] dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all duration-300 cursor-pointer"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-white group-hover:text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </span>
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: '404 - 页面未找到'
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
