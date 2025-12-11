<template>
  <div class="post">
    <div class="hero" v-if="post?.cover">
      <img :src="resolvedCover(post.cover)" :alt="post.title" />
    </div>
    <div class="head">
      <h1 class="title">{{ post?.title }}</h1>
      <div class="meta">
        <span class="date">{{ formatDate(post?.publishedAt) }}</span>
        <div class="tags">
          <span v-for="t in post?.tags" :key="t" class="tag"
            ><span class="ti">{{ tagIcon(t) }}</span
            >{{ t }}</span
          >
        </div>
      </div>
    </div>
    <div class="divider" aria-hidden="true"></div>
    <div class="info-cards">
      <div class="info-card" role="note" aria-label="阅读信息">
        <div class="info-line">
          本文共 {{ stats.chars }} 字，预计阅读时长：{{ stats.mins }} 分钟
        </div>
      </div>
      <div
        v-if="stats.outdated"
        class="outdated-card"
        role="alert"
        aria-live="polite"
      >
        <span class="icon">⚠️</span>
        距离本文最后修改已 {{ stats.outdatedDays }} 天，可能为过时内容，注意甄别
      </div>
    </div>
    <div class="content" ref="contentRef" v-html="post?.content"></div>
    <div class="extra">
      <div v-if="post?.origin === 'original'" class="origin-card">
        <div class="title"><span class="icon">✍️</span> 原创声明</div>
        <div class="lines">
          <p>作者：本站作者</p>
          <p>转载请注明来源，并附上本文链接。</p>
          <p>
            最后修改：{{ formatDate(post?.updatedAt || post?.publishedAt) }}
          </p>
        </div>
      </div>
      <div v-else class="reprint-card">
        <div class="title"><span class="icon">📎</span> 转载声明</div>
        <p>本文为转载，尊重原作者版权。</p>
        <a
          v-if="post?.sourceUrl"
          :href="post.sourceUrl"
          target="_blank"
          rel="noopener"
          >原文链接</a
        >
        <p>最后修改：{{ formatDate(post?.updatedAt || post?.publishedAt) }}</p>
      </div>
      <div class="comments">
        <div class="comments-title">评论</div>
        <form
          class="comment-form"
          @submit.prevent="submitComment"
          aria-label="发表评论"
        >
          <input
            v-model="cName"
            type="text"
            placeholder="昵称"
            aria-label="昵称"
          />
          <input
            v-model="cEmail"
            type="email"
            placeholder="邮箱"
            aria-label="邮箱"
          />
          <textarea
            v-model="cBody"
            rows="3"
            placeholder="留言"
            aria-label="留言"
          ></textarea>
          <button type="submit">提交</button>
        </form>
        <ul class="comment-list">
          <li v-for="(c, i) in comments" :key="i" class="comment-item">
            <div class="meta">{{ c.name }} · {{ c.date }}</div>
            <div class="body">{{ c.body }}</div>
          </li>
        </ul>
      </div>
    </div>
    <div class="transition-block" aria-hidden="true">
      <div class="tb-inner">
        <div class="tb-title">精选内容</div>
        <div class="tb-sub">更多精彩，敬请期待</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { usePostsStore } from "@/stores/posts";
