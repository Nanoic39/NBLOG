export function bindDetailsFoldAnimations(rootSelectorOrElement = ".post .content") {
  const root =
    typeof rootSelectorOrElement === "string"
      ? document.querySelector(rootSelectorOrElement)
      : rootSelectorOrElement;
  const panels = Array.from((root || document).querySelectorAll("details.fold"));
  panels.forEach((d) => {
    if (d.__foldBound) return;
    d.__foldBound = true;
    const body = d.querySelector(".fold-body");
    const sum = d.querySelector("summary");
    if (!body) return;
    let lastListener = null;
    let animState = null;
    const ro = new ResizeObserver(() => {});
    ro.observe(body);
    const animateOpen = () => {
      if (lastListener) {
        body.removeEventListener("transitionend", lastListener);
        lastListener = null;
      }
      animState = "opening";
      d.classList.remove("closing");
      const target = body.scrollHeight;
      body.style.height = "0px";
      body.style.paddingTop = "12px";
      body.style.paddingBottom = "12px";
      d.open = true;
      void body.offsetWidth;
      body.style.height = target + "px";
      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        if (animState !== "opening") return;
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.removeEventListener("transitionend", onEnd);
        lastListener = null;
        animState = null;
      };
      body.addEventListener("transitionend", onEnd);
      lastListener = onEnd;
    };
    const animateClose = () => {
      if (lastListener) {
        body.removeEventListener("transitionend", lastListener);
        lastListener = null;
      }
      animState = "closing";
      d.classList.add("closing");
      if (!d.open) d.open = true;
      const current = body.offsetHeight;
      body.style.height = current + "px";
      body.style.paddingTop = "0px";
      body.style.paddingBottom = "0px";
      void body.offsetWidth;
      body.style.height = "0px";
      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        if (animState !== "closing") return;
        d.open = false;
        d.classList.remove("closing");
        body.style.height = "";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
        body.removeEventListener("transitionend", onEnd);
        lastListener = null;
        animState = null;
      };
      body.addEventListener("transitionend", onEnd);
      lastListener = onEnd;
    };
    const onSumClick = (e) => {
      e.preventDefault();
      if (animState === "opening") {
        animateClose();
        return;
      }
      if (animState === "closing") {
        animateOpen();
        return;
      }
      if (d.open) animateClose();
      else animateOpen();
    };
    if (sum) {
      sum.addEventListener("click", onSumClick);
      sum.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSumClick(e);
        }
      });
    }
  });
}
