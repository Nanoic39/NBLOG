<template>
  <div class="about-page">
    <div class="hero">
      <div class="hero-avatar">
        <img :src="avatar" alt="NANO1C Avatar" />
      </div>
      <div class="hero-title">关于 · NANO1C ✨</div>
    </div>

    <div class="cards">
      <section class="card intro gradient">
        <div class="intro-title">你好👋，我是 NANO1C</div>
        <div class="intro-sub">{{ about.body || "记录前端、工程化与技术思考。" }}</div>
      </section>
      <section class="card info">
        <div class="info-row"><span class="k">邮箱 ✉️</span><span class="v">nanoic39@gmail.com</span></div>
        <div class="info-row"><span class="k">GitHub 🐙</span><span class="v">github.com/Nanoic39</span></div>
        <div class="info-row"><span class="k">标签</span><span class="v">前端 / 工程化 / 设计</span></div>
      </section>
      <section class="card stats">
        <div class="stat">
          <div class="icon-lg" aria-hidden="true">📝</div>
          <div class="stat-body">
            <div class="stat-n" aria-label="文章数">{{ postsCount }}</div>
            <div class="stat-l">文章数</div>
          </div>
        </div>
        <div class="stat">
          <div class="icon-lg" aria-hidden="true">⏱️</div>
          <div class="stat-body">
            <div class="stat-n" aria-label="距离最近更新天数">{{ daysSinceLastUpdate }}</div>
            <div class="stat-l">距最近更新(天)</div>
          </div>
        </div>
      </section>
      <section class="card roadmap">
        <div class="card-title">近期计划 📅</div>
        <div class="rm-list" role="list">
          <div class="rm-item" role="listitem">
            <div class="icon-lg" aria-hidden="true">⚙️</div>
            <div class="rm-body">
              <div class="rm-title">工程化优化</div>
              <div class="rm-sub">完善构建与缓存策略，提升发布效率</div>
            </div>
          </div>
          <div class="rm-item" role="listitem">
            <div class="icon-lg" aria-hidden="true">🎨</div>
            <div class="rm-body">
              <div class="rm-title">主题与样式升级</div>
              <div class="rm-sub">统一视觉系统与无障碍对比度</div>
            </div>
          </div>
          <div class="rm-item" role="listitem">
            <div class="icon-lg" aria-hidden="true">🧭</div>
            <div class="rm-body">
              <div class="rm-title">导航与信息架构</div>
              <div class="rm-sub">优化入口层级与内容查找体验</div>
            </div>
          </div>
        </div>
      </section>
      <section class="card jpn wide">
        <div class="jpn-text">おーす</div>
      </section>

      <section class="card skills-map">
        <div class="card-title">技能图谱 🧭</div>
        <div class="chips">
          <span class="chip">Vue 3 🟢</span>
          <span class="chip">Pinia 🌿</span>
          <span class="chip">TypeScript 🔷</span>
          <span class="chip">Vite ⚡</span>
          <span class="chip">Router 🧭</span>
          <span class="chip">Axios 📨</span>
          <span class="chip">CSS 🎨</span>
          <span class="chip">SCSS 🧵</span>
          <span class="chip">Prisma 🧱</span>
          <span class="chip">Node.js 🟩</span>
        </div>
      </section>
      <section class="card growth">
        <div class="card-title">无限进步 ♾️</div>
        <div class="bars">
          <div class="bar">
            <div class="bar-head"><span>前端</span><span>75%</span></div>
            <div class="bar-line"><span class="fill" style="--p:75"></span></div>
          </div>
          <div class="bar">
            <div class="bar-head"><span>工程化</span><span>68%</span></div>
            <div class="bar-line"><span class="fill" style="--p:68"></span></div>
          </div>
          <div class="bar">
            <div class="bar-head"><span>设计</span><span>52%</span></div>
            <div class="bar-line"><span class="fill" style="--p:52"></span></div>
          </div>
        </div>
      </section>

      <section class="card personality">
        <div class="card-title">人格类型</div>
        <div class="personality-tag">ISTJ</div>
        <div class="personality-sub">偏好秩序与可靠，强调可控与长期主义。</div>
      </section>
      <section class="card quotes">
        <div class="quote blue">
          <div class="quote-text">我们每天所经历的日常，也许就是连接发生的奇迹。</div>
        </div>
        <div class="quote pink">
          <div class="quote-text">生活虽不易，但总能从某处发现微光。</div>
        </div>
      </section>

      <section class="card why">
        <div class="card-title">为什么独立？</div>
        <div class="why-body">
          记录、探索与分享。用代码与设计表达想法，追求稳定与美感的平衡。关注可维护性、性能与用户体验，在约束中寻找更优解。
        </div>
      </section>
      <section class="card portfolio">
        <div class="card-title">项目展示 🧩</div>
        <div class="pf-grid">
          <div class="pf-item">
            <div class="pf-badge">工具链</div>
            <div class="pf-title">构建与缓存</div>
            <div class="pf-sub">优化开发与发布体验</div>
          </div>
          <div class="pf-item">
            <div class="pf-badge">组件库</div>
            <div class="pf-title">统一风格</div>
            <div class="pf-sub">复用与一致性提升</div>
          </div>
          <div class="pf-item">
            <div class="pf-badge">主题</div>
            <div class="pf-title">视觉系统</div>
            <div class="pf-sub">渐变、阴影与动效</div>
          </div>
          <div class="pf-item">
            <div class="pf-badge">可访问性</div>
            <div class="pf-title">WCAG AA</div>
            <div class="pf-sub">对比度与焦点管理</div>
          </div>
        </div>
      </section>

      <section class="card plan wide">
        <div class="card-head">
          <div class="card-title">十年之约 🗓️</div>
          <div class="plan-range">起止时间：{{ timeRangeText }}</div>
        </div>
        <div class="plan-content">
          <div class="ring" :style="{ '--deg': ringDeg + 'deg' }">
            <div class="ring-hole"></div>
            <div class="ring-center">🌀 十年之约</div>
          </div>
          <div class="plan-info">
            <div class="plan-body">
              持续创作与迭代，以公开透明的方式记录成长。每年复盘目标与方法，保持初心与好奇。
            </div>
            <div class="plan-bar">
              <span class="plan-fill" :style="{ '--pp': progressPct }"></span>
            </div>
            <div class="plan-note">创作进行中</div>
          </div>
        </div>
      </section>
    </div>

    <div class="footer-actions">
      <RouterLink class="btn" :to="{ name: 'home' }">首页</RouterLink>
      <RouterLink class="btn outline" :to="{ name: 'archive' }">归档</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { usePostsStore } from "@/stores/posts";
