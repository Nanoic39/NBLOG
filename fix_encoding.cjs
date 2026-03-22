const fs = require('fs');
const iconv = require('iconv-lite');
const path = require('path');

const files = [
  'app.vue',
  'components/CommentSection.vue',
  'components/DarkModeToggle.vue',
  'components/Sidebar/DoingSth.vue',
  'components/Sidebar/HotList.vue',
  'components/Sidebar/NoticeCard.vue',
  'components/Sidebar/ProfileCard.vue',
  'components/Sidebar/TagsCloud.vue',
  'layouts/default.vue',
  'pages/about.vue',
  'pages/archive.vue',
  'pages/index.vue',
  'pages/not-found.vue',
  'pages/admin/posts/new.vue',
  'pages/posts/[slug].vue'
];

for (const file of files) {
  const filePath = path.resolve(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const gbkBytes = iconv.encode(content, 'gbk');
  const utf8String = gbkBytes.toString('utf8');
  
  fs.writeFileSync(filePath, utf8String);
  console.log(`Fixed: ${file}`);
  
  if (utf8String.includes('�')) {
    console.log(`  WARNING: Found replacement character � in ${file}`);
  }
}
