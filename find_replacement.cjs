const fs = require('fs');
const path = require('path');

const files = [
  'app.vue',
  'components/CommentSection.vue',
  'components/DarkModeToggle.vue',
  'components/Sidebar/DoingSth.vue',
  'components/Sidebar/HotList.vue',
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
  if (!fs.existsSync(filePath)) continue;
  
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let found = false;
  lines.forEach((line, i) => {
    if (line.includes('�')) {
      if (!found) {
        console.log(`\n--- ${file} ---`);
        found = true;
      }
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
}
