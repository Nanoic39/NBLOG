<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

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

const { user, login, logout } = useAuth();
const displayName = computed(() =>
  String(
    (user.value as any)?.name ||
      (user.value as any)?.preferred_username ||
      (user.value as any)?.username ||
      (user.value as any)?.email ||
      "User",
  ),
);
const displayInitial = computed(() =>
  String(displayName.value || "U").charAt(0).toUpperCase(),
);

const getAvatarUrl = (picture: string) => {
  if (!picture) return "";
  if (picture.startsWith("data:")) return picture;
  return "/api/auth/avatar";
};

const menuItems = [
  { name: "首页", path: "/" },
  { name: "归档", path: "/archive" },
  { name: "关于", path: "/about" },
];
</script>

<template>
  <div
    class="min-h-screen bg-[#F9FAFB] dark:bg-[#1a1a1a] flex flex-col font-sans text-[#2A2E33] dark:text-[#e0e0e0] transition-colors duration-300"
  >
    <!-- 导航栏 -->
    <header
      class="fixed z-50 transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] left-1/2 -translate-x-1/2"
      :class="[
        isScrolled
          ? 'top-4 w-[95%] max-w-[1440px] rounded-xl py-2 bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 dark:border-white/10'
          : 'top-0 w-full max-w-full rounded-none py-4 bg-transparent border-transparent shadow-none',
      ]"
    >
      <div
        class="container mx-auto px-6 max-w-[1440px] flex items-center justify-between"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="text-2xl font-bold font-ink text-[#2A2E33] dark:text-[#e0e0e0] hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors"
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
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0284C7] dark:bg-[#38bdf8] transition-all duration-300 group-hover:w-full"
            ></span>
          </NuxtLink>

          <!-- Auth Section -->
          <div v-if="!user" class="flex items-center">
            <button
              @click="login"
              class="text-[#6B7280] dark:text-[#9ca3af] hover:text-[#2A2E33] dark:hover:text-[#e0e0e0] transition-colors font-medium py-1"
            >
              登录
            </button>
          </div>
          <div v-else class="relative group">
            <button
              class="flex items-center gap-2 text-[#2A2E33] dark:text-[#e0e0e0] font-medium py-1 hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors"
            >
              <img
                v-if="user.picture"
                :src="getAvatarUrl(user.picture)"
                class="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                alt="Avatar"
              />
              <div
                v-else
                class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400"
              >
                {{ displayInitial }}
              </div>
              <span>{{ displayName }}</span>
            </button>

            <!-- Dropdown Menu -->
            <div
              class="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50"
            >
              <div
                class="bg-white dark:bg-[#242424] rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700"
              >
                <div
                  class="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1"
                >
                  <p
                    class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                  >
                    {{ displayName }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ user.email }}
                  </p>
                </div>

                <a
                  href="/admin/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#0284C7] dark:hover:text-[#38bdf8]"
                >
                  控制台
                </a>

                <button
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>

          <!-- Dark Mode Toggle -->
          <div class="border-l border-gray-200 dark:border-gray-700 pl-6 ml-2">
            <DarkModeToggle />
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 text-[#2A2E33] dark:text-[#e0e0e0]"
          @click="toggleMobileMenu"
        >
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

        <!-- Auth Section -->
        <button
          v-if="!user"
          @click="login"
          class="text-left text-[#6B7280] dark:text-[#9ca3af] hover:text-[#2A2E33] dark:hover:text-[#e0e0e0] transition-colors"
        >
          登录
        </button>
        <div
          v-else
          class="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="user.picture"
              :src="getAvatarUrl(user.picture)"
              class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              alt="Avatar"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-base font-bold text-gray-500 dark:text-gray-400"
            >
              {{ displayInitial }}
            </div>
            <div class="flex flex-col">
              <span
                class="text-base font-semibold text-[#2A2E33] dark:text-[#e0e0e0]"
                >{{ displayName }}</span
              >
              <span class="text-xs text-gray-500">{{ user.email }}</span>
            </div>
          </div>

          <a
            href="/admin/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            class="block py-2 text-[#2A2E33] dark:text-[#e0e0e0] hover:text-[#0284C7] dark:hover:text-[#38bdf8] transition-colors text-base"
            @click="isMobileMenuOpen = false"
          >
            控制台
          </a>

          <button
            @click="logout"
            class="text-left text-red-500 hover:text-red-600 transition-colors text-base mt-2"
          >
            退出登录
          </button>
        </div>

        <!-- Mobile Dark Mode Toggle -->
        <div
          class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between"
        >
          <span class="text-base font-medium text-[#2A2E33] dark:text-[#e0e0e0]"
            >夜间模式</span
          >
          <DarkModeToggle />
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-[#1f1f1f] border-t border-gray-100 dark:border-gray-700 py-12 mt-auto transition-colors duration-300"
    >
      <div class="container mx-auto px-6 max-w-6xl text-center">
        <div class="mb-4 flex justify-center gap-6 text-[#9CA3AF]">
          <a
            href="https://github.com/Nanoic39/NBLOG"
            target="blank"
            class="hover:text-[#0284C7] transition-colors"
            >Github</a
          >
        </div>
        <p class="text-[#9CA3AF] text-sm">
          &copy; {{ new Date().getFullYear() }} NANOIC. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-ink {
  font-family: "汉仪墨韵行书", cursive, serif;
}
</style>
