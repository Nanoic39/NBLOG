import pageList from "../MockData/pageList.json";
import pinPageList from "../MockData/pinPageList.json";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  // Parse and validate parameters
  let page = parseInt(query.page as string);
  let limit = parseInt(query.limit as string);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 7;

  // Combine pinned and regular posts with flags
  const pinnedWithFlag = pinPageList.map((p) => ({ ...p, isPinned: true }));
  const regularWithFlag = pageList.map((p) => ({ ...p, isPinned: false }));

  const allPosts = [...pinnedWithFlag, ...regularWithFlag];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: allPosts.length,
    hasMore: endIndex < allPosts.length,
    meta: {
      page,
      limit,
      returned: paginatedPosts.length,
    },
  };
});
