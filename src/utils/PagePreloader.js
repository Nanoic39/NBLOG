function idle(fn) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn());
  } else {
    setTimeout(() => fn(), 0);
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

class CacheEntry {
  constructor(value) {
    this.value = value;
    this.ts = Date.now();
    this.v = value && (value.updatedAt || value.publishedAt) ? new Date(value.updatedAt || value.publishedAt).getTime() : 0;
  }
}

export default class PagePreloader {
  constructor(options = {}) {
    this.opts = Object.assign({ ttlMs: 5 * 60 * 1000, nextMax: 2, timeoutMs: 3000 }, options);
    this.router = null;
    this.cache = new Map();
    this.imageStore = new Map();
  }
  attach(router) {
    this.router = router;
  }
  get(key) {
    const e = this.cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > this.opts.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return e.value;
  }
  set(key, value) {
    this.cache.set(key, new CacheEntry(value));
  }
  invalidate(key) {
    this.cache.delete(key);
  }
  preloadComponentByName(name) {
    if (!this.router) return;
    const r = this.router.getRoutes().find((x) => x.name === name);
    const c = r && r.component;
    if (typeof c === 'function') idle(() => withTimeout(Promise.resolve().then(() => c()), this.opts.timeoutMs).catch(() => {}));
  }
  prefetchImage(url) {
    const key = String(url || '');
    const rec = this.imageStore.get(key);
    if (rec && rec.status === 'ok' && (Date.now() - rec.ts) < this.opts.ttlMs) return;
    idle(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageStore.set(key, { status: 'ok', ts: Date.now(), objectUrl: null });
      };
      img.onerror = () => {
        withTimeout(fetch(key, { mode: 'cors', cache: 'default' }), this.opts.timeoutMs)
          .then(r => r.ok ? r.blob() : Promise.reject(new Error('bad status')))
          .then(b => {
            const obj = URL.createObjectURL(b);
            this.imageStore.set(key, { status: 'ok', ts: Date.now(), objectUrl: obj });
          })
          .catch(() => {
            this.imageStore.set(key, { status: 'err', ts: Date.now(), objectUrl: null });
          });
      };
      img.src = key;
    });
  }
  getImageSrc(url) {
    const rec = this.imageStore.get(String(url || ''));
    return rec && rec.status === 'ok' && rec.objectUrl ? rec.objectUrl : url;
  }
  useHomePage(sorted, page, perPage) {
    const key = `home:${page}:${perPage}`;
    const hit = this.get(key);
    if (hit) return hit;
    const start = (page - 1) * perPage;
    const slice = sorted.slice(start, start + perPage);
    this.set(key, slice);
    idle(() => this.preloadNextFromHome(sorted, page, perPage));
    // prefetch current page images
    slice.slice(0, this.opts.nextMax).forEach(p => p?.cover && this.prefetchImage(p.cover));
    return slice;
  }
  preloadNextFromHome(sorted, page, perPage) {
    const nextPage = page + 1;
    const key = `home:${nextPage}:${perPage}`;
    if (!this.get(key)) {
      const start = (nextPage - 1) * perPage;
      const slice = sorted.slice(start, start + perPage);
      this.set(key, slice);
    }
    const candidates = this.get(key) || [];
    const take = candidates.slice(0, this.opts.nextMax);
    take.forEach((p) => {
      idle(() => this.preloadPost(sorted, p.id));
      p?.cover && this.prefetchImage(p.cover);
    });
    this.preloadComponentByName('post');
  }
  usePost(sorted, id) {
    const key = `post:${id}`;
    const hit = this.get(key);
    if (hit) return hit;
    const p = Array.isArray(sorted) ? sorted.find((x) => x.id === id) : null;
    if (p) this.set(key, p);
    idle(() => this.preloadNextFromPost(sorted, id));
    if (p?.cover) this.prefetchImage(p.cover);
    return p || null;
  }
  preloadPost(sorted, id) {
    const key = `post:${id}`;
    if (this.get(key)) return;
    const p = Array.isArray(sorted) ? sorted.find((x) => x.id === id) : null;
    if (p) this.set(key, p);
  }
  preloadNextFromPost(sorted, id) {
    const idx = Array.isArray(sorted) ? sorted.findIndex((x) => x.id === id) : -1;
    if (idx >= 0) {
      const nextIds = [];
      if (idx + 1 < sorted.length) nextIds.push(sorted[idx + 1].id);
      if (idx + 2 < sorted.length) nextIds.push(sorted[idx + 2].id);
      nextIds.slice(0, this.opts.nextMax).forEach((pid) => idle(() => this.preloadPost(sorted, pid)));
    }
    this.preloadComponentByName('home');
  }
  updateIfStale(key, fresh) {
    const e = this.cache.get(key);
    if (!e) return;
    const fv = fresh && (fresh.updatedAt || fresh.publishedAt) ? new Date(fresh.updatedAt || fresh.publishedAt).getTime() : 0;
    if (fv && fv !== e.v) this.set(key, fresh);
  }
}

export const pagePreloader = new PagePreloader();