import { pagePreloader } from "@/utils/PagePreloader.js";
import {
  computed,
  ref,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import { attachImageZoom } from "@/script/imageZoom.js";
const route = useRoute();
const router = useRouter();
const store = usePostsStore();
const post = computed(() =>
  pagePreloader.usePost(store.sorted, route.params.id)
);
function resolvedCover(url) {
  return pagePreloader.getImageSrc(url);
}
const contentRef = ref(null);
// 阅读信息与过时提示（使用已保存的数据，保持内外一致）
const stats = computed(() => {
  const chars = post.value?.readStats?.chars ?? 0;
  const mins = post.value?.readStats?.mins ?? post.value?.readMins ?? 1;
  const last = post.value?.updatedAt || post.value?.publishedAt;
  let outdatedDays = 0;
  let outdated = false;
  if (last) {
    const diff =
      (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    outdatedDays = Math.floor(diff);
    outdated = outdatedDays > 60;
  }
  return { chars, mins, outdated, outdatedDays };
});
const cName = ref("");
const cEmail = ref("");
const cBody = ref("");
const comments = ref([]);

function tagIcon(name) {
  const map = {
    Vue: "🟢",
    "Composition API": "🧩",
    Pinia: "🌿",
    State: "🧠",
    Router: "🧭",
    SPA: "📄",
  };
  return map[name] || "🏷️";
}

// 保留 contentRef 供目录组件使用，去除正文内目录构建
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function submitComment() {
  const name = cName.value.trim();
  const body = cBody.value.trim();
  if (!name || !body) return;
  const email = cEmail.value.trim();
  const item = {
    name,
    email,
    body,
    date: new Date().toLocaleString(),
  };
  comments.value = [item, ...comments.value];
  cName.value = "";
  cEmail.value = "";
  cBody.value = "";
}

function escapeHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightLine(line, lang) {
  let h = escapeHtml(line);
  const rules = getLangRules(lang);
  for (const r of rules) {
    h = h.replace(r.regex, r.replace);
  }
  return h;
}

function getLangRules(lang) {
  const common = [
    { regex: /(\/\/.*)$/g, replace: '<span class="tok com">$1<\/span>' },
    {
      regex: /(\/\*[\s\S]*?\*\/)/g,
      replace: '<span class="tok com">$1<\/span>',
    },
    { regex: /(["'`].*?["'`])/g, replace: '<span class="tok str">$1<\/span>' },
    {
      regex: /\b(\d+(?:\.\d+)?)\b/g,
      replace: '<span class="tok num">$1<\/span>',
    },
  ];
  if (lang === "ts" || lang === "js") {
    return [
      ...common,
      {
        regex:
          /\b(import|from|const|let|var|function|class|extends|implements|return|if|else|for|while|new|try|catch|throw|export|default|type|interface|public|private|protected|readonly|async|await|switch|case|break|continue)\b/g,
        replace: '<span class="tok kw">$1<\/span>',
      },
      {
        regex: /([A-Za-z_][A-Za-z0-9_]*)\s*(?=\()/g,
        replace: '<span class="tok fn">$1<\/span>',
      },
    ];
  }
  if (lang === "json") {
    return [
      {
        regex: /(\{|\}|\[|\]|:|,)/g,
        replace: '<span class="tok op">$1<\/span>',
      },
      { regex: /(".*?")\s*:/g, replace: '<span class="tok str">$1<\/span>:' },
      { regex: /:\s*(".*?")/g, replace: ': <span class="tok str">$1<\/span>' },
      {
        regex: /:\s*(\d+(?:\.\d+)?)/g,
        replace: ': <span class="tok num">$1<\/span>',
      },
      {
        regex: /:\s*(true|false|null)/g,
        replace: ': <span class="tok kw">$1<\/span>',
      },
    ];
  }
  if (lang === "css") {
    return [
      {
        regex: /(\/\*[\s\S]*?\*\/)/g,
        replace: '<span class="tok com">$1<\/span>',
      },
      {
        regex: /([a-z-]+)\s*:\s*([^;]+);/gi,
        replace:
          '<span class="tok kw">$1<\/span>: <span class="tok str">$2<\/span>;',
      },
      { regex: /(\{|\}|;|:)/g, replace: '<span class="tok op">$1<\/span>' },
    ];
  }
  if (lang === "html") {
    return [
      {
        regex: /(&lt;\/?)([a-zA-Z0-9\-]+)([^&]*?)(&gt;)/g,
        replace: '$1<span class="tok kw">$2<\/span>$3$4',
      },
      {
        regex: /([a-zA-Z-]+)=(&quot;.*?&quot;)/g,
        replace:
          '<span class="tok type">$1<\/span>=<span class="tok str">$2<\/span>',
      },
    ];
  }
  return common;
}

function enhanceCodeBlocks() {
  const blocks = Array.from(
    document.querySelectorAll(".post .content pre > code")
  );
  blocks.forEach((code) => {
    const pre = code.parentElement;
    const cls = code.className || "";
    const m = cls.match(/language-([a-z0-9]+)/i);
    const lang = m ? m[1].toLowerCase() : "text";
    const text = code.textContent || "";
    let lines = text.replace(/\r\n/g, "\n").split("\n");
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    let highlighted = escapeHtml(text);
    if (Prism.languages[lang]) {
      highlighted = Prism.highlight(text, Prism.languages[lang], lang);
    }
    let highlightedLines = highlighted.replace(/\r\n/g, "\n").split("\n");
    if (
      highlightedLines.length &&
      highlightedLines[highlightedLines.length - 1] === ""
    )
      highlightedLines.pop();
    if (highlightedLines.length !== lines.length) {
      const diff = highlightedLines.length - lines.length;
      if (diff > 0) highlightedLines = highlightedLines.slice(0, lines.length);
      else
        while (highlightedLines.length < lines.length)
          highlightedLines.push("");
    }
    const container = document.createElement("div");
    container.className = "code-block";
    container.setAttribute("data-lang", lang);
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";
    const langEl = document.createElement("span");
    langEl.className = "lang";
    langEl.textContent = lang.toUpperCase();
    const noteEl = document.createElement("span");
    noteEl.className = "note";
    const note = code.getAttribute("data-note") || code.getAttribute("title");
    if (note && note.trim()) noteEl.textContent = note.trim();
    else {
      noteEl.textContent = "C O D E";
      noteEl.classList.add("blank");
    }
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋";
    toolbar.appendChild(langEl);
    toolbar.appendChild(noteEl);
    toolbar.appendChild(copyBtn);
    const body = document.createElement("div");
    body.className = "code-content";
    const gutter = document.createElement("div");
    gutter.className = "line-numbers";
    const preNew = document.createElement("pre");
    const codeNew = document.createElement("code");
    codeNew.className = code.className;
    const frag = document.createDocumentFragment();
    lines.forEach((ln, i) => {
      const n = document.createElement("div");
      n.textContent = String(i + 1);
      gutter.appendChild(n);
      const span = document.createElement("span");
      span.className = "code-line";
      span.innerHTML = Prism.languages[lang]
        ? highlightedLines[i] ?? escapeHtml(ln)
        : highlightLine(ln, lang);
      frag.appendChild(span);
    });
    codeNew.appendChild(frag);
    preNew.appendChild(codeNew);
    body.appendChild(gutter);
    body.appendChild(preNew);
    container.appendChild(toolbar);
    container.appendChild(body);
    pre.replaceWith(container);
    copyBtn.addEventListener("click", () => {
      const content = lines.join("\n");
      navigator.clipboard && navigator.clipboard.writeText(content);
    });
  });
}

let moCode;
function observeContent() {
  const el = document.querySelector(".post .content");
  if (!el) return;
  if (moCode) moCode.disconnect();
  moCode = new MutationObserver(() => {
    const hasPreCode = document.querySelector(".post .content pre > code");
    const transformed = document.querySelector(".post .content .code-block");
    if (hasPreCode && !transformed) {
      enhanceCodeBlocks();
    }
  });
  moCode.observe(el, { childList: true, subtree: true });
}

let enhanceTimer;
function ensureEnhance() {
  if (enhanceTimer) clearInterval(enhanceTimer);
  let tries = 0;
  enhanceTimer = setInterval(() => {
    const hasPreCode = document.querySelector(".post .content pre > code");
    const transformed = document.querySelector(".post .content .code-block");
    if (hasPreCode && !transformed) {
      enhanceCodeBlocks();
      clearInterval(enhanceTimer);
      enhanceTimer = null;
    } else if (++tries > 60) {
      clearInterval(enhanceTimer);
      enhanceTimer = null;
    }
  }, 50);
}

onMounted(async () => {
  await nextTick();
  ensureEnhance();
  observeContent();
  window.addEventListener("scroll", onScrollPV, { passive: true });
  restoreScroll();
  bindImageLoadRestore();
  pagePreloader.attach(router);
  attachImageZoom(contentRef.value || ".post .content");
  bindDetailsFoldAnimations();
  enhanceMediaPlayers();
});

watch(
  () => post.value?.content,
  async () => {
    await nextTick();
    ensureEnhance();
    observeContent();
    restoreScroll();
    bindImageLoadRestore();
    attachImageZoom(contentRef.value || ".post .content");
    bindDetailsFoldAnimations();
    enhanceMediaPlayers();
  }
);

let tickingPV = false;
function onScrollPV() {
  if (!tickingPV) {
    tickingPV = true;
    requestAnimationFrame(() => {
      saveScroll();
      tickingPV = false;
    });
  }
}

function saveScroll() {
  const id = route.params.id;
  const raw = sessionStorage.getItem("read_positions") || "{}";
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }
  data[id] = { scrollY: window.scrollY, timestamp: Date.now() };
  sessionStorage.setItem("read_positions", JSON.stringify(data));
  history.replaceState(
    { ...(history.state || {}), scroll: window.scrollY },
    ""
  );
}

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScrollPV);
});

onBeforeUnmount(() => {
  if (moCode) moCode.disconnect();
  if (enhanceTimer) clearInterval(enhanceTimer);
});

function getSavedPos() {
  const hs =
    history.state && typeof history.state.scroll === "number"
      ? history.state.scroll
      : null;
  if (typeof hs === "number") return hs;
  const id = route.params.id;
  try {
    const data = JSON.parse(sessionStorage.getItem("read_positions") || "{}");
    const pos =
      data[id] && typeof data[id].scrollY === "number"
        ? data[id].scrollY
        : null;
    return typeof pos === "number" ? pos : null;
  } catch {
    return null;
  }
}

function restoreScroll() {
  const pos = getSavedPos();
  if (typeof pos !== "number") return;
  let tries = 0;
  const max = 120;
  const tick = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h >= pos || tries >= max) {
      if (Math.abs(window.scrollY - pos) > 2) window.scrollTo({ top: pos });
    } else {
      tries++;
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

function bindImageLoadRestore() {
  const imgs = Array.from(document.querySelectorAll(".post .content img"));
  imgs.forEach((img) => {
    img.addEventListener("load", () => restoreScroll(), { once: true });
  });
}

function enhanceMediaPlayers() {
  const root = document.querySelector(".post .content");
  if (!root) return;
  const containers = Array.from(root.querySelectorAll(".audio-player"));
  containers.forEach((card) => {
    if (card.__apEnhanced) return;
    const audio = card.querySelector("audio");
    if (!audio) return;
    const hasCover = !!card.querySelector(".ap-cover");
    const hasInfo = !!card.querySelector(".ap-info");
    if (hasCover && hasInfo) {
      card.__apEnhanced = true;
      return;
    }
    const coverBox = document.createElement("div");
    coverBox.className = "ap-cover";
    const infoBox = document.createElement("div");
    infoBox.className = "ap-info";
    const titleEl = document.createElement("div");
    titleEl.className = "ap-title";
    const subEl = document.createElement("div");
    subEl.className = "ap-sub";
    const pick = (el, names) => {
      for (const n of names) {
        const v = el.getAttribute(n);
        if (v && v.trim()) return v.trim();
      }
      return "";
    };
    const title = pick(audio, ["data-title", "title"]) || pick(card, ["data-title"]) || "音频";
    const desc = pick(audio, ["data-desc", "aria-label"]) || pick(card, ["data-desc"]) || "";
    const cover = pick(audio, ["data-cover", "cover"]) || pick(card, ["data-cover"]) || "";
    titleEl.textContent = title;
    if (desc) subEl.textContent = desc;
    if (cover) {
      const img = document.createElement("img");
      img.src = cover;
      img.alt = title || "audio";
      coverBox.appendChild(img);
    } else {
      const iconWrap = document.createElement("div");
      iconWrap.className = "ap-icon";
      iconWrap.innerHTML = '<svg class="ap-icon-svg" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M10 4v9.8a3.2 3.2 0 1 1-2-2.98V7h8v6.8a3.2 3.2 0 1 1-2-2.98V4h-4z"/></svg>';
      coverBox.appendChild(iconWrap);
    }
    infoBox.appendChild(titleEl);
    if (subEl.textContent) infoBox.appendChild(subEl);
    card.insertBefore(coverBox, audio);
    card.insertBefore(infoBox, audio);
    card.__apEnhanced = true;
  });

  const audios = Array.from(root.querySelectorAll("audio"));
  audios.forEach((a) => {
    const p = a.parentElement;
    if (p && p.classList && p.classList.contains("audio-player")) return;
    const card = document.createElement("div");
    card.className = "audio-player";
    const coverBox = document.createElement("div");
    coverBox.className = "ap-cover";
    const infoBox = document.createElement("div");
    infoBox.className = "ap-info";
    const titleEl = document.createElement("div");
    titleEl.className = "ap-title";
    const subEl = document.createElement("div");
    subEl.className = "ap-sub";
    const title = a.getAttribute("data-title") || a.getAttribute("title") || "音频";
    const desc = a.getAttribute("data-desc") || a.getAttribute("aria-label") || "";
    const cover = a.getAttribute("data-cover") || a.getAttribute("cover") || "";
    titleEl.textContent = title;
    if (desc && desc.trim()) subEl.textContent = desc.trim();
    if (cover && cover.trim()) {
      const img = document.createElement("img");
      img.src = cover.trim();
      img.alt = title || "audio";
      coverBox.appendChild(img);
    } else {
      const iconWrap = document.createElement("div");
      iconWrap.className = "ap-icon";
      iconWrap.innerHTML = '<svg class="ap-icon-svg" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M10 4v9.8a3.2 3.2 0 1 1-2-2.98V7h8v6.8a3.2 3.2 0 1 1-2-2.98V4h-4z"/></svg>';
      coverBox.appendChild(iconWrap);
    }
    infoBox.appendChild(titleEl);
    if (subEl.textContent) infoBox.appendChild(subEl);
    card.appendChild(coverBox);
    card.appendChild(infoBox);
    const next = a.cloneNode(true);
    card.appendChild(next);
    a.replaceWith(card);
  });
}

function bindDetailsFoldAnimations() {
  const panels = Array.from(
    document.querySelectorAll(".post .content details.fold")
  );
  panels.forEach((d) => {
    if (d.__foldBound) return;
    d.__foldBound = true;
    const body = d.querySelector(".fold-body");
    const sum = d.querySelector("summary");
    if (!body) return;
    let lastListener = null;
    let animState = null; // 'opening' | 'closing' | null
    const ro = new ResizeObserver(() => {
      // 保持打开时的内容自然高度，无需额外处理；动画阶段用内联 height 控制
    });
    ro.observe(body);

    const animateOpen = () => {
      if (lastListener) {
        body.removeEventListener("transitionend", lastListener);
        lastListener = null;
      }
      animState = "opening";
      d.classList.remove("closing");
      const target = body.scrollHeight;
      body.style.height = "0px";
      body.style.paddingTop = "12px";
      body.style.paddingBottom = "12px";
      d.open = true;
      void body.offsetWidth;
      body.style.height = target + "px";
      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        if (animState !== "opening") return;
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.removeEventListener("transitionend", onEnd);
        lastListener = null;
        animState = null;
      };
      body.addEventListener("transitionend", onEnd);
      lastListener = onEnd;
    };
    const animateClose = () => {
      if (lastListener) {
        body.removeEventListener("transitionend", lastListener);
        lastListener = null;
      }
      animState = "closing";
      d.classList.add("closing");
      if (!d.open) d.open = true; // 保持内容可见进行过渡
      const current = body.offsetHeight;
      body.style.height = current + "px";
      body.style.paddingTop = "0px";
      body.style.paddingBottom = "0px";
      void body.offsetWidth;
      body.style.height = "0px";
      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        if (animState !== "closing") return;
        d.open = false; // 完成后再关闭
        d.classList.remove("closing");
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.removeEventListener("transitionend", onEnd);
        lastListener = null;
        animState = null;
      };
      body.addEventListener("transitionend", onEnd);
      lastListener = onEnd;
    };
    const onSumClick = (e) => {
      e.preventDefault();
      // 允许在动画中打断并反向
      if (animState === "opening") {
        animateClose();
        return;
      }
      if (animState === "closing") {
        animateOpen();
        return;
      }
      if (d.open) animateClose();
      else animateOpen();
    };
    if (sum) {
      sum.addEventListener("click", onSumClick);
      sum.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSumClick(e);
        }
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.hero {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--theme-color-border);
  margin-bottom: 14px;
}
.hero img {
  display: block;
  width: 100%;
  height: auto;
}
.head {
  margin-bottom: 12px;
}
.title {
  margin: 6px 0;
  font-size: 26px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  color: var(--muted);
}
.date {
  font-size: 12px;
  border-radius: 5px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.04);
}
.tags {
  display: inline-flex;
  gap: 6px;
}
.tag {
  font-size: 12px;
  border-radius: 999px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.04);
}
.tag .ti {
  margin-right: 6px;
}
.mins {
  font-size: 12px;
}
.content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--text);
  text-align: left;
  max-width: var(--content-w);
  margin: 0 auto;
  h2,
  h3,
  h4 {
    margin: 16px 0 10px;
    font-weight: 700;
  }
  h2 {
    font-size: 22px;
    position: relative;
    padding-left: 10px;
  }
  h2::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 22px;
    border-radius: 2px;
    background: var(--theme-color-active);
  }
  h3 {
    font-size: 18px;
  }
  p {
    margin: 10px 0;
    color: #666;
  }

  a {
    color: var(--theme-color-active);
    text-decoration: none;
    border-bottom: 1px dashed var(--theme-color-border);
  }
  a:hover {
    color: var(--theme-color-active-text);
    background: var(--theme-color-active);
  }

  ul,
  ol {
    margin: 10px 0;
    padding-left: 1.6em;
  }
  ul {
    list-style: none;
  }
  li {
    position: relative;
    padding-left: 1.6em;
    margin: 8px 0;
    line-height: 1.5;
  }
  ul li::before {
    content: "";
    position: absolute;
    left: 0.1em;
    top: 0.55em;
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background: var(--theme-color-active);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }
  ul ul li {
    padding-left: 1.6em;
  }
  ul ul li::before {
    border-radius: 6px;
    width: 0.45em;
    height: 0.45em;
    background: #666;
  }
  ul ul ul li::before {
    border-radius: 0;
    width: 0.6em;
    height: 2px;
    background: #999;
    top: 0.9em;
  }
  ol {
    counter-reset: item;
    list-style: none;
    padding-left: 1.2em;
  }
  ol li {
    padding-left: 2.2em;
  }
  ol li::before {
    counter-increment: item;
    content: counter(item) ".";
    position: absolute;
    left: 0;
    top: 0.15em;
    width: 1.8em;
    height: 1.8em;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.06);
    color: var(--text);
    font-weight: 700;
    font-family: var(--font-en), monospace;
    font-size: 0.9em;
    line-height: 1.8em;
    text-align: center;
  }
  li:hover {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
  }
  ul li:hover::before {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  ol li:hover::before {
    background: rgba(59, 130, 246, 0.12);
    color: var(--theme-color-active);
  }

  blockquote {
    margin: 12px 0;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.04);
    border-left: 3px solid var(--theme-color-active);
    border-radius: 8px;
    color: #555;
  }

  code {
    font-family: var(--font-en), monospace;
    background: rgba(0, 0, 0, 0.06);
    padding: 2px 6px;
    border-radius: 6px;
  }
  pre {
    background: #1b1b21;
    color: #fff;
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
    padding: 12px 16px;
    overflow: auto;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  pre code {
    background: transparent;
    padding: 0;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    border: 1px solid var(--theme-color-border);
  }

  hr {
    border: 0;
    height: 14px;
    margin: 20px 0;
    background-repeat: no-repeat;
    background-position: center, left center, right center;
    background-size: 10px 10px, 50% 2px, 50% 2px;
    border-radius: 999px;
    background-image: radial-gradient(
        circle,
        var(--theme-color-active) 40%,
        transparent 41%
      ),
      linear-gradient(
        to right,
        #06b6d4 0%,
        #10b981 25%,
        #f59e0b 50%,
        #ef4444 75%,
        #8b5cf6 100%
      ),
      linear-gradient(
        to left,
        #06b6d4 0%,
        #10b981 25%,
        #f59e0b 50%,
        #ef4444 75%,
        #8b5cf6 100%
      );
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
  }
  thead th {
    background: rgba(0, 0, 0, 0.04);
  }
  td,
  th {
    padding: 8px 10px;
    border: 1px solid var(--theme-color-border);
  }
  tbody tr:nth-child(odd) {
    background: rgba(0, 0, 0, 0.02);
  }
}

