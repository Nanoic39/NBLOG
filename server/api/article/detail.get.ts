import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const slug = query.slug;

  try {
    const filePath = resolve(process.cwd(), 'server/api/MockData/pageDetail.json');
    const data = readFileSync(filePath, 'utf-8');
    const pageDetail = JSON.parse(data);

    // 在实际应用中，这里会根据 slug 查询数据库
    // 现在我们只有这一篇 mock 数据，所以只要 slug 匹配就返回，或者直接返回
    if (slug === pageDetail.slug || !slug) {
      return pageDetail;
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found',
      });
    }
  } catch (error) {
    console.error('Error reading mock data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read article detail',
    });
  }
});
