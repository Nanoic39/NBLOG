<template>
  <div class="contain">
    <!-- Hero Section -->
    <div
      class="hero-scene relative w-full h-screen min-h-[600px] flex flex-col md:flex-row items-center justify-center px-6 md:px-24 overflow-hidden"
    >
      <!-- Background Elements -->
      <div
        class="absolute inset-0 z-0 bg-gradient-to-b from-[#E9E0FF]/30 to-[#F9FAFB] dark:from-[#1a1a2e]/40 dark:to-[#1a1a1a] transition-colors duration-300"
      ></div>
      <div
        class="absolute top-1/4 left-1/4 w-64 h-64 bg-[#BFE9FF]/20 dark:bg-[#BFE9FF]/10 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFE9F3]/30 dark:bg-[#FFE9F3]/10 rounded-full blur-3xl animate-pulse delay-1000"
      ></div>

      <!-- Left Content: Image -->
      <div
        class="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end md:pr-12 mb-12 md:mb-0"
      >
        <div
          class="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-4 border-white/50 dark:border-white/10 overflow-hidden hover:scale-105 transition-transform duration-500 group cursor-grab"
        >
          <img
            :src="headImage"
            alt="NANOIC Profile"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Right Content: Intro -->
      <div
        class="relative z-10 w-full md:w-1/2 text-center md:text-left md:pl-12"
      >
        <div class="mb-4">
          <span
            class="inline-block px-3 py-1 text-xs font-medium tracking-wider text-[#BFE9FF] uppercase bg-[#2A2E33] dark:bg-[#374151] rounded-full"
          >
            A Java Developer
          </span>
        </div>
        <h1
          class="text-4xl md:text-6xl font-mono text-[#2A2E33] dark:text-[#e0e0e0] mb-6 tracking-wide drop-shadow-sm flex items-center justify-center md:justify-start flex-wrap gap-2"
        >
          <span class="text-[#0284C7] font-bold animate-pulse">Yuna@</span>
          <span class="font-bold">NANO1C</span>
        </h1>
        <div class="space-y-6 text-[#6B7280] dark:text-[#9ca3af]">
          <div class="h-8 flex items-center justify-center md:justify-start">
            <span
              class="text-xl md:text-2xl font-light font-mono typing-effect"
            ></span>
            <span
              class="w-0.5 h-6 bg-[#2A2E33] dark:bg-[#e0e0e0] animate-blink ml-1 transition-colors duration-300"
            ></span>
          </div>

          <p
            class="text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed text-center md:text-left"
          >
            <span
              class="text-[#2A2E33] dark:text-[#e0e0e0] font-bold transition-colors duration-300"
              >谦卑心态，务实前行。</span
            ><br />
            热衷于探索前沿技术，追求极致的美化。<br />
            本站用于 记录 / 创作 / 分享 <br />
          </p>

          <!-- 技术栈标签 -->
          <div class="flex flex-wrap justify-center md:justify-start gap-2">
            <span
              v-for="tech in techStack"
              :key="tech"
              class="px-3 py-1 text-sm bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/20 rounded-lg text-[#6B7280] dark:text-[#9ca3af] shadow-sm hover:text-[#BFE9FF] hover:border-[#BFE9FF] transition-colors cursor-default select-none"
            >
              #{{ tech }}
            </span>
          </div>
        </div>

        <!-- 社交链接 -->
        <div class="mt-8 flex justify-center md:justify-start gap-4">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            target="_blank"
            class="p-2.5 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#9CA3AF] hover:text-[#BFE9FF] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(191,233,255,0.4)] transition-all duration-300 hover:-translate-y-1"
            :title="social.name"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              :fill="social.stroke ? 'none' : 'currentColor'"
              :stroke="social.stroke ? 'currentColor' : 'none'"
              :stroke-width="social.stroke ? 2 : 0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                :d="social.icon"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- 引导指示器 -->
      <div
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-20 opacity-60 hover:opacity-100 transition-opacity"
        @click="scrollToContent"
      >
        <svg
          class="w-6 h-6 text-[#9CA3AF] dark:text-[#6b7280]"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 18L5 8H19L12 18Z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import headImage from "~/assets/image/HEADIMAGE.jpg";

