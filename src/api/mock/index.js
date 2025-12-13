export function getHitokoto() {
  return Promise.resolve({ hitokoto: "愿你出走半生，归来仍是少年。", href: "https://hitokoto.cn/?c=d&c=h&c=i&c=k" });
}

export function getPostById(id) {
  // 简单模拟：仅返回id占位与状态
  return Promise.resolve({ id, status: "ok" });
}

export function getPostComments(id) {
  // 模拟评论数据
  return Promise.resolve([
    { name: "Alice", date: new Date().toLocaleString(), body: "很喜欢这篇文章！" },
    { name: "Bob", date: new Date().toLocaleString(), body: "受益匪浅，感谢分享。" },
  ]);
}

export function getAboutInfo() {
  return Promise.resolve({ title: "关于", body: "这是关于页的模拟数据。" });
}

export function getFeaturedPosts(currentId) {
  const all = [
    { id: "pinia-basics", title: "Pinia 入门：比 Vuex 更丝滑的状态管理", summary: "用 store 管理全局状态，轻松实现派生与持久化。", cover: "https://picsum.photos/seed/pinia/160/120", tags: ["Pinia", "State"], updatedAt: "2025-12-08T12:10:00.000Z", publishedAt: "2025-12-07T09:20:00.000Z" },
    { id: "router-spa", title: "Vue Router 搭建单页面应用基础结构", summary: "用路由组织页面与跳转，构建清晰的导航体验。", cover: "https://picsum.photos/seed/router/160/120", tags: ["Router", "SPA"], updatedAt: "2025-12-06T10:00:00.000Z", publishedAt: "2025-12-06T08:30:00.000Z" },
    { id: "style-scss", title: "使用 SCSS 管理样式与变量", summary: "通过变量与嵌套提升样式的可维护性。", cover: "https://picsum.photos/seed/scss/160/120", tags: ["CSS", "SCSS"], publishedAt: "2025-12-05T12:00:00.000Z" },
    { id: "tooling-vite", title: "前端工具链：使用 Vite 提升开发体验", summary: "快速热更新与现代构建，让开发更高效。", cover: "https://picsum.photos/seed/vite/160/120", tags: ["Vite", "Tooling"], publishedAt: "2025-12-05T18:10:00.000Z" },
    { id: "axios-fetching", title: "Axios 与数据请求的最佳实践", summary: "统一错误处理与拦截器，提升稳定性。", cover: "https://picsum.photos/seed/axios/160/120", tags: ["Axios", "HTTP"], publishedAt: "2025-12-05T09:30:00.000Z" },
  ];
  const list = all.filter((p) => String(p.id) !== String(currentId)).slice(0, 3);
  return Promise.resolve(list);
}
