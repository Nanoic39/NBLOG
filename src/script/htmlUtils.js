export function escapeHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function getLangRules(lang) {
  const common = [
    { regex: /(\/\/.*)$/g, replace: '<span class="tok com">$1</span>' },
    {
      regex: /(\/\*[\s\S]*?\*\/)/g,
      replace: '<span class="tok com">$1</span>',
    },
    { regex: /(["'`].*?["'`])/g, replace: '<span class="tok str">$1</span>' },
    {
      regex: /\b(\d+(?:\.\d+)?)\b/g,
      replace: '<span class="tok num">$1</span>',
    },
  ];
  if (lang === "ts" || lang === "js") {
    return [
      ...common,
      {
        regex:
          /\b(import|from|const|let|var|function|class|extends|implements|return|if|else|for|while|new|try|catch|throw|export|default|type|interface|public|private|protected|readonly|async|await|switch|case|break|continue)\b/g,
        replace: '<span class="tok kw">$1</span>',
      },
      {
        regex: /([A-Za-z_][A-Za-z0-9_]*)\s*(?=\()/g,
        replace: '<span class="tok fn">$1</span>',
      },
    ];
  }
  if (lang === "json") {
    return [
      {
        regex: /(\{|\}|\[|\]|:|,)/g,
        replace: '<span class="tok op">$1</span>',
      },
      { regex: /(\".*?\")\s*:/g, replace: '<span class="tok str">$1</span>:' },
      { regex: /:\s*(\".*?\")/g, replace: ': <span class="tok str">$1</span>' },
      {
        regex: /:\s*(\d+(?:\.\d+)?)/g,
        replace: ': <span class="tok num">$1</span>',
      },
      {
        regex: /:\s*(true|false|null)/g,
        replace: ': <span class="tok kw">$1</span>',
      },
    ];
  }
  if (lang === "css") {
    return [
      {
        regex: /(\/\*[\s\S]*?\*\/)/g,
        replace: '<span class="tok com">$1</span>',
      },
      {
        regex: /([a-z-]+)\s*:\s*([^;]+);/gi,
        replace:
          '<span class="tok kw">$1</span>: <span class="tok str">$2</span>;',
      },
      { regex: /(\{|\}|;|:)/g, replace: '<span class="tok op">$1</span>' },
    ];
  }
  if (lang === "html") {
    return [
      {
        regex: /(&lt;\/?)([a-zA-Z0-9\-]+)([^&]*?)(&gt;)/g,
        replace: '$1<span class="tok kw">$2</span>$3$4',
      },
      {
        regex: /([a-zA-Z-]+)=(\&quot;.*?\&quot;)/g,
        replace:
          '<span class="tok type">$1</span>=<span class="tok str">$2</span>',
      },
    ];
  }
  return common;
}

export function highlightLine(line, lang) {
  let h = escapeHtml(line);
  const rules = getLangRules(lang);
  for (const r of rules) {
    h = h.replace(r.regex, r.replace);
  }
  return h;
}
