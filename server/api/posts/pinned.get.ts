import { readPostsStore } from "../../utils/posts-store";

export default defineEventHandler(async () => {
  const store = await readPostsStore();
  return store.pinned;
});
