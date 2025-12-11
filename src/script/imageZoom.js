// Image Zoom Module - Vanilla JS
// Provides click-to-zoom with overlay, double-click zoom-in (x2), single-click zoom-out (x0.5),
// drag-to-pan with bounds, toolbar with percent/slider/controls, copy/download, ESC/right-click exit.

export function attachImageZoom(rootSelectorOrElement = ".post .content") {
  const root =
    typeof rootSelectorOrElement === "string"
      ? document.querySelector(rootSelectorOrElement)
      : rootSelectorOrElement;
  if (!root) return;

  const imgs = Array.from(root.querySelectorAll("img"));
  imgs.forEach((img) => {
    if (img.__zoomBound) return;
    img.__zoomBound = true;
    let clickTimer = null;
    img.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        startZoomSession(img, ev, { dbl: true });
      } else {
        clickTimer = setTimeout(() => {
          startZoomSession(img, ev);
          clickTimer = null;
        }, 300);
      }
    });
  });
}

let active = null;

function startZoomSession(img, ev, opts = {}) {
  if (active && active.img === img) {
    if (opts.dbl) {
      active.zoom(-0.5, { center: { x: ev.clientX, y: ev.clientY } });
    } else {
      active.zoom(0.5, {
        center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      });
    }
    return;
  }
  if (active) active.destroy();

  const overlay = document.createElement("div");
  overlay.className = "zoom-overlay entering";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.tabIndex = -1;

  const wrap = document.createElement("div");
  wrap.className = "zoom-img-wrap";
  const clone = img.cloneNode(true);
  clone.removeAttribute("loading");
  clone.style.willChange = "transform";
  clone.style.transform = "translate(0px, 0px) scale(1)";
  // 初始尺寸与原图一致
  const originRect = img.getBoundingClientRect();
  clone.style.width = originRect.width + "px";
  clone.style.height = originRect.height + "px";
  // 原图位置遮罩，使用主题米色覆盖原位
  const originMask = document.createElement("div");
  originMask.className = "zoom-origin-mask";
  originMask.style.position = "fixed";
  originMask.style.pointerEvents = "none";
  originMask.style.left = originRect.left + "px";
  originMask.style.top = originRect.top + "px";
  originMask.style.width = originRect.width + "px";
  originMask.style.height = originRect.height + "px";
  const cs = getComputedStyle(img);
  originMask.style.borderRadius = cs.borderRadius || "12px";
  wrap.appendChild(clone);

  const toolbar = buildToolbar();
  document.body.appendChild(originMask);
  overlay.appendChild(wrap);
  overlay.appendChild(toolbar.root);
  document.body.appendChild(overlay);

  const session = createSession({
    overlay,
    wrap,
    img: clone,
    srcEl: img,
    toolbar,
    originRect,
    originMask,
  });
  active = session;
  overlay.focus();

  // 进场：从原图位置到视窗中心，默认倍率 1.25x
  const rect = originRect;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (rect.left + rect.width / 2) - cx;
  const dy = (rect.top + rect.height / 2) - cy;
  session.setInitialTransform({ tx: dx, ty: dy, scale: 1 });
  requestAnimationFrame(() => {
    overlay.classList.remove('entering');
    // 强制重排确保过渡生效
    overlay.offsetWidth;
    clone.offsetWidth;
    overlay.classList.add('ready');
    // 平滑移动到中心并放大到默认倍率
    session.setCenterAndScale(0, 0, 1.25);
  });
  if (opts.dbl)
    session.zoom(-0.5, { center: { x: ev.clientX, y: ev.clientY } });
}

