<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";

const props = withDefaults(
  defineProps<{
    src: string;
    title?: string;
    host?: string;
  }>(),
  {
    title: "视频",
    host: "",
  },
);

const videoEl = ref<HTMLVideoElement | null>(null);

const isPlaying = ref(false);
const isLoading = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const volume = ref(0.9);
const isMuted = ref(false);
const errorText = ref<string | null>(null);

const displayTitle = computed(() => props.title?.trim() || "视频");
const displayHost = computed(() => props.host?.trim() || "");

const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

let activeVideo: HTMLVideoElement | null = null;

const syncVolume = () => {
  if (!videoEl.value) return;
  videoEl.value.volume = Math.min(1, Math.max(0, volume.value));
  videoEl.value.muted = isMuted.value;
};

const togglePlay = async () => {
  errorText.value = null;
  const v = videoEl.value;
  if (!v) return;

  if (activeVideo && activeVideo !== v) {
    try {
      activeVideo.pause();
    } catch {}
  }
  activeVideo = v;

  if (v.paused) {
    isLoading.value = true;
    try {
      await v.play();
    } catch {
      isLoading.value = false;
      errorText.value = "无法播放（可能需要用户交互）";
    }
  } else {
    try {
      v.pause();
    } catch {}
  }
};

const seekByPercent = (percent: number) => {
  const v = videoEl.value;
  if (!v || !duration.value) return;
  const next = (Math.min(100, Math.max(0, percent)) / 100) * duration.value;
  v.currentTime = next;
};

const onSeekInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value || "0");
  seekByPercent(val);
};

const onVolumeInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value || "0");
  volume.value = Math.min(1, Math.max(0, val / 100));
  syncVolume();
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  syncVolume();
};

const toggleFullscreen = async () => {
  const v = videoEl.value;
  if (!v) return;

  const container = v.closest(".nb-video-shell") as HTMLElement | null;
  const root = container || v;

  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {}
    return;
  }

  try {
    await (root as any).requestFullscreen?.();
  } catch {}
};

const onTogglePip = async () => {
  const v = videoEl.value as any;
  if (!v) return;
  if (!("pictureInPictureEnabled" in document)) return;

  try {
    if ((document as any).pictureInPictureElement) {
      await (document as any).exitPictureInPicture();
    } else {
      await v.requestPictureInPicture();
    }
  } catch {}
};

const bindVideo = () => {
  const v = videoEl.value;
  if (!v) return () => {};

  const onLoadedMeta = () => {
    duration.value = Number.isFinite(v.duration) ? v.duration : 0;
    errorText.value = null;
  };
  const onTimeUpdate = () => {
    currentTime.value = v.currentTime || 0;
  };
  const onPlay = () => {
    isPlaying.value = true;
    isLoading.value = false;
  };
  const onPause = () => {
    isPlaying.value = false;
    isLoading.value = false;
  };
  const onEnded = () => {
    isPlaying.value = false;
    isLoading.value = false;
  };
  const onWaiting = () => {
    if (isPlaying.value) isLoading.value = true;
  };
  const onCanPlay = () => {
    isLoading.value = false;
  };
  const onError = () => {
    isPlaying.value = false;
    isLoading.value = false;
    errorText.value = "视频加载失败";
  };

  v.addEventListener("loadedmetadata", onLoadedMeta);
  v.addEventListener("timeupdate", onTimeUpdate);
  v.addEventListener("play", onPlay);
  v.addEventListener("pause", onPause);
  v.addEventListener("ended", onEnded);
  v.addEventListener("waiting", onWaiting);
  v.addEventListener("canplay", onCanPlay);
  v.addEventListener("error", onError);

  return () => {
    v.removeEventListener("loadedmetadata", onLoadedMeta);
    v.removeEventListener("timeupdate", onTimeUpdate);
    v.removeEventListener("play", onPlay);
    v.removeEventListener("pause", onPause);
    v.removeEventListener("ended", onEnded);
    v.removeEventListener("waiting", onWaiting);
    v.removeEventListener("canplay", onCanPlay);
    v.removeEventListener("error", onError);
  };
};

