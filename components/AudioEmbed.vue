<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = withDefaults(
  defineProps<{
    src: string;
    title?: string;
    host?: string;
  }>(),
  {
    title: "音频",
    host: "",
  },
);

type CleanupFn = () => void;

const audioEl = ref<HTMLAudioElement | null>(null);
const cleanupFns = ref<CleanupFn[]>([]);

const isPlaying = ref(false);
const isLoading = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const volume = ref(0.9);
const errorText = ref<string | null>(null);

const displayTitle = computed(() => props.title?.trim() || "音频");
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

const setVolume = (v: number) => {
  const next = Math.min(1, Math.max(0, v));
  volume.value = next;
  if (audioEl.value) {
    audioEl.value.volume = next;
  }
};

const ensureAudio = () => {
  if (audioEl.value) return audioEl.value;

  const a = new Audio(props.src);
  a.preload = "metadata";
  a.volume = volume.value;

  const onLoadedMeta = () => {
    duration.value = Number.isFinite(a.duration) ? a.duration : 0;
    errorText.value = null;
  };
  const onTimeUpdate = () => {
    currentTime.value = a.currentTime || 0;
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
    errorText.value = "音频加载失败";
  };

  a.addEventListener("loadedmetadata", onLoadedMeta);
  a.addEventListener("timeupdate", onTimeUpdate);
  a.addEventListener("play", onPlay);
  a.addEventListener("pause", onPause);
  a.addEventListener("ended", onEnded);
  a.addEventListener("waiting", onWaiting);
  a.addEventListener("canplay", onCanPlay);
  a.addEventListener("error", onError);

  cleanupFns.value.push(() =>
    a.removeEventListener("loadedmetadata", onLoadedMeta),
  );
  cleanupFns.value.push(() =>
    a.removeEventListener("timeupdate", onTimeUpdate),
  );
  cleanupFns.value.push(() => a.removeEventListener("play", onPlay));
  cleanupFns.value.push(() => a.removeEventListener("pause", onPause));
  cleanupFns.value.push(() => a.removeEventListener("ended", onEnded));
  cleanupFns.value.push(() => a.removeEventListener("waiting", onWaiting));
  cleanupFns.value.push(() => a.removeEventListener("canplay", onCanPlay));
  cleanupFns.value.push(() => a.removeEventListener("error", onError));

  audioEl.value = a;
  return a;
};

const destroyAudio = () => {
  if (!audioEl.value) return;

  const a = audioEl.value;
  try {
    a.pause();
  } catch {}

  cleanupFns.value.forEach((fn) => fn());
  cleanupFns.value = [];

  try {
    a.src = "";
    a.load();
  } catch {}

  audioEl.value = null;
  isPlaying.value = false;
  isLoading.value = false;
  duration.value = 0;
  currentTime.value = 0;
};

let activeAudio: HTMLAudioElement | null = null;

const togglePlay = async () => {
  errorText.value = null;
  const a = ensureAudio();

  if (activeAudio && activeAudio !== a) {
    try {
      activeAudio.pause();
    } catch {}
  }
  activeAudio = a;

  if (a.paused) {
    isLoading.value = true;
    try {
      await a.play();
    } catch {
      isLoading.value = false;
      errorText.value = "无法播放（可能需要用户交互）";
    }
  } else {
    try {
      a.pause();
    } catch {}
  }
};

const seekByPercent = (percent: number) => {
  const a = audioEl.value;
  if (!a || !duration.value) return;
  const next = (Math.min(100, Math.max(0, percent)) / 100) * duration.value;
  a.currentTime = next;
};

const onSeekInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value || "0");
  seekByPercent(val);
};

const onVolumeInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value || "0");
  setVolume(val / 100);
};

onMounted(() => {
  ensureAudio();
});

watch(
  () => props.src,
  () => {
    destroyAudio();
    ensureAudio();
  },
);

onBeforeUnmount(() => {
  if (activeAudio === audioEl.value) {
    activeAudio = null;
  }
  destroyAudio();
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
              d="M9 19V6l12-2v13"
            />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
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

      <button
        type="button"
        class="shrink-0 w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1a1a1a]/70 hover:bg-white dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
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
          class="nb-audio-range flex-1"
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
          <svg
            class="w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5L6 9H2v6h4l5 4V5z"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            class="nb-audio-range w-24"
            :value="Math.round(volume * 100)"
            @input="onVolumeInput"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nb-audio-range {
  -webkit-appearance: none;
  appearance: none;
  height: 0.4rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.35);
  outline: none;
}

html.dark .nb-audio-range {
  background: rgba(100, 116, 139, 0.35);
}

.nb-audio-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: #0284c7;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
}

html.dark .nb-audio-range::-webkit-slider-thumb {
  background: #38bdf8;
  border-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.18);
}

.nb-audio-range::-moz-range-thumb {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: #0284c7;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
}

html.dark .nb-audio-range::-moz-range-thumb {
  background: #38bdf8;
  border-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.18);
}
</style>
