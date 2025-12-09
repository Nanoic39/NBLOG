<template>
  <div class="posts-list">
    <RouterLink
      v-for="p in posts"
      :key="p.id"
      class="post-item"
      :to="`/post/${p.id}`"
    >
      <div class="thumb"><img :src="p.cover" :alt="p.title" /></div>
      <div class="content">
        <div class="meta">
          <span class="date">{{ formatDate(p.publishedAt) }}</span>
          <div class="tags">
            <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
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
import { defineProps } from "vue";
const props = defineProps({ posts: { type: Array, default: () => [] } });
function formatDate(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
</script>

<style>
.posts-list {
  display: grid;
  gap: 18px;
}
.post-item {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 16px;
  position: relative;
  text-decoration: none;
  color: inherit;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 12px 12px;
  opacity: 0.3;
}
.post-item:hover {
  border-color: var(--brand);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
  transform: translateY(-3px);
}
.thumb {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #1b1b21;
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.content {
  display: flex;
  flex-direction: column;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border);
}
.date {
  font-size: 12px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 10px;
}
.tags {
  display: flex;
  gap: 6px;
}
.tag {
  font-size: 12px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
}
.title {
  margin: 8px 0 6px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text);
  position: relative;
}
.title::after {
  content: "";
  position: absolute;
  left: 0;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
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
