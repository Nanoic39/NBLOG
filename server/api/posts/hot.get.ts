import pageList from "../MockData/pageList.json";
import pinPageList from "../MockData/pinPageList.json";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  let limit = parseInt(query.limit as string);
  if (isNaN(limit) || limit < 1) limit = 5;

  // Combine all posts
  const allPosts = [...pinPageList, ...pageList];

  // Sort by views descending
  const hotPosts = allPosts.sort((a, b) => (b.views || 0) - (a.views || 0));

  return hotPosts.slice(0, limit);
});
