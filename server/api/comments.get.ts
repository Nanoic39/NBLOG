import { readCommentsStore } from "../utils/comments-store";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const articleId = String(query.articleId || "").trim();
  const page = Math.max(1, Number(query.page || 1) || 1);
  const size = Math.max(1, Math.min(100, Number(query.size || 100) || 100));

  try {
    let comments = await readCommentsStore();

    if (articleId) {
      comments = comments.filter((c: any) => String(c.articleId) === articleId);
    }
    comments = comments.sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    const start = (page - 1) * size;
    const sliced = comments.slice(start, start + size);
    return {
      data: sliced,
      total: comments.length,
      page,
      size,
    };
  } catch (error) {
    console.error("Error reading comments store:", error);
    return {
      data: [],
      total: 0,
      page,
      size,
    };
  }
});
