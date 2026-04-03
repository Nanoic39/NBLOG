import pageDetail from "../MockData/pageDetail.json";
import { readPostsStore, savePostsStore } from "../../utils/posts-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const slug = String(query.slug || "").trim();

  const store = await readPostsStore();
  const pinnedIndex = store.pinned.findIndex((item) => item.slug === slug);
  const regularIndex = store.regular.findIndex((item) => item.slug === slug);

  if (pinnedIndex >= 0) {
    const target = store.pinned[pinnedIndex]!;
    const next = { ...target, views: Number(target.views || 0) + 1 };
    store.pinned[pinnedIndex] = next;
    await savePostsStore(store);
    return {
      ...next,
      editDate: String(Date.now()),
      content: next.content || `# ${next.title}\n\n${next.description}`,
    };
  }

  if (regularIndex >= 0) {
    const target = store.regular[regularIndex]!;
    const next = { ...target, views: Number(target.views || 0) + 1 };
    store.regular[regularIndex] = next;
    await savePostsStore(store);
    return {
      ...next,
      editDate: String(Date.now()),
      content: next.content || `# ${next.title}\n\n${next.description}`,
    };
  }

  if (slug === pageDetail.slug || !slug) {
    return pageDetail;
  }

  throw createError({
    statusCode: 404,
    statusMessage: "未找到对应文章",
  });
});
