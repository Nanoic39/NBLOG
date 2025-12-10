<template>
  <nav v-if="show" class="toc-root" role="navigation" aria-label="文章目录">
    <div class="read-progress" aria-hidden="true">
      <div class="bar" :style="{ width: (100 - progress) + '%' }"></div>
    </div>
    <div class="toc-title">目录</div>
    <ul class="toc-list" role="tree">
      <li
        v-for="node in sections"
        :key="node.id"
        class="toc-item"
        :style="{ paddingLeft: (node.level - baseLevel) * 12 + 'px' }"
      >
        <button
          v-if="node.children.length"
          class="toc-toggle"
          :class="{ current: isActiveOrAncestor(node.id) }"
          role="button"
          :aria-expanded="isOpen(node.id)"
          :aria-controls="node.id + '-sub'"
          @click="toggle(node.id)"
        >
          <span class="chev">{{ isOpen(node.id) ? "▾" : "▸" }}</span>
          <span class="name" :class="{ current: activeId === node.id }">{{
            node.text
          }}</span>
        </button>
        <a
          v-else
          href="#"
          class="toc-toggle leaf"
          :class="{ current: activeId === node.id }"
          @click.prevent="scrollTo(node.id)"
          >{{ node.text }}</a
        >
        <ul
          v-if="node.children.length"
          :id="node.id + '-sub'"
          class="toc-sub"
          :class="{ open: isOpen(node.id) }"
          role="group"
        >
          <li
            v-for="child in node.children"
            :key="child.id"
            class="toc-sub-item"
            :style="{ paddingLeft: (child.level - baseLevel) * 12 + 'px' }"
          >
            <button
              v-if="child.children.length"
              class="toc-toggle minor"
              :class="{ current: isActiveOrAncestor(child.id) }"
              role="button"
              :aria-expanded="isOpen(child.id)"
              :aria-controls="child.id + '-sub'"
              @click="toggle(child.id)"
            >
              <span class="chev">{{ isOpen(child.id) ? "▾" : "▸" }}</span>
              <span
                class="name"
                :class="{ current: activeId === child.id }"
                @click.stop="scrollTo(child.id)"
                >{{ child.text }}</span
              >
            </button>
            <a
              v-else
              href="#"
              class="toc-toggle leaf"
              :class="{ current: activeId === child.id }"
              @click.prevent="scrollTo(child.id)"
              >{{ child.text }}</a
            >
            <ul
              v-if="child.children.length"
              :id="child.id + '-sub'"
              class="toc-sub"
              :class="{ open: isOpen(child.id) }"
              role="group"
            >
              <li
                v-for="gchild in child.children"
                :key="gchild.id"
                class="toc-sub-item"
                :style="{ paddingLeft: (gchild.level - baseLevel) * 12 + 'px' }"
              >
                <a
                  href="#"
                  @click.prevent="scrollTo(gchild.id)"
                  :class="{ current: activeId === gchild.id }"
                  >{{ gchild.text }}</a
                >
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";

const route = useRoute();
const show = computed(() => route.name === "post");

const sections = ref([]);
const openIds = ref(new Set());
const activeId = ref("");
const idToNode = new Map();
const parentMap = new Map();
const baseLevel = ref(2);
let suppressActiveUntil = 0;
let headingEls = [];
let ticking = false;
let scrollBound = false;
const progress = ref(0);
const lastOpenState = new Map();
function updateSubHeights() {
  requestAnimationFrame(() => {
    const subs = Array.from(document.querySelectorAll(".toc-sub"));
    subs.forEach((ul) => {
      const id = (ul.id || "").replace(/-sub$/, "");
      if (!id) return;
      const prev = lastOpenState.get(id) || false;
      const curr = isOpen(id);
      lastOpenState.set(id, curr);
      if (curr) {
        ul.style.maxHeight = ul.scrollHeight + "px";
        ul.style.opacity = "1";
        if (!prev) {
          ul.classList.add("opening");
          requestAnimationFrame(() => ul.classList.remove("opening"));
        }
      } else {
        ul.style.maxHeight = "0px";
        ul.style.opacity = "0";
        ul.classList.remove("opening");
      }
    });
  });
}

