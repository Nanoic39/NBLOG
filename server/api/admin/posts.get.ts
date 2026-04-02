import { readPostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const store = await readPostsStore();
  return {
    posts: [
      ...store.pinned.map((item) => ({ ...item, isPinned: true })),
      ...store.regular.map((item) => ({ ...item, isPinned: false })),
    ],
  };
});
