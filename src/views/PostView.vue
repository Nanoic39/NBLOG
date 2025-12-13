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
      <Comments :post-id="route.params.id" />
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
import { computed, ref, onMounted, nextTick, watch, onBeforeUnmount } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import { attachImageZoom } from "@/script/imageZoom.js";
import Comments from "@/components/Comments.vue";
import { enhanceMediaPlayers } from "@/script/mediaEnhancers.js";
import { escapeHtml, highlightLine, getLangRules } from "@/script/htmlUtils.js";
import {
  restoreScroll as restoreScrollUtil,
  bindImageLoadRestore as bindImageLoadRestoreUtil,
} from "@/script/scrollUtils.js";
import { bindDetailsFoldAnimations as bindDetailsFoldAnimationsUtil } from "@/script/detailsFold.js";
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

function restoreScroll() {
  restoreScrollUtil(route.params.id);
}

function bindImageLoadRestore() {
  bindImageLoadRestoreUtil(".post .content", route.params.id);
}

function bindDetailsFoldAnimations() {
  bindDetailsFoldAnimationsUtil(".post .content");
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
