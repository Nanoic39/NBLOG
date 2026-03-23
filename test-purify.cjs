const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const purify = DOMPurify(window);
const html = '<button class="copy-btn" data-code="%20%20%20test">Copy</button>';
console.log(purify.sanitize(html, { ADD_ATTR: ['class', 'data-code'] }));
