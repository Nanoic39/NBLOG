<template>
  <div class="post">
    <div class="hero" v-if="post?.cover">
      <img :src="post.cover" :alt="post.title" />
    </div>
    <div class="head">
      <h1 class="title">{{ post?.title }}</h1>
      <div class="meta">
        <span class="date">{{ formatDate(post?.publishedAt) }}</span>
        <div class="tags">
          <span v-for="t in post?.tags" :key="t" class="tag">{{ t }}</span>
        </div>
        <span class="mins">约 {{ post?.readMins }} 分钟阅读</span>
      </div>
    </div>
    <div class="content">
      <p>{{ post?.summary }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { usePostsStore } from "@/stores/posts";
import { computed } from "vue";
const route = useRoute();
const store = usePostsStore();
const post = computed(() => store.posts.find((p) => p.id === route.params.id));
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
</script>

<style>
.hero {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
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
  color: var(--muted);
}
.date {
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.04);
}
.tags {
  display: inline-flex;
  gap: 6px;
}
.tag {
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.04);
}
.mins {
  font-size: 12px;
}
.content {
  line-height: 1.8;
  color: var(--text);
}
</style>
