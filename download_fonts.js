import fs from 'fs';
import path from 'path';
import https from 'https';

const FONTS = [
  { name: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap' },
  { name: 'M_PLUS_Rounded_1c', url: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap' },
  { name: 'JetBrains_Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap' }
];

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const CSS_FILE = path.join(process.cwd(), 'assets', 'css', 'local-fonts.css');

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

async function fetchCss(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  let finalCss = '';
  for (const font of FONTS) {
    console.log(`Fetching CSS for ${font.name}...`);
    let css = await fetchCss(font.url);
    
    const urlRegex = /url\((https:\/\/[^)]+)\)/g;
    let match;
    let fontIndex = 0;
    
    const downloads = [];
    const replacements = [];

    while ((match = urlRegex.exec(css)) !== null) {
      const fontUrl = match[1];
      const ext = 'woff2';
      const filename = `${font.name}_${fontIndex}.${ext}`;
      const dest = path.join(FONTS_DIR, filename);
      
      downloads.push(downloadFile(fontUrl, dest));
      replacements.push({ original: fontUrl, local: `/fonts/${filename}` });
      fontIndex++;
    }
    
    await Promise.all(downloads);
    console.log(`Downloaded ${downloads.length} files for ${font.name}.`);
    
    for (const { original, local } of replacements) {
      css = css.replace(original, local);
    }
    
    finalCss += `/* ${font.name} */\n${css}\n\n`;
  }
  
  fs.writeFileSync(CSS_FILE, finalCss);
  console.log('Done! CSS written to', CSS_FILE);
}

main().catch(console.error);