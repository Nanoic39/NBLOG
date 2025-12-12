export function debounceRequest(fn, wait = 300) {
  let timer = null;
  let pending = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    if (pending && typeof pending.reject === "function") {
      pending.reject(new Error("debounced"));
    }
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      timer = setTimeout(async () => {
        timer = null;
        try {
          const res = await fn(...args);
          pending && pending.resolve(res);
        } catch (e) {
          pending && pending.reject(e);
        } finally {
          pending = null;
        }
      }, wait);
    });
  };
}

export function throttleRequest(fn, wait = 300) {
  let lastTs = 0;
  let lastPromise = null;
  let lastResult = undefined;
  return (...args) => {
    const now = Date.now();
    if (!lastPromise || now - lastTs >= wait) {
      lastTs = now;
      lastPromise = Promise.resolve().then(() => fn(...args)).then((res) => {
        lastResult = res;
        return res;
      });
      return lastPromise;
    }
    return lastPromise.then(() => lastResult);
  };
}