function isActiveOrAncestor(id) {
  if (activeId.value === id) return true;
  let cur = activeId.value;
  while (parentMap.has(cur)) {
    const p = parentMap.get(cur);
    if (p === id) return true;
    cur = p;
  }
  return false;
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildTree() {
  const root = [];
  const used = new Set();
  idToNode.clear();
  parentMap.clear();
  const sel = ["h1", "h2", "h3", "h4", "h5", "h6"]
    .map((s) => `.post .content ${s}`)
    .join(", ");
  const heads = Array.from(document.querySelectorAll(sel));
  if (!heads.length) {
    sections.value = [];
    return;
  }
  let minLevel = 6;
  const lastByLevel = Array(7).fill(null);
  heads.forEach((h) => {
    const level = Number(h.tagName[1]);
    minLevel = Math.min(minLevel, level);
    let id = h.id;
    if (!id) {
      let base = slugify(h.textContent) || "section";
      id = base;
      let n = 1;
      while (used.has(id)) {
        id = `${base}-${n++}`;
      }
      h.id = id;
    }
    used.add(id);
    const node = { id, text: h.textContent, level, children: [] };
    idToNode.set(id, node);
    // find parent: nearest previous smaller level
    let parent = null;
    for (let l = level - 1; l >= 1; l--) {
      if (lastByLevel[l]) {
        parent = lastByLevel[l];
        break;
      }
    }
    if (parent) {
      parent.children.push(node);
      parentMap.set(id, parent.id);
    } else {
      root.push(node);
    }
    lastByLevel[level] = node;
    for (let l = level + 1; l <= 6; l++) lastByLevel[l] = null;
  });
  baseLevel.value = Math.max(minLevel, 2);
  sections.value = root;
}

function expandPath(id) {
  const s = new Set(openIds.value);
  const chain = [];
  let cur = id;
  chain.push(cur);
  while (parentMap.has(cur)) {
    cur = parentMap.get(cur);
    chain.push(cur);
  }
  for (const nid of chain) {
    s.add(nid);
    closeSiblingsInSet(nid, s);
  }
  openIds.value = s;
  updateSubHeights();
}

function isOpen(id) {
  return openIds.value.has(id);
}
function toggle(id) {
  const s = new Set(openIds.value);
  if (s.has(id)) {
    closeBranchInSet(id, s);
  } else {
    s.add(id);
    closeSiblingsInSet(id, s);
  }
  openIds.value = s;
  updateSubHeights();
}

function getScrollOffset() {
  const cs = getComputedStyle(document.documentElement);
  const topbar = parseFloat(cs.getPropertyValue("--topbar-h")) || 60;
  const gap = parseFloat(cs.getPropertyValue("--gap")) || 24;
  return topbar + gap + 16;
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = getScrollOffset();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  suppressActiveUntil = Date.now() + 300;
  activeId.value = id;
  expandPath(id);
  window.scrollTo({ top, behavior: "smooth" });
}

function collectHeads() {
  const sel = ["h1", "h2", "h3", "h4", "h5", "h6"]
    .map((s) => `.post .content ${s}`)
    .join(", ");
  headingEls = Array.from(document.querySelectorAll(sel));
}

function updateActiveByAnchor(forceExpandOnly = false) {
  if (!headingEls.length) return;
  const offset = getScrollOffset();
  const anchor = window.scrollY + offset;
  let chosenId = headingEls[0].id;
  for (let i = 0; i < headingEls.length; i++) {
    const top = headingEls[i].getBoundingClientRect().top + window.scrollY;
    if (top <= anchor) chosenId = headingEls[i].id;
    else break;
  }
  if (forceExpandOnly) {
    expandPath(chosenId);
  } else if (activeId.value !== chosenId) {
    activeId.value = chosenId;
    expandPath(chosenId);
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      if (Date.now() < suppressActiveUntil) {
        updateActiveByAnchor(true);
      } else {
        updateActiveByAnchor();
      }
      updateProgress();
      ticking = false;
    });
  }
}

function closeBranchInSet(id, s) {
  if (s.has(id)) s.delete(id);
  const node = idToNode.get(id);
  if (node && node.children && node.children.length) {
    for (const c of node.children) closeBranchInSet(c.id, s);
  }
}

function closeSiblingsInSet(id, s) {
  const pid = parentMap.get(id);
  const siblings = pid ? idToNode.get(pid)?.children || [] : sections.value;
  for (const n of siblings) {
    if (n.id !== id) closeBranchInSet(n.id, s);
  }
}

let mo;
let findTimer;
function observeDom(el) {
  if (!el) return;
  if (mo) mo.disconnect();
  mo = new MutationObserver(async () => {
    await nextTick();
    buildTree();
    staggerRootItems();
  });
  mo.observe(el, { childList: true, subtree: true });
}

function ensureObserve() {
  if (findTimer) clearInterval(findTimer);
  let tries = 0;
  findTimer = setInterval(async () => {
    const el = document.querySelector(".post .content");
    if (el) {
      clearInterval(findTimer);
      await nextTick();
      buildTree();
      collectHeads();
      updateActiveByAnchor();
      observeDom(el);
      if (scrollBound) {
        window.removeEventListener("scroll", onScroll);
        scrollBound = false;
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      scrollBound = true;
      updateSubHeights();
      staggerRootItems();
      updateProgress();
    } else if (++tries > 60) {
      clearInterval(findTimer);
    }
  }, 50);
}

onMounted(async () => {
  await nextTick();
  ensureObserve();
});
onBeforeUnmount(() => {
  if (mo) mo.disconnect();
  if (findTimer) clearInterval(findTimer);
  if (scrollBound) {
    window.removeEventListener("scroll", onScroll);
    scrollBound = false;
  }
});
watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    ensureObserve();
  }
);
watch(openIds, async () => {
  await nextTick();
  updateSubHeights();
});

