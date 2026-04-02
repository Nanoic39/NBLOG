import { getAllPostsWithFlag } from "../../utils/posts-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let limit = parseInt(query.limit as string);
  if (isNaN(limit) || limit < 1) limit = 5;

  const allPosts = await getAllPostsWithFlag();
  const hotPosts = allPosts.sort((a, b) => (b.views || 0) - (a.views || 0));

  return hotPosts.slice(0, limit);
});
