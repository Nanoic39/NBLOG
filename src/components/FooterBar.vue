<template>
  <footer class="footer" role="contentinfo">
    <div class="waves" aria-hidden="true">
      <canvas ref="waveCanvas" class="waves-canvas"></canvas>
    </div>
    <div class="inner footer-grid">
      <div class="left">
        <img :src="avatarUrl" alt="avatar" class="fb-avatar" />
        <div class="meta">
          <div class="brand">{{ brand }}</div>
          <div class="copy">© {{ year }} {{ copyright }}</div>
        </div>
      </div>
      <div class="center">
        <div class="motto" v-if="!metaLoading">{{ motto }}</div>
        <div class="motto" v-else>加载中…</div>
        <div class="runtime">网站已运行 {{ runtime }}</div>
      </div>
      <div class="right">
        <a
          class="badge icp"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener"
          >{{ icp }}</a
        >
        <a
          class="badge rss"
          href="/rss.xml"
          target="_blank"
          rel="noopener"
          aria-label="RSS"
          >RSS</a
        >
        <div class="pet" aria-hidden="true">🐱</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { usePostsStore } from "@/stores/posts";

const year = new Date().getFullYear();
const brand = ref("NBLOG");
const copyright = ref("NANO1C");
const motto = ref("君子慎独，笃行不怠");
const icp = ref("粤ICP备00000000号");
const avatarUrl = ref(
  new URL("@/static/image/Avatar.png", import.meta.url).href
);
const metaLoading = ref(true);
const createdAtMs = ref(null);
const runtime = ref("");
let timer;
const store = usePostsStore();

const siteStartFromPosts = computed(() => {
  const arr = store.posts || [];
  if (!arr.length) return new Date(year, 0, 1).getTime();
  let min = Date.now();
  for (const p of arr) {
    const t = new Date(p.publishedAt || p.updatedAt || Date.now()).getTime();
    if (!Number.isNaN(t)) min = Math.min(min, t);
  }
  return min;
});

function tsToMs(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (String(Math.floor(n)).length === 10) return n * 1000;
  return n;
}

function fmt(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

async function fetchMeta() {
  metaLoading.value = true;
  try {
    const data = await new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            motto: "求知若渴，虚心若愚",
            icp: "粤ICP备12345678号",
            avatar: null,
            brand: "NBLOG",
            copyright: "NANO1C",
            siteCreatedAt: Date.now() - 1000 * 60 * 60 * 24 * 123,
          }),
        300
      );
    });
    brand.value = data.brand || brand.value;
    copyright.value = data.copyright || copyright.value;
    motto.value = data.motto || motto.value;
    icp.value = data.icp || icp.value;
    if (data.avatar) avatarUrl.value = data.avatar;
    const ms = tsToMs(data.siteCreatedAt);
    createdAtMs.value = ms || siteStartFromPosts.value;
    // created date hidden per spec
  } catch {
    createdAtMs.value = siteStartFromPosts.value;
    // created date hidden per spec
  } finally {
    metaLoading.value = false;
  }
}

function updateRuntime() {
  const start = createdAtMs.value || siteStartFromPosts.value;
  const now = Date.now();
  let diff = Math.max(0, now - start);
  const d = Math.floor(diff / 86400000);
  diff -= d * 86400000;
  const h = Math.floor(diff / 3600000);
  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);
  diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  runtime.value = `${d}天 ${String(h).padStart(2, "0")}小时 ${String(
    m
  ).padStart(2, "0")}分 ${String(s).padStart(2, "0")}秒`;
}

onMounted(async () => {
  await fetchMeta();
  updateRuntime();
  timer = setInterval(updateRuntime, 1000);
  initWave();
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  destroyWave();
});
// Canvas wave like src/script/wave.js (vanilla implementation)
const waveCanvas = ref(null);
let wctx,
  wraf,
  wavePoints = [],
  waveWidth = 0,
  waveHeight = 0,
  pointSpacing = 6;
let prevAxis = null; // for velocity
const SPRING_K = 0.03,
  SPRING_F = 0.9,
  SPREAD = 0.25,
  INIT_RATE = 0.6,
  THRESHOLD = 60;
// fish
let fishes = [];
let reverse = false;
let intervalCount = 0;
let fishCount = 0;
const FISH_BASE = 1;
const MAX_INTERVAL_COUNT = 80;

