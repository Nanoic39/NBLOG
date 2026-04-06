<template>
  <div class="min-h-screen bg-[#f4f7fb] dark:bg-[#0b1220] py-10 px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">发布新文章</h1>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
      <div class="text-slate-500 dark:text-slate-400 mb-4">
        TODO: 在此处实现文章发布表单
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        您已成功作为管理员登录 ({{ user?.email }})
      </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const { user } = useAuth()
</script>
