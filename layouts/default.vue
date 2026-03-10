<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// useDarkMode 由 Nuxt 自动从 composables/ 目录导入
const { initDarkMode } = useDarkMode();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  initDarkMode();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const menuItems = [
  { name: "首页", path: "/" },
  { name: "归档", path: "/archive" },
  { name: "关于", path: "/about" },
];
</script>

<template>
  <div class="min-h-screen bg-[#F9FAFB] dark:bg-[#1a1a1a] flex flex-col font-sans text-[#2A2E33] dark:text-[#e0e0e0] transition-colors duration-300">
    <!-- 导航栏 -->
    <header
      class="fixed z-50 transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] left-1/2 -translate-x-1/2"
      :class="[
        isScrolled
          ? 'top-4 w-[95%] max-w-[1200px] rounded-2xl py-2 bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 dark:border-white/10'
          : 'top-0 w-full max-w-full rounded-none py-4 bg-transparent border-transparent shadow-none',
      ]"
    >
      <div
        class="container mx-auto px-6 max-w-6xl flex items-center justify-between"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="text-2xl font-bold font-ink text-[#2A2E33] dark:text-[#e0e0e0] hover:text-[#BFE9FF] transition-colors"
        >
          NANOIC
        </NuxtLink>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="relative text-[#6B7280] dark:text-[#9ca3af] hover:text-[#2A2E33] dark:hover:text-[#e0e0e0] transition-colors font-medium py-1 group"
            active-class="text-[#2A2E33] dark:text-[#e0e0e0] font-semibold"
          >
            {{ item.name }}
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BFE9FF] transition-all duration-300 group-hover:w-full"
            ></span>
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 text-[#2A2E33] dark:text-[#e0e0e0]" @click="toggleMobileMenu">
          <div class="w-6 h-5 flex flex-col justify-between">
            <span
              class="w-full h-0.5 bg-current transition-transform origin-left"
              :class="{ 'rotate-45 translate-x-1': isMobileMenuOpen }"
            ></span>
            <span
              class="w-full h-0.5 bg-current transition-opacity"
              :class="{ 'opacity-0': isMobileMenuOpen }"
            ></span>
            <span
              class="w-full h-0.5 bg-current transition-transform origin-left"
              :class="{ '-rotate-45 translate-x-1': isMobileMenuOpen }"
            ></span>
          </div>
        </button>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div
      class="fixed inset-0 z-40 bg-white dark:bg-[#1f1f1f] transform transition-transform duration-300 md:hidden pt-24 px-6"
      :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <nav class="flex flex-col gap-6 text-xl font-medium">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="block py-2 border-b border-gray-100 dark:border-gray-700 text-[#2A2E33] dark:text-[#e0e0e0]"
          @click="isMobileMenuOpen = false"
        >
          {{ item.name }}
        </NuxtLink>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-[#1f1f1f] border-t border-gray-100 dark:border-gray-700 py-12 mt-auto transition-colors duration-300">
      <div class="container mx-auto px-6 max-w-6xl text-center">
        <div class="mb-4 flex justify-center gap-6 text-[#9CA3AF]">
          <a href="#" class="hover:text-[#0284C7] transition-colors">Github</a>
          <a href="#" class="hover:text-[#0284C7] transition-colors">Twitter</a>
          <a href="#" class="hover:text-[#0284C7] transition-colors">RSS</a>
        </div>
        <p class="text-[#9CA3AF] text-sm">
          &copy; {{ new Date().getFullYear() }} NANOIC. All rights reserved.
        </p>
      </div>
    </footer>

    <!-- Night Mode Toggle -->
    <DarkModeToggle />
  </div>
</template>

<style scoped>
.font-ink {
  font-family: "汉仪墨韵行书", cursive, serif;
}
</style>