.divider {
  max-width: var(--content-w);
  margin: 10px auto 14px;
  height: 2px;
  background-repeat: no-repeat;
  background-position: left center, right center;
  background-size: 50% 2px;
  background-image: linear-gradient(
      to right,
      #06b6d4 0%,
      #10b981 25%,
      #f59e0b 50%,
      #ef4444 75%,
      #8b5cf6 100%
    ),
    linear-gradient(
      to left,
      #06b6d4 0%,
      #10b981 25%,
      #f59e0b 50%,
      #ef4444 75%,
      #8b5cf6 100%
    );
}

.info-cards {
  max-width: var(--content-w);
  margin: 0 auto 12px;
  display: grid;
  gap: 10px;
}
.info-card {
  background: var(--panel);
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16);
}
.info-line {
  font-weight: 600;
}
.outdated-card {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.4);
  border-radius: 12px;
  padding: 12px 14px;
  color: #b06600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.outdated-card .icon {
  font-size: 16px;
}

.extra {
  max-width: var(--content-w);
  margin: 16px auto 0;
  padding-top: 12px;
  border-top: 1px solid var(--theme-color-border);
}
.origin-card,
.reprint-card {
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  background: var(--panel);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  padding: 14px 16px;
  margin-bottom: 12px;
}
.origin-card .title,
.reprint-card .title {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.origin-card .icon {
  color: var(--theme-color-active);
}
.reprint-card .icon {
  color: #f59e0b;
}
.origin-card .lines p,
.reprint-card p {
  margin: 6px 0;
  color: var(--text);
}
.comments-title {
  font-weight: 700;
  margin-bottom: 8px;
}
.comment-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
  margin-bottom: 12px;
}
.comment-form input,
.comment-form textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--theme-color-border);
  background: var(--panel);
  color: var(--text);
}
.comment-form textarea {
  grid-column: 1 / 3;
}
.comment-form button {
  grid-column: 1 / 3;
  height: 40px;
  border-radius: 8px;
  border: 0;
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  cursor: pointer;
}
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.comment-item {
  padding: 10px 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
}
.comment-item .meta {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}
.comment-item .body {
  color: var(--text);
}

.transition-block {
  height: 512px;
  margin: 18px 0 0;
  border-radius: 12px;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.18),
      rgba(16, 185, 129, 0.12)
    ),
    radial-gradient(
      600px 300px at 80% 20%,
      rgba(255, 255, 255, 0.08),
      transparent 60%
    );
  position: relative;
  overflow: hidden;
}
.transition-block::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 12px 12px;
  opacity: 0.35;
}
.tb-inner {
  position: absolute;
  left: 24px;
  bottom: 24px;
}
.tb-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}
.tb-sub {
  color: var(--muted);
}

@media (max-width: 768px) {
  .title {
    font-size: 22px;
  }
  .info-card,
  .outdated-card {
    padding: 10px 12px;
    border-radius: 10px;
  }
  .content {
    padding: 0 2px;
  }
}
</style>
