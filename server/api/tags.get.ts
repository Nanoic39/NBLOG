import pageList from "./MockData/pageList.json";
import pinPageList from "./MockData/pinPageList.json";

export default defineEventHandler((event) => {
  // Combine all posts
  const allPosts = [...pinPageList, ...pageList];
  
  const tagsMap = new Map<string, number>();

  allPosts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      });
    }
  });

  // Convert to array and sort by count (descending)
  const tags = Array.from(tagsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return tags;
});
