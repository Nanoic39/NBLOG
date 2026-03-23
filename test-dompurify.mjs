import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import hljs from "highlight.js";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    }
  }
});

const rawHtml = marked.parse('```javascript\nconst a = 1;\n```');
console.log("Raw:", rawHtml);

const sanitized = purify.sanitize(rawHtml, {
  ADD_ATTR: [
    "id",
    "class",
    "data-code",
    "data-zoomable",
  ],
});

console.log("Sanitized:", sanitized);
