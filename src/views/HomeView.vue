<script setup>
import { getHitokotoThrottled } from "@/api/home.js";
import PostsList from "@/components/PostsList.vue";
import { usePostsStore } from "@/stores/posts";
import { storeToRefs } from "pinia";
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, RouterLink, useRouter } from "vue-router";
import { pagePreloader } from "@/utils/PagePreloader.js";

const postsStore = usePostsStore();
const { sorted } = storeToRefs(postsStore);

const route = useRoute();
const perPage = 8;
const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)));
const page = computed(() => Number(route.query.page || 1));
const curPage = computed(() => Math.min(pageCount.value, Math.max(1, page.value)));
const start = computed(() => (curPage.value - 1) * perPage);
const paged = computed(() => pagePreloader.useHomePage(sorted.value, curPage.value, perPage));
const pages = computed(() => Array.from({ length: pageCount.value }, (_, i) => i + 1));

const hitokotoText = ref("");
const hitokotoHref = ref("https://hitokoto.cn");

function requestHitokoto() {
  return getHitokotoThrottled()
    .then(({ hitokoto, href }) => {
      hitokotoHref.value = href || "https://hitokoto.cn";
      hitokotoText.value = hitokoto || "";
    })
    .catch(() => {});
}
function ensureHitokoto() {
  requestHitokoto();
}

onMounted(() => {
  if (curPage.value === 1) ensureHitokoto();
  pagePreloader.attach(useRouter());
});
watch(curPage, (n) => {
  if (n === 1) ensureHitokoto();
  pagePreloader.useHomePage(sorted.value, n, perPage);
});
</script>

<template>
  <div>
    <Transition name="cover-fade" mode="out-in">
    <div v-if="curPage === 1" class="cover">
        <!-- 一言 -->
        <div id="hitokoto">
        <a
          id="hitokoto_text"
          :href="hitokotoHref"
          target="_blank"
          title="hitokoto · 一言"
        >
          {{ hitokotoText || ":D 获取中..." }}
        </a>
        </div>
      </div>
    </Transition>
    <Transition name="fade-slide" mode="out-in">
      <PostsList :posts="paged" :key="curPage" />
    </Transition>
    <nav class="pagination">
      <RouterLink
        class="pg-btn"
        :to="curPage > 2 ? { path: '/', query: { page: curPage - 1 } } : { path: '/' }"
        :aria-disabled="curPage === 1"
      >上一页</RouterLink>
      <div class="pg-pages">
        <RouterLink
          v-for="p in pages"
          :key="p"
          class="pg-page"
          :to="p === 1 ? { path: '/' } : { path: '/', query: { page: p } }"
          :aria-current="p === curPage ? 'page' : null"
        >{{ p }}</RouterLink>
      </div>
      <RouterLink
        class="pg-btn"
        :to="curPage < pageCount ? { path: '/', query: { page: curPage + 1 } } : { path: '/', query: { page: pageCount } }"
        :aria-disabled="curPage === pageCount"
      >下一页</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.cover {
  --cover-height: 480px;
  position: relative;
  height: var(--cover-height);
  background: var(--theme-color-beige);
  background-image: none;
  background-position: center top;
  background-size: cover;
  border-radius: 12px;
  margin-bottom: 16px;
  display: block;

  #hitokoto {
    position: absolute;
    left: 24px;
    bottom: 24px;
    max-width: 72%;
    text-align: left;
    font-weight: 800;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(3px);
    padding: 12px 16px;
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
  
    transition: all 0.2s ease-in-out;

    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }

    a, a:hover, a:visited, a:active {
      color: #fff;
      text-decoration: none;
    }
  }
}

.cover::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("https://www.dmoe.cc/random.php") center top / cover no-repeat;
  border-radius: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px 0;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  will-change: opacity, transform;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.cover-fade-enter-active,
.cover-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  will-change: opacity, transform;
}
.cover-fade-enter-from,
.cover-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active,
  .cover-fade-enter-active,
  .cover-fade-leave-active {
    transition-duration: 0ms;
    transition-property: opacity;
    transform: none;
  }
}
.pg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
}
.pg-pages {
  display: flex;
  gap: 6px;
}
.pg-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--theme-color-border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
}
.pg-page[aria-current="page"] {
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
}

.banner {
  position: relative;
  height: 240px;
  border-radius: 12px;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4),
      rgba(59, 130, 246, 0) 60%
    ),
    var(--panel);
  overflow: hidden;
  margin-bottom: 16px;
}
.banner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px
  );
  background-size: 12px 12px;
}
.banner-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}
.title {
  font-size: 24px;
  margin: 0 0 8px;
}
.sub {
  margin: 0;
  color: var(--muted);
}
</style>
