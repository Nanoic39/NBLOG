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
