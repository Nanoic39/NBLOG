import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref([
    {
      id: "hello-vue3",
      title: "你好，Vue 3 组合式语法",
      summary: "用更直观的方式组织逻辑与状态，构建可维护的前端工程。",
      tags: ["Vue", "Composition API"],
      cover: "https://picsum.photos/seed/vue3/640/360",
      readMins: 6,
      publishedAt: "2025-12-08T10:00:00.000Z",
    },
    {
      id: "pinia-basics",
      title: "Pinia 入门：比 Vuex 更丝滑的状态管理",
      summary: "用 store 管理全局状态，轻松实现派生与持久化。",
      tags: ["Pinia", "State"],
      cover: "https://picsum.photos/seed/pinia/640/360",
      readMins: 5,
      publishedAt: "2025-12-07T09:20:00.000Z",
    },
    {
      id: "router-spa",
      title: "Vue Router 搭建单页面应用基础结构",
      summary: "用路由组织页面与跳转，构建清晰的导航体验。",
      tags: ["Router", "SPA"],
      cover: "https://picsum.photos/seed/router/640/360",
      readMins: 7,
      publishedAt: "2025-12-06T08:30:00.000Z",
    },
  ]);

  const sorted = computed(() =>
    [...posts.value].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  );

  function addPost(post) {
    posts.value.push(post);
  }

  return { posts, sorted, addPost };
});
