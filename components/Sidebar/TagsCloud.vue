<template>
  <div class="bg-white/80 dark:bg-[#242424]/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50 dark:border-gray-700/50">
    <h3 class="text-lg font-bold text-[#2A2E33] dark:text-[#e0e0e0] mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-[#0284C7] dark:text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      标签云
    </h3>
    
    <div class="flex flex-wrap gap-2">
      <NuxtLink 
        v-for="tag in tags" 
        :key="tag.name" 
        :to="`/tags/${tag.name}`"
        class="px-3 py-1.5 rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5"
        :class="[
          tag.count > 5 
            ? 'bg-[#0284C7]/10 text-[#0284C7] dark:text-[#38bdf8] border border-[#0284C7]/20 font-bold' 
            : 'bg-gray-50 dark:bg-white/5 text-[#6B7280] dark:text-[#9ca3af] border border-transparent hover:bg-[#0284C7]/10 hover:text-[#0284C7] dark:hover:text-[#38bdf8]'
        ]"
      >
        #{{ tag.name }}
        <span class="ml-1 text-xs opacity-60" v-if="tag.count > 1">({{ tag.count }})</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tag {
  name: string;
  count: number;
}

defineProps<{
  tags: Tag[]
}>();
</script>