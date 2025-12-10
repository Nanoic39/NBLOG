<script setup>
import axios from "axios";
import PostsList from "@/components/PostsList.vue";
import { usePostsStore } from "@/stores/posts";
import { storeToRefs } from "pinia";

axios
  .get("https://v1.hitokoto.cn")
  .then(({ data }) => {
    const hitokoto = document.querySelector("#hitokoto_text");
    hitokoto.href = `https://hitokoto.cn/?c=d&c=h&c=i&c=k`;
    hitokoto.innerText = data.hitokoto;
  })
  .catch(console.error);

const postsStore = usePostsStore();
const { sorted } = storeToRefs(postsStore);
</script>

<template>
  <div>
    <div class="cover">
      <!-- 一言 -->
      <div id="hitokoto">
        <a
          id="hitokoto_text"
          href="https://hitokoto.cn"
          target="_blank"
          title="hitokoto · 一言"
        >
          :D 获取中...
      </a>
      </div>
    </div>
    <!-- 文章列表(发布顺序新到旧) -->
    <PostsList :posts="sorted" />
  </div>
</template>

<style scoped>
.cover {
  --cover-height: 480px;
  position: relative;
  height: var(--cover-height);
  background: var(--theme-color-beige);
  background-image: url("https://www.dmoe.cc/random.php");
  background-position: center top;
  background-size: cover;
  border-radius: 12px;
  margin-bottom: 16px;
  display: block;

  #hitokoto {
    position: absolute;
    left: 24px;
    bottom: 24px;
    max-width: 72%;
    text-align: left;
    font-weight: 800;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(3px);
    padding: 12px 16px;
    border: 1px solid var(--theme-color-border);
    border-radius: 12px;
  
    transition: all 0.2s ease-in-out;

    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }

    a, a:hover, a:visited, a:active {
      color: #fff;
      text-decoration: none;
    }
  }
}

.banner {
  position: relative;
  height: 240px;
  border-radius: 12px;
  border: 1px solid var(--theme-color-border);
  background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4),
      rgba(59, 130, 246, 0) 60%
    ),
    var(--panel);
  overflow: hidden;
  margin-bottom: 16px;
}
.banner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px
  );
  background-size: 12px 12px;
}
.banner-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}
.title {
  font-size: 24px;
  margin: 0 0 8px;
}
.sub {
  margin: 0;
  color: var(--muted);
}
</style>