let cleanup: (() => void) | null = null;

onMounted(() => {
  nextTick(() => {
    syncVolume();
    cleanup = bindVideo();
  });
});

watch(
  () => props.src,
  () => {
    const v = videoEl.value;
    if (!v) return;
    isPlaying.value = false;
    isLoading.value = false;
    duration.value = 0;
    currentTime.value = 0;
    errorText.value = null;
    try {
      v.load();
    } catch {}
  },
);

onBeforeUnmount(() => {
  if (cleanup) cleanup();
  if (activeVideo === videoEl.value) activeVideo = null;
});
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-[#242424]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex items-center gap-2">
        <div
          class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/25 text-[#0284C7] dark:text-[#38bdf8] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4v4M4 6h11a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
            />
          </svg>
        </div>

        <div class="min-w-0">
          <div
            class="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 truncate"
            :title="displayTitle"
          >
            {{ displayTitle }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
            <span v-if="displayHost" class="mr-2">来源：{{ displayHost }}</span>
            <a
              :href="src"
              target="_blank"
              rel="noopener"
              class="text-[#0284C7] hover:text-[#0369a1] dark:text-[#38bdf8] dark:hover:text-[#7dd3fc]"
              >打开链接
            </a>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a1a1a]/70 hover:bg-white dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
          :aria-label="isPlaying ? '暂停' : '播放'"
          @click="togglePlay"
        >
          <svg
            v-if="!isPlaying"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6 4l11 6-11 6V4z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4h3v12H6V4zm5 0h3v12h-3V4z" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="mt-4 nb-video-shell rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black"
    >
      <video
        ref="videoEl"
        class="w-full aspect-video object-contain"
        :src="src"
        preload="metadata"
        playsinline
        @dblclick="toggleFullscreen"
        @click="togglePlay"
      />
    </div>

    <div class="mt-4">
      <div class="flex items-center gap-3">
        <div class="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
          {{ formatTime(currentTime) }}
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          class="nb-video-range flex-1"
          :value="progressPercent"
          @input="onSeekInput"
        />

        <div class="text-xs text-gray-500 dark:text-gray-400 w-10">
          {{ formatTime(duration) }}
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between gap-3">
        <div v-if="errorText" class="text-xs text-red-500 dark:text-red-400">
          {{ errorText }}
        </div>
        <div v-else class="text-xs text-gray-500 dark:text-gray-400">
          <span v-if="isLoading">缓冲中…</span>
          <span v-else>{{ isPlaying ? "播放中" : "已暂停" }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a1a1a]/70 hover:bg-white dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
            :aria-label="isMuted ? '取消静音' : '静音'"
            @click="toggleMute"
          >
            <svg
              v-if="!isMuted"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5L6 9H2v6h4l5 4V5z"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5L6 9H2v6h4l5 4V5z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M23 9l-6 6"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9l6 6"
              />
            </svg>
          </button>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            class="nb-video-range w-24"
            :value="Math.round(volume * 100)"
            @input="onVolumeInput"
          />

          <button
            type="button"
            class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a1a1a]/70 hover:bg-white dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
            aria-label="画中画"
            @click="onTogglePip"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 11h7v6h-7z"
              />
            </svg>
          </button>

          <button
            type="button"
            class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a1a1a]/70 hover:bg-white dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
            aria-label="全屏"
            @click="toggleFullscreen"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nb-video-range {
  -webkit-appearance: none;
  appearance: none;
  height: 0.4rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.35);
  outline: none;
}

html.dark .nb-video-range {
  background: rgba(100, 116, 139, 0.35);
}

.nb-video-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: #0284c7;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
}

html.dark .nb-video-range::-webkit-slider-thumb {
  background: #38bdf8;
  border-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.18);
}

.nb-video-range::-moz-range-thumb {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: #0284c7;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
}

html.dark .nb-video-range::-moz-range-thumb {
  background: #38bdf8;
  border-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.18);
}
</style>
