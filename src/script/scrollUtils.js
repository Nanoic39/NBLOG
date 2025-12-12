export function getSavedPos(id) {
  const hs = history.state && typeof history.state.scroll === "number" ? history.state.scroll : null;
  if (typeof hs === "number") return hs;
  try {
    const raw = sessionStorage.getItem("read_positions") || "{}";
    const data = JSON.parse(raw);
    const pos = data[id] && typeof data[id].scrollY === "number" ? data[id].scrollY : null;
    return typeof pos === "number" ? pos : null;
  } catch {
    return null;
  }
}

export function restoreScroll(id) {
  const pos = getSavedPos(id);
  if (typeof pos !== "number") return;
  let tries = 0;
  const max = 120;
  const tick = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h >= pos || tries >= max) {
      if (Math.abs(window.scrollY - pos) > 2) window.scrollTo({ top: pos });
    } else {
      tries++;
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

export function bindImageLoadRestore(rootSelectorOrElement = ".post .content", id) {
  const root =
    typeof rootSelectorOrElement === "string"
      ? document.querySelector(rootSelectorOrElement)
      : rootSelectorOrElement;
  const imgs = Array.from((root || document).querySelectorAll("img"));
  imgs.forEach((img) => {
    img.addEventListener("load", () => restoreScroll(id), { once: true });
  });
}
