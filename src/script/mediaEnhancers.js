export function enhanceMediaPlayers(rootSelectorOrElement = ".post .content") {
  const root =
    typeof rootSelectorOrElement === "string"
      ? document.querySelector(rootSelectorOrElement)
      : rootSelectorOrElement;
  if (!root) return;
  const containers = Array.from(root.querySelectorAll(".audio-player"));
  containers.forEach((card) => {
    if (card.__apEnhanced) return;
    const audio = card.querySelector("audio");
    if (!audio) return;
    const hasCover = !!card.querySelector(".ap-cover");
    const hasInfo = !!card.querySelector(".ap-info");
    if (hasCover && hasInfo) {
      card.__apEnhanced = true;
      return;
    }
    const coverBox = document.createElement("div");
    coverBox.className = "ap-cover";
    const infoBox = document.createElement("div");
    infoBox.className = "ap-info";
    const titleEl = document.createElement("div");
    titleEl.className = "ap-title";
    const subEl = document.createElement("div");
    subEl.className = "ap-sub";
    const pick = (el, names) => {
      for (const n of names) {
        const v = el.getAttribute(n);
        if (v && v.trim()) return v.trim();
      }
      return "";
    };
    const title = pick(audio, ["data-title", "title"]) || pick(card, ["data-title"]) || "音频";
    const desc = pick(audio, ["data-desc", "aria-label"]) || pick(card, ["data-desc"]) || "";
    const cover = pick(audio, ["data-cover", "cover"]) || pick(card, ["data-cover"]) || "";
    titleEl.textContent = title;
    if (desc) subEl.textContent = desc;
    if (cover) {
      const img = document.createElement("img");
      img.src = cover;
      img.alt = title || "audio";
      coverBox.appendChild(img);
    } else {
      const iconWrap = document.createElement("div");
      iconWrap.className = "ap-icon";
      iconWrap.innerHTML = '<svg class="ap-icon-svg" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M10 4v9.8a3.2 3.2 0 1 1-2-2.98V7h8v6.8a3.2 3.2 0 1 1-2-2.98V4h-4z"/></svg>';
      coverBox.appendChild(iconWrap);
    }
    infoBox.appendChild(titleEl);
    if (subEl.textContent) infoBox.appendChild(subEl);
    card.insertBefore(coverBox, audio);
    card.insertBefore(infoBox, audio);
    card.__apEnhanced = true;
  });

  const audios = Array.from(root.querySelectorAll("audio"));
  audios.forEach((a) => {
    const p = a.parentElement;
    if (p && p.classList && p.classList.contains("audio-player")) return;
    const card = document.createElement("div");
    card.className = "audio-player";
    const coverBox = document.createElement("div");
    coverBox.className = "ap-cover";
    const infoBox = document.createElement("div");
    infoBox.className = "ap-info";
    const titleEl = document.createElement("div");
    titleEl.className = "ap-title";
    const subEl = document.createElement("div");
    subEl.className = "ap-sub";
    const title = a.getAttribute("data-title") || a.getAttribute("title") || "音频";
    const desc = a.getAttribute("data-desc") || a.getAttribute("aria-label") || "";
    const cover = a.getAttribute("data-cover") || a.getAttribute("cover") || "";
    titleEl.textContent = title;
    if (desc && desc.trim()) subEl.textContent = desc.trim();
    if (cover && cover.trim()) {
      const img = document.createElement("img");
      img.src = cover.trim();
      img.alt = title || "audio";
      coverBox.appendChild(img);
    } else {
      const iconWrap = document.createElement("div");
      iconWrap.className = "ap-icon";
      iconWrap.innerHTML = '<svg class="ap-icon-svg" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M10 4v9.8a3.2 3.2 0 1 1-2-2.98V7h8v6.8a3.2 3.2 0 1 1-2-2.98V4h-4z"/></svg>';
      coverBox.appendChild(iconWrap);
    }
    infoBox.appendChild(titleEl);
    if (subEl.textContent) infoBox.appendChild(subEl);
    card.appendChild(coverBox);
    card.appendChild(infoBox);
    const next = a.cloneNode(true);
    card.appendChild(next);
    a.replaceWith(card);
  });
}
