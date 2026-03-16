const fs = require('fs');
const path = require('path');

const pageListPath = path.join(__dirname, 'server/api/MockData/pageList.json');
const pageList = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'));

function getPosts(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 7;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  console.log(`Page: ${page}, Limit: ${limit}, Start: ${startIndex}, End: ${endIndex}, Total: ${pageList.length}`);

  const paginatedPosts = pageList.slice(startIndex, endIndex);
  return paginatedPosts;
}

const result = getPosts({ page: '1', limit: '7' });
console.log('Result count:', result.length);

const resultDefault = getPosts({});
console.log('Result default count:', resultDefault.length);
