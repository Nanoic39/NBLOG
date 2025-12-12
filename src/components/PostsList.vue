<template>
  <div class="posts-list">
    <RouterLink
      v-for="p in posts"
      :key="p.id"
      class="post-item"
      :to="`/post/${p.id}`"
    >
      <div class="thumb">
        <img
          class="cover"
          :src="resolvedCover(p.cover)"
          :alt="p.title"
          :class="{ loaded: loaded.has(p.id) }"
          @load="onImgLoad(p.id)"
        />
      </div>
      <div class="content">
        <div class="meta">
          <span class="date">{{ formatDate(p.publishedAt) }}</span>
          <div class="tags">
            <span v-for="t in p.tags" :key="t" class="tag"
              ><span class="ti">{{ tagIcon(t) }}</span
              >{{ t }}</span
            >
          </div>
        </div>
        <h3 class="title">{{ p.title }}</h3>
        <p class="summary">{{ p.summary }}</p>
        <div class="footer">
          <span class="mins">约 {{ p.readMins }} 分钟阅读</span>
          <span class="cta">阅读更多 →</span>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue";
import { pagePreloader } from "@/utils/PagePreloader.js";
const props = defineProps({ posts: { type: Array, default: () => [] } });
const loaded = ref(new Set());
function resolvedCover(url) {
  return pagePreloader.getImageSrc(url);
}
function onImgLoad(id) {
  const s = new Set(loaded.value);
  s.add(id);
  loaded.value = s;
}
function formatDate(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

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
</script>

<style lang="scss">
.posts-list {
  display: grid;
  gap: 18px;
}
.post-item {
  display: grid;
  // tumb(图片)宽度
  grid-template-columns: 300px 1fr;
  gap: 16px;
  position: relative;
  text-decoration: none;
  color: inherit;
  background: var(--panel);
  border-radius: 14px;
  padding: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.post-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.9),
    rgba(59, 130, 246, 0.3)
  );
}
.post-item::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    ),
    repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.025) 0 2px,
      transparent 2px 4px
    );
  background-size: 12px 12px, 8px 8px;
  opacity: 0.18;
}
.post-item:hover {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
  transform: translateY(-3px);
}
.thumb {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(180deg, #f4f4f4, #e9e9e9);
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.thumb img.loaded {
  opacity: 1;
}
.content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}
.date {
  font-size: 12px;
  color: var(--muted);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
  border-radius: 5px;
  padding: 5px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.18);
}
.date::before {
  content: "📅";
  font-size: 13px;
  opacity: 0.85;
}
.tags {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tag {
  font-size: 12px;
  color: var(--muted);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
  border-radius: 999px;
  padding: 2px 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: background 0.15s ease, color 0.15s ease;
}
.tag .ti {
  margin-right: 6px;
}
.tag:hover {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.16),
    rgba(255, 255, 255, 0.06)
  );
  color: var(--text);
}
.title {
  margin: 8px 0 6px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text);
  position: relative;
  padding-left: 10px;
}
.title::after {
  content: "";
  position: absolute;
  left: 10px;
  bottom: -6px;
  width: 0;
  height: 2px;
  background: var(--brand);
  transition: width 0.2s ease;
}
.post-item:hover .title::after {
  width: 56px;
}
.summary {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
  padding-left: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 20px 10px 0 10px;
}
.mins {
  font-size: 12px;
  color: var(--muted);
}
.cta {
  font-size: 12px;
  color: var(--brand);
}
@media (max-width: 700px) {
  .post-item {
    grid-template-columns: 1fr;
  }
}
</style>