function createSession({ overlay, wrap, img, srcEl, toolbar, originRect, originMask }) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let rafId = null;
  let clickTimer = null;
  let dragged = false;
  let suppressClick = false;
  let exiting = false;

  let onceTransition = null;
  const defaultTransition = {
    duration: 400,
    easing: "cubic-bezier(0.2, 0, 0.1, 1)",
  };
  function applyTransform(immediate = false) {
    const t = `translate(${tx}px, ${ty}px) scale(${scale})`;
    if (immediate) {
      img.style.transition = "none";
    } else {
      const tr = onceTransition || defaultTransition;
      img.style.transition = `transform ${tr.duration}ms ${tr.easing}`;
    }
    img.style.transform = t;
    toolbar.setPercent(Math.round(scale * 100));
    toolbar.setSlider(scale);
    // 使用一次性过渡配置后，立即清空，避免影响其他交互
    if (onceTransition) onceTransition = null;
  }

  function setCenterAndScale(nx, ny, ns) {
    tx = nx;
    ty = ny;
    setScale(ns, { animate: true });
  }

  function setScale(next, opts = {}) {
    const s = Math.max(1, Math.min(10, next));
    scale = s;
    if (opts && (opts.duration || opts.easing)) {
      const d =
        typeof opts.duration === "number"
          ? opts.duration
          : defaultTransition.duration;
      const e =
        typeof opts.easing === "string"
          ? opts.easing
          : defaultTransition.easing;
      onceTransition = { duration: d, easing: e };
    }
    applyTransform(!opts.animate);
  }

  function zoom(step, opts = {}) {
    const center = opts.center || {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const target = Math.max(1, Math.min(10, scale + step));
    const rect = img.getBoundingClientRect();
    const xRel = center.x - (rect.left + rect.width / 2);
    const yRel = center.y - (rect.top + rect.height / 2);
    const factor = target / scale;
    tx -= xRel * (factor - 1);
    ty -= yRel * (factor - 1);
    setScale(target, { animate: true });
  }

  function zoomAt(cx, cy, factor) {
    const rect = img.getBoundingClientRect();
    const xRel = cx - (rect.left + rect.width / 2);
    const yRel = cy - (rect.top + rect.height / 2);
    tx -= xRel * (factor - 1);
    ty -= yRel * (factor - 1);
    setScale(scale * factor, { animate: true });
  }

  function center(opts = {}) {
    tx = 0;
    ty = 0;
    applyTransform(!opts.animate);
  }

  function onClick(ev) {
    ev.preventDefault();
    if (dragging || dragged || suppressClick) return;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      onDouble(ev);
      return;
    }
    clickTimer = setTimeout(() => {
      clickTimer = null;
      onSingle(ev);
    }, 300);
  }
  function onSingle(ev) {
    if (scale <= 1.01) {
      leave();
      return;
    }
    zoom(-1, {
      center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }
  function onDouble(ev) {
    zoom(1, { center: { x: ev.clientX, y: ev.clientY } });
  }
  function exitOnce() {
    destroy();
  }

  function onContext(ev) {
    ev.preventDefault();
    leave();
  }

  function onKey(ev) {
    if (ev.key === "Escape") leave();
  }

  function onDown(ev) {
    ev.preventDefault();
    dragging = true;
    dragged = false;
    lastX = ev.clientX;
    lastY = ev.clientY;
    document.addEventListener("mousemove", onMove, { passive: false });
    document.addEventListener("mouseup", onUp, { passive: true, once: true });
  }

  function onMove(ev) {
    if (!dragging) return;
    ev.preventDefault();
    const dx = ev.clientX - lastX;
    const dy = ev.clientY - lastY;
    lastX = ev.clientX;
    lastY = ev.clientY;
    tx += dx;
    ty += dy;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => applyTransform(true));
  }

  function onUp() {
    dragging = false;
    applyTransform();
    softClamp(true);
    if (dragged) {
      suppressClick = true;
      setTimeout(() => {
        suppressClick = false;
      }, 250);
    }
  }

  function onWheel(ev) {
    ev.preventDefault();
    const delta = Math.sign(ev.deltaY);
    const factor = delta > 0 ? 0.95 : 1.05;
    setScale(scale * factor, { animate: true });
  }

  // 软性边界：可视部分小于 200px 时产生轻微回弹；小图（任一维度 <200px）需完整可见
  function softClamp(immediate) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = img.getBoundingClientRect();
    const minVis = 200;
    let adjX = 0,
      adjY = 0;

    const isSmall = r.width < minVis || r.height < minVis;
    if (isSmall) {
      if (r.left < 0) adjX += -r.left;
      if (r.right > vw) adjX -= r.right - vw;
      if (r.top < 0) adjY += -r.top;
      if (r.bottom > vh) adjY -= r.bottom - vh;
    } else {
      if (r.right < minVis) adjX += (minVis - r.right) * 0.5;
      if (r.left > vw - minVis) adjX -= (r.left - (vw - minVis)) * 0.5;
      if (r.bottom < minVis) adjY += (minVis - r.bottom) * 0.5;
      if (r.top > vh - minVis) adjY -= (r.top - (vh - minVis)) * 0.5;
    }

    if (adjX || adjY) {
      tx += adjX;
      ty += adjY;
      applyTransform(!immediate ? false : true);
    }
  }

  function leave() {
    if (exiting) return;
    exiting = true;
    overlay.classList.remove("ready");
    overlay.classList.add("leaving");
    // 退场到原图位置
    const rect = srcEl.getBoundingClientRect();
    img.style.width = rect.width + "px";
    img.style.height = rect.height + "px";
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = rect.left + rect.width / 2 - cx;
    const dy = rect.top + rect.height / 2 - cy;
    tx = dx;
    ty = dy;
    scale = 1;
    applyTransform();
    setTimeout(destroy, 400);
  }

  function destroy() {
    overlay.removeEventListener("click", onClick);
    overlay.removeEventListener("contextmenu", onContext);
    document.removeEventListener("keydown", onKey);
    img.removeEventListener("mousedown", onDown);
    overlay.removeEventListener("wheel", onWheel);
    if (originMask && originMask.parentNode) originMask.parentNode.removeChild(originMask);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    active = null;
  }

  // 工具栏绑定与事件隔离
  toolbar.root.addEventListener("click", (e) => e.stopPropagation());
  toolbar.root.addEventListener("dblclick", (e) => e.stopPropagation());
  toolbar.root.addEventListener("mousedown", (e) => e.stopPropagation());
  toolbar.root.addEventListener("pointerdown", (e) => e.stopPropagation());
  toolbar.root.addEventListener(
    "wheel",
    (e) => {
      e.stopPropagation();
    },
    { passive: true }
  );
  toolbar.onPlus(() => zoom(1));
  toolbar.onMinus(() => zoom(-1));
  toolbar.onSlider((v) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const target = Math.max(1, Math.min(10, v));
    const rect = img.getBoundingClientRect();
    const xRel = cx - (rect.left + rect.width / 2);
    const yRel = cy - (rect.top + rect.height / 2);
    const factor = target / scale;
    tx -= xRel * (factor - 1);
    ty -= yRel * (factor - 1);
    setScale(target, { animate: true, duration: 300, easing: "ease-out" });
  });
  // 进度条点击直接跳转
  toolbar.onSliderClick((pxRatio) => {
    const min = 1,
      max = 10;
    const target = min + (max - min) * pxRatio;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const rect = img.getBoundingClientRect();
    const xRel = cx - (rect.left + rect.width / 2);
    const yRel = cy - (rect.top + rect.height / 2);
    const factor = target / scale;
    tx -= xRel * (factor - 1);
    ty -= yRel * (factor - 1);
    setScale(target, { animate: true, duration: 300, easing: "ease-out" });
  });
  toolbar.onCopy(async () => {
    try {
      const url = srcEl.currentSrc || srcEl.src;
      const r = await fetch(url);
      const b = await r.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ [b.type]: b })]);
      }
    } catch {}
  });
  toolbar.onDownload(async () => {
    try {
      const url = srcEl.currentSrc || srcEl.src;
      const a = document.createElement("a");
      a.href = url;
      a.download = (srcEl.alt || "image") + ".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  });
  toolbar.onExit(() => leave());

  overlay.addEventListener("click", onClick);
  overlay.addEventListener("contextmenu", onContext);
  document.addEventListener("keydown", onKey);
  img.addEventListener("mousedown", onDown);
  overlay.addEventListener("wheel", onWheel, { passive: false });

  return {
    overlay,
    wrap,
    img,
    srcEl,
    setScale,
    center,
    zoom,
    zoomAt,
    destroy,
    setCenterAndScale,
    setInitialTransform({ tx: x, ty: y, scale: s }) {
      tx = x;
      ty = y;
      scale = s;
      applyTransform(true);
    },
  };
}

function buildToolbar() {
  const root = document.createElement("div");
  root.className = "zoom-toolbar";
  const left = document.createElement("div");
  left.className = "zt-left";
  const mid = document.createElement("div");
  mid.className = "zt-mid";
  const right = document.createElement("div");
  right.className = "zt-right";
  const percent = document.createElement("span");
  percent.className = "zt-percent";
  percent.textContent = "100%";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "1";
  slider.max = "10";
  slider.step = "0.1";
  slider.value = "1.25";
  slider.className = "zt-range";
  const btnPlus = document.createElement("button");
  btnPlus.className = "zt-btn";
  btnPlus.textContent = "+";
  const btnMinus = document.createElement("button");
  btnMinus.className = "zt-btn";
  btnMinus.textContent = "-";
  const btnCopy = document.createElement("button");
  btnCopy.className = "zt-btn";
  btnCopy.textContent = "复制";
  const btnDown = document.createElement("button");
  btnDown.className = "zt-btn";
  btnDown.textContent = "下载";
  const btnExit = document.createElement("button");
  btnExit.className = "zt-btn";
  btnExit.textContent = "退出";
  left.appendChild(percent);
  mid.appendChild(slider);
  right.appendChild(btnMinus);
  right.appendChild(btnPlus);
  right.appendChild(btnCopy);
  right.appendChild(btnDown);
  right.appendChild(btnExit);
  root.appendChild(left);
  root.appendChild(mid);
  root.appendChild(right);

  let plusCb = () => {};
  let minusCb = () => {};
  let slideCb = () => {};
  let copyCb = () => {};
  let downCb = () => {};
  let exitCb = () => {};
  let clickTrackCb = () => {};
  btnPlus.addEventListener("click", () => plusCb());
  btnMinus.addEventListener("click", () => minusCb());
  slider.addEventListener("input", () =>
    slideCb(parseFloat(slider.value || "1"))
  );
  slider.addEventListener("mousedown", (e) => {
    const rect = slider.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width)
    );
    clickTrackCb(ratio);
  });
  slider.addEventListener("click", (e) => {
    const rect = slider.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width)
    );
    clickTrackCb(ratio);
  });
  btnCopy.addEventListener("click", () => copyCb());
  btnDown.addEventListener("click", () => downCb());
  btnExit.addEventListener("click", () => exitCb());
  btnExit.addEventListener("pointerdown", (e) => { e.stopPropagation(); exitCb(); });

  function setPercent(p) {
    percent.textContent = (p || 100) + "%";
  }
  function setSlider(v) {
    slider.value = String(Math.max(1, Math.min(10, v || 1)));
  }

  return {
    root,
    setPercent,
    setSlider,
    onPlus(cb) {
      plusCb = cb;
    },
    onMinus(cb) {
      minusCb = cb;
    },
    onSlider(cb) {
      slideCb = cb;
    },
    onSliderClick(cb) {
      clickTrackCb = cb;
    },
    onCopy(cb) {
      copyCb = cb;
    },
    onDownload(cb) {
      downCb = cb;
    },
    onExit(cb) {
      exitCb = cb;
    },
  };
}