function staggerRootItems() {
  requestAnimationFrame(() => {
    const ul = document.querySelector('.toc-list');
    if (!ul) return;
    ul.classList.remove('ready');
    // force reflow
    void ul.offsetWidth;
    ul.classList.add('ready');
  })
}

function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const y = window.scrollY;
  let p = 0;
  if (h > 0) p = (y / h) * 100;
  if (p < 0) p = 0;
  if (p > 100) p = 100;
  progress.value = Math.round(p * 100) / 100;
}
</script>

<style scoped>
.read-progress {
  position: relative;
  width: 100%;
  height: 9px;
  border-radius: 999px;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444);
  overflow: hidden;
  margin-bottom: 10px;
}
.read-progress .bar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background: var(--panel);
  transition: width 0.12s linear;
}
.toc-root {
}
.toc-title {
  font-weight: 700;
  margin-bottom: 8px;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.toc-list .toc-item { opacity: 0; transform: translateY(8px); }
.toc-list.ready .toc-item { opacity: 1; transform: translateY(0); transition: opacity 0.24s ease, transform 0.24s ease; }
.toc-list.ready .toc-item:nth-child(1) { transition-delay: 40ms; }
.toc-list.ready .toc-item:nth-child(2) { transition-delay: 80ms; }
.toc-list.ready .toc-item:nth-child(3) { transition-delay: 120ms; }
.toc-list.ready .toc-item:nth-child(4) { transition-delay: 160ms; }
.toc-list.ready .toc-item:nth-child(5) { transition-delay: 200ms; }
.toc-list.ready .toc-item:nth-child(6) { transition-delay: 240ms; }
.toc-list.ready .toc-item:nth-child(7) { transition-delay: 280ms; }
.toc-list.ready .toc-item:nth-child(8) { transition-delay: 320ms; }
.toc-list.ready .toc-item:nth-child(9) { transition-delay: 360ms; }
.toc-list.ready .toc-item:nth-child(10) { transition-delay: 400ms; }
.toc-item {
}
.toc-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--theme-color-border);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
}
.toc-toggle.minor {
  background: rgba(0, 0, 0, 0.03);
}
.toc-toggle.leaf {
  background: rgba(0, 0, 0, 0.03);
}
.toc-toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.toc-toggle.current {
  background: rgba(59, 130, 246, 0.12);
  border-color: var(--theme-color-active);
}
.toc-toggle.current:hover {
  background: rgba(59, 130, 246, 0.12);
  box-shadow: none;
  cursor: default;
}
.toc-toggle.current .chev {
  color: var(--theme-color-active);
}
.chev {
  width: 16px;
  text-align: center;
  color: var(--muted);
}
.name {
  color: var(--text);
}
.name.current {
  font-weight: 700;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 6px;
  padding: 0 4px;
}
.toc-sub {
  list-style: none;
  padding: 4px 2px 0;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
  will-change: max-height, opacity;
}
.toc-sub .toc-sub-item { opacity: 0; transform: translateY(6px); }
.toc-sub.open .toc-sub-item { opacity: 1; transform: translateY(0); transition: opacity 0.22s ease, transform 0.22s ease; }
.toc-sub.open .toc-sub-item:nth-child(1) { transition-delay: 30ms; }
.toc-sub.open .toc-sub-item:nth-child(2) { transition-delay: 60ms; }
.toc-sub.open .toc-sub-item:nth-child(3) { transition-delay: 90ms; }
.toc-sub.open .toc-sub-item:nth-child(4) { transition-delay: 120ms; }
.toc-sub.open .toc-sub-item:nth-child(5) { transition-delay: 150ms; }
.toc-sub.open .toc-sub-item:nth-child(6) { transition-delay: 180ms; }
.toc-sub.open .toc-sub-item:nth-child(7) { transition-delay: 210ms; }
.toc-sub.open .toc-sub-item:nth-child(8) { transition-delay: 240ms; }
.toc-sub.open .toc-sub-item:nth-child(9) { transition-delay: 270ms; }
.toc-sub.open .toc-sub-item:nth-child(10) { transition-delay: 300ms; }
.toc-sub-item {
  padding: 2px 4px;
}
.toc-sub a {
  display: inline-block;
  color: var(--theme-color-active);
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px dashed var(--theme-color-border);
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.15s ease-in-out;
}
.toc-sub a.current {
  font-weight: 700;
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  border-color: var(--theme-color-active);
}
.toc-sub a.current:hover {
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  border-color: var(--theme-color-active);
  cursor: default;
}
.toc-sub a:hover {
  text-decoration: none;
  background: rgba(255, 255, 255, 0.06);
}

@media (max-width: 1899px) {
  .toc-root {
    display: none;
  }
  .read-progress { display: none; }
}
</style>
