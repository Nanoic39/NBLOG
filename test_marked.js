import { marked } from "marked";
import hljs from "highlight.js";

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;

      const lines = highlighted.split("\n");
      // 移除最后可能多余的空行
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }

      const lineNumbersHtml = lines
        .map((_, index) => `<div class="line-number text-right px-3 text-gray-400 dark:text-gray-500 text-sm select-none font-mono leading-relaxed">${index + 1}</div>`)
        .join("");
        
      const codeHtml = lines
        .map((line) => `<div class="line font-mono text-sm leading-relaxed">${line || " "}</div>`)
        .join("");

      const safeCode = encodeURIComponent(text);

      return `
        <div class="code-block-wrapper relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
          <div class="code-block-header flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-gray-800">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">${language}</span>
            <button class="copy-btn flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" data-code="${safeCode}" title="复制代码">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span class="copy-text">复制</span>
            </button>
          </div>
          <div class="code-block-content flex bg-gray-50 dark:bg-[#1e1e1e] overflow-x-auto">
            <div class="line-numbers shrink-0 py-4 border-r border-gray-200 dark:border-gray-700/50 bg-gray-100/50 dark:bg-[#1e1e1e]">
              ${lineNumbersHtml}
            </div>
            <pre class="!bg-transparent !m-0 !p-4 !rounded-none w-full !border-0"><code class="hljs language-${language}">${codeHtml}</code></pre>
          </div>
        </div>
      `;
    },
  },
});
console.log(marked.parse("```js\nconst a = 1;\n```"));