// 社交链接
const socialLinks = [
  {
    name: "QQ",
    url: "#",
    icon: "M20.555 14.975c.183.678-.17 1.487-.757 1.765-.46.218-.938.165-1.373-.027-.853 2.502-3.177 4.28-5.91 4.28-2.735 0-5.06-1.78-5.912-4.282-.435.193-.913.246-1.372.028-.587-.278-.94-.887-.757-1.765.11-.53.465-.958.943-1.157a3.992 3.992 0 0 1-.295-1.51c0-2.42 1.737-4.43 4.02-4.886C9.648 4.67 10.74 2.56 12.003 2.56c1.262 0 2.353 2.11 2.857 4.863 2.283.456 4.02 2.466 4.02 4.886 0 .53-.105 1.036-.296 1.51.48.2.834.628.944 1.157h.027z",
    stroke: false,
  },
  {
    name: "X",
    url: "https://twitter.com",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    stroke: false,
  },
  {
    name: "Email",
    url: "mailto:contact@nanoic.me",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    stroke: true,
  },
  {
    name: "Telegram",
    url: "https://t.me",
    icon: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
    stroke: false,
  },
  {
    name: "BiliBili",
    url: "https://bilibili.com",
    icon: "M18.8 8.4h-1.6c.6.2 1.1.5 1.5.9.6.7 1 1.5 1.2 2.5.2 1 .3 2.1.3 3.4s-.1 2.4-.3 3.4c-.2.9-.6 1.8-1.2 2.5-.6.7-1.3 1.2-2.1 1.5-.9.4-1.9.6-3.2.6H8.7c-1.3-.1-2.3-.3-3.2-.6-.9-.4-1.6-.8-2.1-1.5-.6-.7-1-1.5-1.2-2.5-.2-1-.3-2.1-.3-3.4s.1-2.4.3-3.4c.2-.9.6-1.8 1.2-2.5.6-.7 1.3-1.2 2.1-1.5.9-.4 1.9-.6 3.2-.6h.7L7.1 5.3c.1-.2.4-.4.7-.4.3 0 .5.1.7.4l2.1 3.4h2.8l2.1-3.4c.1-.2.4-.4.7-.4.3 0 .5.1.7.4l-2.1 3.1zM17.1 19.3c.8 0 1.2-.5 1.2-1.5v-2.7c0-1-.4-1.5-1.2-1.5-.8 0-1.2.5-1.2 1.5v2.7c0 1.1.4 1.5 1.2 1.5zM10.6 19.3c.8 0 1.2-.5 1.2-1.5v-2.7c0-1-.4-1.5-1.2-1.5-.8 0-1.2.5-1.2 1.5v2.7c0 1.1.4 1.5 1.2 1.5z",
    stroke: false,
  },
  {
    name: "RSS",
    url: "/rss.xml",
    icon: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0",
    stroke: true,
  },
];

// 技术栈
const techStack = ["Java", "Vue 3", "Nuxt 3", "Tailwind CSS", "Node.js"];

const scrollToContent = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth",
  });
};

// 打字机动画
const typeText = async () => {
  const phrases = [
    [
      { text: "Java ", type: "en" },
      { text: "开", pinyin: "kai", type: "zh" },
      { text: "发", pinyin: "fa", type: "zh" },
      { text: "者", pinyin: "zhe", type: "zh" },
      { text: ".", type: "en" },
    ],
    [
      { text: "不", pinyin: "bu", type: "zh" },
      { text: "专", pinyin: "zhuan", type: "zh" },
      { text: "业", pinyin: "ye", type: "zh" },
      { text: "的", pinyin: "de", type: "zh" },
      { text: " UI/UX ", type: "en" },
      { text: "设", pinyin: "she", type: "zh" },
      { text: "计", pinyin: "ji", type: "zh" },
      { text: "师", pinyin: "shi", type: "zh" },
      { text: ".", type: "en" },
    ],
    [
      { text: "独", pinyin: "du", type: "zh" },
      { text: "立", pinyin: "li", type: "zh" },
      { text: " Dreamer", type: "en" },
      { text: ".", type: "en" },
    ],
    [
      { text: "Y", type: "en" },
      { text: "u", type: "en" },
      { text: "n", type: "en" },
      { text: "a ", type: "en" },
      { text: "很", pinyin: "hen", type: "zh" },
      { text: "可", pinyin: "ke", type: "zh" },
      { text: "爱", pinyin: "ai", type: "zh" },
      { text: ".", type: "en" },
    ],
  ];

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;
  const convertDelay = 300;

  const element = document.querySelector(".typing-effect");
  if (!element) return;

  let phraseIndex = 0;
  let segmentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let displayedText = "";

  const type = () => {
    const currentPhrase = phrases[phraseIndex];
    if (!currentPhrase) return;

    if (isDeleting) {
      const currentContent = element.textContent || "";
      if (currentContent.length > 0) {
        element.textContent = currentContent.slice(0, -1);
        setTimeout(type, deletingSpeed);
      } else {
        isDeleting = false;
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * phrases.length);
        } while (nextIndex === phraseIndex && phrases.length > 1);
        phraseIndex = nextIndex;
        segmentIndex = 0;
        charIndex = 0;
        displayedText = "";
        setTimeout(type, 500);
      }
      return;
    }

    if (segmentIndex >= currentPhrase.length) {
      isDeleting = true;
      setTimeout(type, pauseTime);
      return;
    }

    const segment = currentPhrase[segmentIndex];
    if (!segment) return;

    if (segment.type === "en") {
      if (charIndex < segment.text.length) {
        displayedText += segment.text[charIndex];
        element.textContent = displayedText;
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        segmentIndex++;
        charIndex = 0;
        type();
      }
    } else if (segment.type === "zh") {
      const pinyin = segment.pinyin || "";
      if (charIndex < pinyin.length) {
        // 显示：已确认文本 + 当前拼音部分
        element.textContent = displayedText + pinyin.slice(0, charIndex + 1);
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => {
          displayedText += segment.text;
          element.textContent = displayedText;
          segmentIndex++;
          charIndex = 0;
          setTimeout(type, typingSpeed);
        }, convertDelay);
      }
    }
  };

  type();
};

onMounted(() => {
  typeText();
});
</script>

<style scoped>
.font-ink {
  font-family: "汉仪墨韵行书", cursive, serif;
}
</style>