function initWave() {
  const cvs = waveCanvas.value;
  if (!cvs) return;
  const el = cvs.parentElement;
  const rect = el.getBoundingClientRect();
  waveWidth = Math.max(300, Math.floor(rect.width));
  waveHeight = Math.max(32, Math.floor(rect.height));
  cvs.width = waveWidth;
  cvs.height = waveHeight;
  wctx = cvs.getContext("2d");
  buildPoints();
  // fish setup
  fishes = [];
  intervalCount = MAX_INTERVAL_COUNT;
  fishCount = 3;
  for (let i = 0; i < fishCount; i++) fishes.push(makeFish());
  bindWaveEvents(el);
  renderWave();
}
function destroyWave() {
  unbindWaveEvents(waveCanvas.value?.parentElement);
  cancelAnimationFrame(wraf);
}
function buildPoints() {
  wavePoints = [];
  const count = Math.round(waveWidth / pointSpacing);
  const spacing = waveWidth / (count - 1);
  for (let i = 0; i < count; i++) {
    wavePoints.push({
      x: i * spacing,
      init: waveHeight * INIT_RATE,
      h: waveHeight * INIT_RATE,
      fy: 0,
      fprev: 0,
      fnext: 0,
    });
  }
}
function updateSelf(p) {
  p.fy += SPRING_K * (p.init - p.h);
  p.fy *= SPRING_F;
  p.h += p.fy;
}
function updateNeighbors(idx) {
  const p = wavePoints[idx];
  const prev = wavePoints[idx - 1];
  const next = wavePoints[idx + 1];
  p.fprev = prev ? SPREAD * (p.h - prev.h) : 0;
  p.fnext = next ? SPREAD * (p.h - next.h) : 0;
}
function applyForces(idx) {
  const prev = wavePoints[idx - 1];
  const next = wavePoints[idx + 1];
  if (prev) {
    prev.h += wavePoints[idx].fprev;
    prev.fy += wavePoints[idx].fprev;
  }
  if (next) {
    next.h += wavePoints[idx].fnext;
    next.fy += wavePoints[idx].fnext;
  }
}
function interfere(x, y, v) {
  if (y < waveHeight / 2 - THRESHOLD || y > waveHeight / 2 + THRESHOLD) return;
  const idx = Math.round(x / (waveWidth / (wavePoints.length - 1)));
  const p = wavePoints[idx];
  if (!p) return;
  const acc =
    waveHeight * 0.01 * (waveHeight - p.h - y >= 0 ? -1 : 1) * Math.abs(v);
  p.fy = acc;
}
function generateEpicenter(x, y, v) {
  interfere(x, y, v);
}
function getRandom(min, max) {
  return min + (max - min) * Math.random();
}
function makeFish() {
  let direction = Math.random() < 0.5;
  let x = direction ? waveWidth + THRESHOLD : -THRESHOLD;
  let y = 0;
  let previousY = y;
  let vx = getRandom(0.8, 2.2) * (direction ? -1 : 1);
  let vy = 0;
  let ay = 0;
  const GRAVITY = 0.12;
  let isOut = false;
  let theta = 0;
  let phi = 0;

  function init() {
    direction = Math.random() < 0.5;
    x = direction ? waveWidth + THRESHOLD : -THRESHOLD;
    vx = getRandom(0.8, 2.2) * (direction ? -1 : 1);
    if (reverse) {
      y = getRandom((waveHeight * 1) / 10, (waveHeight * 4) / 10);
      vy = getRandom(0.4, 1.2);
      ay = getRandom(0.02, 0.06);
    } else {
      y = getRandom((waveHeight * 6) / 10, (waveHeight * 9) / 10);
      vy = getRandom(-1.2, -0.4);
      ay = getRandom(-0.06, -0.02);
    }
    previousY = y;
    isOut = false;
    theta = 0;
    phi = 0;
  }
  init();

  function reverseVertical() {
    isOut = !isOut;
    ay *= -1;
  }
  function controlStatus(ctx) {
    previousY = y;
    x += vx;
    y += vy;
    vy += ay;
    if (reverse) {
      if (y > waveHeight * INIT_RATE) {
        vy -= GRAVITY;
        isOut = true;
      } else {
        if (isOut) {
          ay = getRandom(0.02, 0.06);
        }
        isOut = false;
      }
    } else {
      if (y < waveHeight * INIT_RATE) {
        vy += GRAVITY;
        isOut = true;
      } else {
        if (isOut) {
          ay = getRandom(-0.06, -0.02);
        }
        isOut = false;
      }
    }
    if (!isOut) {
      theta += Math.PI / 80;
      theta %= Math.PI * 2;
      phi += Math.PI / 100;
      phi %= Math.PI * 2;
    }
    generateEpicenter(x + (direction ? -1 : 1) * THRESHOLD, y, y - previousY);
    if ((vx > 0 && x > waveWidth + THRESHOLD) || (vx < 0 && x < -THRESHOLD)) {
      init();
    }
  }
  function render(ctx) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI + Math.atan2(vy, vx));
    ctx.scale(1, direction ? 1 : -1);
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.bezierCurveTo(-20, 15, 15, 10, 40, 0);
    ctx.bezierCurveTo(15, -10, -20, -15, -30, 0);
    ctx.fill();

    ctx.save();
    ctx.translate(40, 0);
    ctx.scale(0.9 + 0.2 * Math.sin(theta), 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(5, 10, 20, 8);
    ctx.quadraticCurveTo(12, 5, 10, 0);
    ctx.quadraticCurveTo(12, -5, 20, -8);
    ctx.quadraticCurveTo(5, -10, 0, 0);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-3, 0);
    ctx.rotate((Math.PI / 3 + (Math.PI / 10) * Math.sin(phi)) * (reverse ? -1 : 1));
    ctx.beginPath();
    if (reverse) {
      ctx.moveTo(5, 0);
      ctx.bezierCurveTo(10, 10, 10, 30, 0, 40);
      ctx.bezierCurveTo(-12, 25, -8, 10, 0, 0);
    } else {
      ctx.moveTo(-5, 0);
      ctx.bezierCurveTo(-10, -10, -10, -30, 0, -40);
      ctx.bezierCurveTo(12, -25, 8, -10, 0, 0);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
    controlStatus(ctx);
  }
  return { render, reverseVertical };
}
function renderWave() {
  wraf = requestAnimationFrame(renderWave);
  // update
  for (let i = 0; i < wavePoints.length; i++) updateSelf(wavePoints[i]);
  for (let i = 0; i < wavePoints.length; i++) updateNeighbors(i);
  for (let i = 0; i < wavePoints.length; i++) applyForces(i);
  if (fishes.length < fishCount) {
    if (--intervalCount === 0) {
      intervalCount = MAX_INTERVAL_COUNT;
      fishes.push(makeFish());
    }
  }
  // draw
  wctx.clearRect(0, 0, waveWidth, waveHeight);
  wctx.fillStyle = "rgba(0,0,0,0.28)";
  for (let i = 0; i < fishes.length; i++) {
    fishes[i].render(wctx);
  }
  wctx.save();
  wctx.globalCompositeOperation = "xor";
  wctx.beginPath();
  wctx.moveTo(0, reverse ? 0 : waveHeight);
  for (let i = 0; i < wavePoints.length; i++) {
    const p = wavePoints[i];
    wctx.lineTo(p.x, waveHeight - p.h);
  }
  wctx.lineTo(waveWidth, reverse ? 0 : waveHeight);
  wctx.closePath();
  wctx.fillStyle = "rgba(59,130,246,0.10)";
  wctx.fill();
  wctx.restore();
}
function bindWaveEvents(el) {
  el.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
}
function unbindWaveEvents(el) {
  if (el) el.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", onResize);
}
function onMouseMove(e) {
  const rect = waveCanvas.value.parentElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (!prevAxis) prevAxis = { x, y };
  interfere(x, y, y - prevAxis.y);
  prevAxis = { x, y };
}
let resizeTimer;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    destroyWave();
    initWave();
  }, 120);
}
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 24px;
  background: var(--panel);
  border-top: none;
  position: relative;
  min-height: 300px;
}
.waves {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100px;
  overflow: hidden;
}
.waves-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.inner {
  max-width: var(--content-w);
  margin: 0 auto;
  padding: 34px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-grid {
  gap: 18px;
}
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.fb-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--theme-color-border);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}
.meta {
  display: grid;
  gap: 4px;
}
.brand {
  font-weight: 900;
  letter-spacing: 0.6px;
  color: var(--text);
  padding: 8px 12px;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 3px 6px rgba(0, 0, 0, 0.12);
}
.copy {
  color: var(--muted);
}
.center {
  display: grid;
  gap: 8px;
}
.motto {
  color: var(--text);
  font-weight: 800;
  font-size: 18px;
}
.created {
  color: var(--muted);
}
.runtime {
  color: var(--muted);
  font-size: 16px;
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--theme-color-border);
  background: rgba(0, 0, 0, 0.04);
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}
.pill:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}
.pill:active {
  transform: scale(0.98);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}
.to-top {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.14),
    rgba(59, 130, 246, 0.06)
  );
  border-color: var(--theme-color-active);
}
.badge {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px dashed var(--theme-color-border);
  color: var(--muted);
  text-decoration: none;
  transition: all 0.15s ease;
}
.badge:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}
.rss {
  background: linear-gradient(
    180deg,
    rgba(255, 153, 0, 0.18),
    rgba(255, 153, 0, 0.08)
  );
  color: #ffa640;
  border-color: #ffa64033;
}
.rss:hover {
  color: #ff9900;
}
.pet {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid var(--theme-color-border);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}
@media (max-width: 700px) {
  .inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
