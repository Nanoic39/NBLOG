import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import hljs from 'highlight.js';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

marked.use({
  renderer: {
    code({ text, lang }) {
      const highlighted = hljs.highlight(text, { language: 'javascript' }).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    }
  }
});

const html = marked.parse('```js\nlet a = 1;\n```');
const clean = purify.sanitize(html, { ADD_ATTR: ['class', 'style'] });

console.log('Original:\n', html);
console.log('Clean:\n', clean);
