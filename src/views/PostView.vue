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
    <div class="transition-block">
      <div class="tb-shape s1"></div>
      <div class="tb-shape s2"></div>
      <div class="tb-lines"></div>
      <div class="tb-inner">
        <div class="tb-container">
          <div class="tb-header">
            <div class="tb-title">精选 · 推荐</div>
            <div class="tb-sub">根据你的阅读推荐</div>
          </div>
          <div class="tb-metrics">
            <div class="metric">
              <div class="n">{{ stats.chars }}</div>
              <div class="l">字数</div>
            </div>
            <div class="metric">
              <div class="n">{{ stats.mins }} 分钟</div>
              <div class="l">预计阅读</div>
            </div>
            <div class="metric">
              <div class="n">{{ post?.tags?.length || 0 }}</div>
              <div class="l">标签</div>
            </div>
            <div class="metric">
              <div class="n">{{ stats.outdatedDays }}</div>
              <div class="l">距上次更新(天)</div>
            </div>
          </div>
          <div class="tb-pills">
            <span class="pill">前端</span>
            <span class="pill">Vue 3</span>
            <span class="pill">Pinia</span>
            <span class="pill">性能优化</span>
            <span class="pill">工程化</span>
            <span class="pill">工具库</span>
          </div>
          <div class="tb-features" v-if="featuredPosts.length">
            <div
              class="feature"
              v-for="fp in featuredPosts"
              :key="fp.id"
              role="button"
              tabindex="0"
              @click="router.push({ name: 'post', params: { id: fp.id } })"
              @keydown.enter="router.push({ name: 'post', params: { id: fp.id } })"
            >
              <div class="feature-badge">推荐</div>
              <div
                class="feature-cover"
                :style="fp.cover ? { backgroundImage: `url(${fp.cover})` } : {}"
              ></div>
              <div class="feature-info">
                <div class="feature-title">{{ fp.title }}</div>
                <div class="feature-meta">{{ formatDate(fp.updatedAt || fp.publishedAt) }}</div>
                <div class="feature-tags">
                  <span v-for="t in (fp.tags || []).slice(0,2)" :key="t" class="pill sm">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="tb-features" v-else-if="loadingFeatured">
            <div class="feature skeleton" v-for="i in 3" :key="i">
              <div class="skeleton-shine"></div>
            </div>
          </div>
            <div class="tb-cta">
              <div
                class="btn ghost"
                role="button"
                tabindex="0"
                @click="router.push({ name: 'home' })"
                @keydown.enter="router.push({ name: 'home' })"
              >浏览更多</div>
              <div
                class="btn outline"
                role="button"
                tabindex="0"
                @click="router.push({ name: 'archive' })"
                @keydown.enter="router.push({ name: 'archive' })"
              >查看归档</div>
            </div>
        </div>
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
import Comments from "@/components/Comments.vue";
import { getFeaturedPosts } from "@/api/post.js";
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
const featuredPosts = ref([]);
const loadingFeatured = ref(true);

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
    try {
      loadingFeatured.value = true;
      const list = await getFeaturedPosts(route.params.id);
      if (Array.isArray(list)) featuredPosts.value = list;
    } catch {
    } finally {
      loadingFeatured.value = false;
    }
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
  height: 520px;
  margin: 18px 0 0;
  border-radius: 16px;
  border: 1px solid var(--theme-color-border);
  background:
    radial-gradient(600px 300px at 80% 20%, rgba(255, 255, 255, 0.08), transparent 60%),
    radial-gradient(420px 240px at 20% 75%, rgba(16, 185, 129, 0.10), transparent 65%),
    linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(16, 185, 129, 0.16));
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.transition-block:hover {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}
.transition-block::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0) 35%, rgba(255, 255, 255, 0.14) 50%, rgba(255, 255, 255, 0) 65%);
  mix-blend-mode: overlay;
  opacity: 0.7;
  transform: translateX(-40%);
  animation: sheen 6s linear infinite;
}
.transition-block::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 12px 12px;
  opacity: 0.35;
}
.tb-inner {
  position: absolute;
  inset: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}
.tb-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  background-image: linear-gradient(90deg, var(--theme-color-active), #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
 .tb-sub {
   color: var(--muted);
 }
.tb-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  margin: 14px 0 10px;
}
 .metric {
   border: 1px solid var(--theme-color-border);
   border-radius: 10px;
   padding: 8px 10px;
   background: rgba(255, 255, 255, 0.08);
   display: grid;
   gap: 4px;
 }
 .metric .n {
   font-weight: 800;
   color: var(--text);
 }
 .metric .l {
   font-size: 12px;
   color: var(--muted);
 }
.tb-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(2px);
}
.tb-cta {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
.tb-cta .btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
.tb-cta .btn.ghost {
  background: rgba(255, 255, 255, 0.16);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.tb-cta .btn.outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--theme-color-border);
}
.tb-cta .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color-active);
}
.tb-left {
  align-self: end;
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px) saturate(1.2);
  -webkit-backdrop-filter: blur(6px) saturate(1.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 14px 16px;
}
.tb-container {
  max-width: var(--content-w);
  margin: 0 auto;
  padding: 0 24px;
}
.tb-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}
.tb-title {
  position: relative;
}
.tb-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 140px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  opacity: 0.85;
}
.tb-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 12px;
}
.feature {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--theme-color-border);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  min-height: 180px;
}
.feature::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.05));
}
.feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16);
  border-color: var(--theme-color-active);
}
.feature-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.85);
  color: #fff;
  font-size: 12px;
  z-index: 2;
}
.feature-cover {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.05);
}
.feature-info {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  color: #fff;
}
.feature.skeleton {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.12));
  overflow: hidden;
}
.skeleton-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0) 80%);
  transform: translateX(-100%);
  animation: shine 1.6s ease-in-out infinite;
}
.pill:hover {
  background: rgba(255, 255, 255, 0.22);
}
.metric .n {
  font-size: 18px;
}
@keyframes shine {
  to {
    transform: translateX(100%);
  }
}
@media (max-width: 768px) {
  .tb-features {
    grid-template-columns: 1fr;
  }
}
.feature-title {
  font-weight: 800;
  margin-bottom: 4px;
}
.feature-meta {
  font-size: 12px;
  opacity: 0.85;
}
.feature-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
 .pill.sm {
   height: 24px;
   padding: 0 8px;
   font-size: 11px;
 }
.tb-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px
    ),
    linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px
    );
  background-size: 24px 24px;
  opacity: 0.4;
  filter: saturate(0.9);
  mix-blend-mode: soft-light;
}
.tb-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.6;
}
.tb-shape.s1 {
  width: 240px;
  height: 240px;
  left: -60px;
  top: -40px;
  background: radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.7), rgba(59, 130, 246, 0) 60%);
  animation: float1 12s ease-in-out infinite;
}
.tb-shape.s2 {
  width: 200px;
  height: 200px;
  right: -50px;
  bottom: -30px;
  background: radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.7), rgba(16, 185, 129, 0) 60%);
  animation: float2 14s ease-in-out infinite;
}
@keyframes float1 {
  0% { transform: translate(0, 0); }
  50% { transform: translate(14px, 10px); }
  100% { transform: translate(0, 0); }
}
@keyframes float2 {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-12px, -12px); }
  100% { transform: translate(0, 0); }
}
@keyframes sheen {
  0% {
    transform: translateX(-40%);
  }
  50% {
    transform: translateX(40%);
  }
  100% {
    transform: translateX(140%);
  }
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
