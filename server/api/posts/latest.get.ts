import { getAllPostsWithFlag } from "../../utils/posts-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let page = parseInt(query.page as string);
  let limit = parseInt(query.limit as string);
  const tag = String(query.tag || "").trim();

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 7;

  const allPosts = await getAllPostsWithFlag();
  const filtered = tag
    ? allPosts.filter((post) => Array.isArray(post.tags) && post.tags.includes(tag))
    : allPosts;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedPosts = filtered.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: filtered.length,
    hasMore: endIndex < filtered.length,
    meta: {
      page,
      limit,
      returned: paginatedPosts.length,
    },
  };
});