import { pagePreloader } from "@/utils/PagePreloader.js";
import { getAboutInfo } from "@/api/mock/index.js";
import avatar from "@/static/image/Avatar.png";

const store = usePostsStore();
const sorted = computed(() => store.sorted);
const postsCount = computed(() => sorted.value.length);
const lastUpdatedText = computed(() => {
  const latest = sorted.value
    .map((p) => p?.updatedAt || p?.publishedAt)
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a)[0];
  if (!latest) return "-";
  const dt = new Date(latest);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
});
const daysSinceLastUpdate = computed(() => {
  const latest = sorted.value
    .map((p) => p?.updatedAt || p?.publishedAt)
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a)[0];
  if (!latest) return 0;
  return Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24));
});

const about = ref({ title: "关于", body: "" });
const msDay = 1000 * 60 * 60 * 24;
const decadeStart = computed(() => new Date(2024, 8, 1));
const decadeEnd = computed(() => {
  return new Date(
    decadeStart.value.getFullYear() + 10,
    decadeStart.value.getMonth(),
    decadeStart.value.getDate()
  );
});
const daysTotal = computed(() =>
  Math.max(1, Math.ceil((decadeEnd.value.getTime() - decadeStart.value.getTime()) / msDay))
);
const daysPassed = computed(() =>
  Math.max(0, Math.floor((Date.now() - decadeStart.value.getTime()) / msDay))
);
const progressPct = computed(() =>
  Math.min(100, Math.max(0, Math.round((daysPassed.value / daysTotal.value) * 1000) / 10))
);
const ringDeg = computed(() => Math.round(progressPct.value * 3.6));
function formatCnDate(d) {
  if (!d) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}年${m}月${day}日`;
}
const timeRangeText = computed(() => {
  return `${formatCnDate(decadeStart.value)} - ${formatCnDate(decadeEnd.value)}`;
});

let raf = 0;
function bindSpotlight() {
  const root = document.querySelector(".cards");
  if (!root) return;
  function onMove(e) {
    const rect = root.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      root.style.setProperty("--mx", x + "%");
      root.style.setProperty("--my", y + "%");
    });
  }
  root.addEventListener("mousemove", onMove);
  root.addEventListener("mouseleave", () => {
    root.style.removeProperty("--mx");
    root.style.removeProperty("--my");
  });
  return () => {
    root.removeEventListener("mousemove", onMove);
  };
}
let cleanup = null;
onMounted(async () => {
  pagePreloader.attach(null);
  try {
    const info = await getAboutInfo();
    about.value = info || about.value;
  } catch {}
  cleanup = bindSpotlight();
});
onBeforeUnmount(() => {
  if (cleanup) cleanup();
  if (raf) cancelAnimationFrame(raf);
});
</script>

<style scoped>
.about-page {
  max-width: var(--content-w);
  margin: 0 auto;
  padding: 12px 0;
  position: relative;
}
.about-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
    radial-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px);
  background-size: 14px 14px, 20px 20px;
  mix-blend-mode: soft-light;
  opacity: 0.5;
}
.hero {
  display: grid;
  justify-items: center;
  gap: 8px;
  margin: 8px 0 20px;
  position: relative;
}
.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.hero::after {
  content: "";
  position: absolute;
  bottom: -6px;
  width: 160px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  opacity: 0.9;
}
.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--theme-color-border);
  background: rgba(255, 255, 255, 0.7);
  font-size: 32px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}
.hero-title {
  font-size: 28px;
  font-weight: 800;
}
.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(340px, 1fr));
  gap: 24px;
  position: relative;
  --mx: 50%;
  --my: 50%;
  --card-h: 180px;
  --card-gap: 16px;
}
.card {
  border: 1px solid var(--theme-color-border);
  border-radius: 18px;
  background: var(--panel);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  padding: 22px 24px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  position: relative;
  min-height: var(--card-h);
}
.card > * + * {
  margin-top: var(--card-gap);
}
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(300px 300px at var(--mx) var(--my), rgba(59, 130, 246, 0.12), transparent 60%);
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
}
.card:hover::before {
  opacity: 1;
}
.card.wide {
  grid-column: 1 / -1;
  min-height: var(--card-h);
}
.card-title {
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 8px;
  position: relative;
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.card-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 120px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  opacity: 0.85;
}
.intro.gradient {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(16, 185, 129, 0.18)), var(--panel);
}
.intro-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--text);
}
.intro-sub {
  color: var(--muted);
  font-size: 18px;
}
.info .info-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
}
.info .k {
  color: var(--muted);
}
.info .v {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
}
.jpn {
  display: grid;
  place-items: center;
  border-radius: 24px;
  min-height: 160px;
  position: relative;
  background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2)), var(--panel);
}
.jpn-text {
  font-size: clamp(64px, 8vw, 96px);
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #60a5fa, #34d399, #f59e0b, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% 100%;
  animation: hueShift 6s linear infinite;
}
.jpn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  mix-blend-mode: overlay;
  pointer-events: none;
}
.skills-map .chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  font-weight: 700;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color-active);
}
.bars {
  display: grid;
  gap: 10px;
}
.bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--muted);
}
.bar-line {
  position: relative;
  height: 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}
.bar-line .fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  width: calc(var(--p, 50) * 1%);
  transition: width 0.9s ease-out;
  will-change: width;
}
.personality {
  display: grid;
  gap: 6px;
}
.personality-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 800;
}
.personality-sub {
  color: var(--muted);
}
.quote {
  border-radius: 16px;
  color: #fff;
  padding: 20px 22px;
}
.quote.blue {
  background: linear-gradient(135deg, #60a5fa, #38bdf8);
}
.quote.pink {
  background: linear-gradient(135deg, #fb7185, #f472b6);
}
.quote-text {
  font-weight: 800;
  font-size: 18px;
}
.why-body,
.plan-body {
  color: var(--text);
  line-height: 1.7;
}
.plan.wide {
  position: relative;
}
.plan.wide::after {
  content: "";
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 80px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  opacity: 0.35;
}
.plan-content {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
}
.plan-range {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--theme-color-active);
  font-weight: 700;
  font-size: 18px;
}
.ring {
  --size: 120px;
  width: calc(var(--size) * 1.2);
  height: calc(var(--size) * 1.2);
  border-radius: 50%;
  background: conic-gradient(var(--theme-color-active) var(--deg), rgba(255, 255, 255, 0.16) 0);
  position: relative;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}
.ring-hole {
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  background: var(--panel);
}
.ring-inner {
  display: none;
}
.ring-center {
  position: relative;
  font-weight: 800;
  font-size: 18px;
}
.plan-info .plan-body {
  margin-bottom: 6px;
}
.plan-bar {
  position: relative;
  height: 12px;
  border-radius: 999px;
  border: 1px solid var(--theme-color-border);
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}
.plan-bar .plan-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: calc(var(--pp, 0) * 1%);
  background: linear-gradient(90deg, var(--theme-color-active), #10b981);
  transition: width 0.9s ease-out;
}
.plan-note {
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
}
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px 0 8px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--theme-color-border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  border-color: var(--theme-color-active);
}
.btn:focus-visible {
  outline: 3px solid var(--theme-color-active);
  outline-offset: 2px;
}
.btn.primary {
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  border-color: var(--theme-color-active);
}
/* 自适配最后一行填充：仅剩1个时占满整行；剩2个时第一张占两列 */
/* 统计卡：关键数据36px与图标32x32，元素间距16px */
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.roadmap .rm-list {
  display: grid;
  gap: 12px;
}
.rm-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: center;
}
.rm-title {
  font-weight: 700;
}
.rm-sub {
  color: var(--muted);
  font-size: 12px;
}
.quick .q-list {
  display: none;
}
.portfolio .pf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.pf-item {
  display: grid;
  gap: 6px;
  border: 1px solid var(--theme-color-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.7));
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}
.pf-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--theme-color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 12px;
}
.pf-title {
  font-weight: 800;
}
.pf-sub {
  color: var(--muted);
  font-size: 12px;
}
.ms-title {
  font-weight: 700;
}
.ms-sub {
  color: var(--muted);
  font-size: 12px;
}
.stat {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: center;
}
.icon-lg {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 22px;
}
.stat-body {
  display: grid;
  gap: 4px;
}
.stat-n {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.1;
}
.stat-l {
  color: var(--muted);
  font-size: 12px;
}
.btn.outline {
  background: transparent;
}
@media (max-width: 1024px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .plan-content {
    grid-template-columns: 120px 1fr;
  }
}
@media (max-width: 768px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .plan-content {
    grid-template-columns: 1fr;
  }
  .ring {
    margin: 0 auto;
  }
}
</style>
