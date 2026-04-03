import { getAllPostsWithFlag } from "../../utils/posts-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let page = parseInt(query.page as string);
  const sizeRaw = parseInt(query.size as string);
  const limitRaw = parseInt(query.limit as string);
  let size = Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : limitRaw;
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(size) || size < 1) size = 10;

  const allPosts = await getAllPostsWithFlag();
  const hotPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0));
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedPosts = hotPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: hotPosts.length,
    hasMore: endIndex < hotPosts.length,
    meta: {
      page,
      size,
      returned: paginatedPosts.length,
    },
  };
});
