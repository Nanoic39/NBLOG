<template>
  <div class="max-w-4xl mx-auto px-4 py-8 mt-24">
    <h1 class="text-3xl font-bold mb-6">发布新文章</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="text-gray-500 dark:text-gray-400 mb-4">
        TODO: 在此处实现文章发布表单
      </div>
      <p class="text-sm text-gray-500">
        您已成功作为管理员登录 ({{ user?.email }})
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const { user } = useAuth()
</script>
