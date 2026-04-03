import { getAllPostsWithFlag } from "../../utils/posts-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let page = parseInt(query.page as string);
  const sizeRaw = parseInt(query.size as string);
  const limitRaw = parseInt(query.limit as string);
  let size = Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : limitRaw;
  const tag = String(query.tag || "").trim();
  const keyword = String(query.keyword || "").trim().toLowerCase();

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(size) || size < 1) size = 10;

  const allPosts = await getAllPostsWithFlag();
  const filtered = allPosts.filter((post) => {
    const matchTag = tag
      ? Array.isArray(post.tags) && post.tags.includes(tag)
      : true;
    const matchKeyword = keyword
      ? String(post.title || "").toLowerCase().includes(keyword) ||
        String(post.description || "").toLowerCase().includes(keyword)
      : true;
    return matchTag && matchKeyword;
  });

  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;

  const paginatedPosts = filtered.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: filtered.length,
    hasMore: endIndex < filtered.length,
    meta: {
      page,
      size,
      returned: paginatedPosts.length,
    },
  };
});
