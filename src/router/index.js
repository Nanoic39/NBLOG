import HomeView from "@/views/HomeView.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/post/:id",
    name: "post",
    component: () => import("@/views/PostView.vue"),
  },
  {
    path: "/archive",
    name: "archive",
    component: () => import("@/views/ArchiveView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    const raw = sessionStorage.getItem("read_positions");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const id = to.params?.id;
        const pos = id && data[id] && typeof data[id].scrollY === "number" ? data[id].scrollY : null;
        if (typeof pos === "number") return { left: 0, top: pos };
      } catch {}
    }
    return { left: 0, top: 0 };
  },
});

export default router;
