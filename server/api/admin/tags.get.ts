import { readPostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const store = await readPostsStore();
  const posts = [...store.pinned, ...store.regular];
  const map = new Map<string, number>();

  for (const post of posts) {
    for (const tag of Array.isArray(post.tags) ? post.tags : []) {
      const name = String(tag || "").trim();
      if (!name) continue;
      map.set(name, (map.get(name) || 0) + 1);
    }
  }

  const tags = Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { tags };
});
