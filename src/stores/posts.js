import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref([
    {
      id: "hello-vue3",
      title: "你好，Vue 3 组合式语法",
      summary: "用更直观的方式组织逻辑与状态，构建可维护的前端工程。",
      tags: ["Vue", "Composition API"],
      cover: "https://picsum.photos/seed/vue3/640/360",
      readMins: 6,
      origin: "original",
      updatedAt: "2025-12-09T15:20:00.000Z",
      content: `
        <h2>为什么选择组合式 API</h2>
        <p>在真实项目中，我们常常需要将“数据获取、状态管理、业务规则、界面交互”这几类逻辑组织成可维护的结构。选用组合式 API 的核心优势在于，它提供了“按功能聚合”的组织方式，而不是“按选项分散”的传统方式。这种聚合让我们更容易定位问题、复用逻辑并编写测试。</p>
        <p>例如，在一个文章详情页中，你可能会同时处理：目录生成、滚动同步、可访问性（ARIA）、异步数据加载、渲染优化、样式自适应。这些逻辑如果散落在多个选项中，往往会使代码变得冗长且难以维护；而组合式 API 则可以将这些相关逻辑放置在一起，使其结构更加清晰。</p>

        <h2>基础示例与项目结构</h2>
        <p>下面通过一个简化示例展示如何在 <code>setup</code> 中组织逻辑。这个示例围绕“目录生成与滚动同步”展开，包含状态定义、DOM 采集、节流与观察者。</p>
        <pre><code class="language-ts">import { ref, onMounted } from 'vue'
const sections = ref([])
const activeId = ref('')
function buildToc() {
  const heads = Array.from(document.querySelectorAll('.post .content h2, h3'))
  sections.value = heads.map(h => ({ id: h.id, text: h.textContent }))
}
onMounted(() => {
  buildToc()
})
        </code></pre>
        <p>实际项目还需要考虑：为没有 <code>id</code> 的标题生成唯一标识；根据用户滚动位置自动高亮当前条目；为大量 DOM 节点的观察做性能优化等。</p>

        <h2>自动化测试与可访问性</h2>
        <p>在复杂交互场景下，建议为交互组件（如目录手风琴）加入基础的无障碍支持。为切换按钮添加 <code>role="button"</code>、<code>aria-expanded</code>、<code>aria-controls</code>，为导航容器添加 <code>role="navigation"</code> 和 <code>aria-label</code>。这不仅利于读屏器，也帮助我们在自动化测试中选择稳定的语义化定位。</p>
        <blockquote>
          <p>无障碍支持不是锦上添花，而是能够显著提升产品质量与易用性的基础能力。尤其在知识类、内容类网站中，它能帮助更多用户高效获取信息。</p>
        </blockquote>

        <h2>性能优化与节流</h2>
        <p>目录组件通常需要监听大量标题节点。可以采用 <code>IntersectionObserver</code> 进行滚动观察，并通过设置 <code>rootMargin</code> 与 <code>threshold</code> 来平衡响应速度和性能。同时，避免在滚动事件中频繁进行 DOM 计算，尽量把计算迁移到初始化阶段，并在滚动观察中只做状态更新。</p>
        <ul>
          <li>初始化时完成树构建与 <code>id</code> 唯一化</li>
          <li>滚动观察时只更新 <code>activeId</code> 与展开路径</li>
          <li>交互动画使用 CSS 过渡（如 <code>max-height</code>），避免 JS 重排</li>
        </ul>

        <h2>样式语言与设计规范</h2>
        <p>在统一设计语言方面，建议采用全局变量（如主题色、边框色、内容宽度），并用 SCSS 的嵌套与变量管理复杂样式。正文区域最好限定一个舒适阅读宽度（例如 680–820px），并针对 <code>h2/h3</code>、代码块、引用、表格、图片进行差异化设计。</p>
        <hr />

        <h2>工程实践：目录手风琴的实现</h2>
        <h3>数据结构</h3>
        <p>我们使用树形结构表示标题层级，每个节点包含 <code>id</code>、<code>text</code>、<code>level</code> 和 <code>children</code>：</p>
        <pre><code class="language-ts">type TocNode = {
  id: string
  text: string
  level: number
  children: TocNode[]
}
        </code></pre>

        <h3>唯一化 ID 生成</h3>
        <p>为无 <code>id</code> 的标题生成 <code>slug</code>；如果出现重名，追加递增编号以保证唯一：</p>
        <pre><code class="language-ts">function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
function ensureUnique(base: string, used: Set<string>) {
  let id = base, n = 1
          while (used.has(id)) { id = '\${base}-\${n++}' }
  used.add(id)
  return id
}
        </code></pre>

        <h3>滚动跟随与展开路径</h3>
        <p>通过 <code>IntersectionObserver</code> 观察标题节点，当某个标题进入视口时，设置当前高亮，并沿祖先路径展开手风琴：</p>
        <pre><code class="language-ts">const activeId = ref('')
const openIds = ref(new Set<string>())
function expandPath(id: string) {
  const s = new Set(openIds.value)
  let cur: string | undefined = id
  while (parentMap.has(cur)) { s.add(parentMap.get(cur)!) ; cur = parentMap.get(cur)! }
  s.add(id)
  openIds.value = s
}
        </code></pre>

        <h3>无障碍与动画</h3>
        <p>手风琴按钮应标注 <code>aria-expanded</code> 与 <code>aria-controls</code>，子列表容器可用 <code>role="group"</code>。动画建议使用 CSS 过渡控制高度或透明度，避免引发大量重排。</p>

        <h2>表格与图片示例</h2>
        <table>
          <thead>
            <tr><th>特性</th><th>说明</th><th>推荐</th></tr>
          </thead>
          <tbody>
            <tr><td>滚动观察</td><td>使用 IntersectionObserver</td><td>是</td></tr>
            <tr><td>唯一 ID</td><td>通过 slug + 自增避免冲突</td><td>是</td></tr>
            <tr><td>动画</td><td>CSS 过渡，避免 JS 重排</td><td>是</td></tr>
          </tbody>
        </table>
        <p>图片示例：</p>
        <img src="https://picsum.photos/seed/vue-composition/800/420" alt="Vue Composition" />

        <h2>常见坑与解决方案</h2>
        <h3>在窄屏下的显示策略</h3>
        <p>目录面板应在较窄屏幕隐藏，避免遮挡内容；也可以改为抽屉模式。正文应保持合理的内边距与行高，提升阅读舒适度。</p>
        <h3>过度依赖 watch 与计算开销</h3>
        <p>目录构建应尽量在挂载时一次性完成；当正文动态更新（如路由切换）再重建一次，避免频繁的 DOM 操作。</p>

        <h2>总结与建议</h2>
        <p>结合组合式 API 的优势，我们可以将“目录生成、滚动同步、无障碍、动画与样式”这些逻辑聚合在一个可维护的模块中：初始化阶段只做一次性的结构计算，交互阶段尽量只更新状态，样式层通过变量与响应式布局保持一致性。</p>
        <p>该思路适用于文章详情页、文档站点、知识库等内容密集型场景。通过合理的工程实践与测试，你可以在保证易用性的前提下，持续迭代产品体验。</p>
      `,
      publishedAt: "2025-12-08T10:00:00.000Z",
    },
    {
      id: "pinia-basics",
      title: "Pinia 入门：比 Vuex 更丝滑的状态管理",
      summary: "用 store 管理全局状态，轻松实现派生与持久化。",
      tags: ["Pinia", "State"],
      cover: "https://picsum.photos/seed/pinia/640/360",
      readMins: 5,
      content: `
        <p>Pinia 提供极简的 API 与完善的开发体验，适合中小型项目的状态管理。</p>
        <p>通过 <code>defineStore</code> 定义 store，并在组件中以组合式方式使用。</p>
        <pre><code class="language-ts" data-note="Pinia store 示例">import { defineStore } from 'pinia'
type User = { id: string; name: string }
export const useUserStore = defineStore('user', {
  state: () => ({ list: [] as User[], loading: false }),
  getters: {
    count: (s) => s.list.length,
    byId: (s) => (id: string) => s.list.find(u => u.id === id)
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        const res = await fetch('/api/users')
        this.list = await res.json()
      } finally {
        this.loading = false
      }
    }
  }
})
        </code></pre>
      `,
      publishedAt: "2025-12-07T09:20:00.000Z",
      updatedAt: "2025-12-08T12:10:00.000Z",
    },
    {
      id: "router-spa",
      title: "Vue Router 搭建单页面应用基础结构",
      summary: "用路由组织页面与跳转，构建清晰的导航体验。",
      tags: ["Router", "SPA"],
      cover: "https://picsum.photos/seed/router/640/360",
      readMins: 7,
      origin: "reprint",
      sourceUrl: "https://router.vuejs.org/",
      updatedAt: "2025-12-06T10:00:00.000Z",
      content: `
        <p>使用 Vue Router 划分页面与导航，借助嵌套路由与动态路由完成复杂场景。</p>
        <p>通过 <code>createRouter</code> 与 <code>createWebHistory</code> 初始化，并在根组件挂载。</p>
        <pre><code class="language-ts" data-note="长代码块测试：Router 配置示例">import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import Post from '@/views/PostView.vue'
import About from '@/views/AboutView.vue'

function guard(to, from, next) {
  // 示例守卫逻辑
  next()
}

const routes = [
  { path: '/', name: 'home', component: Home, beforeEnter: guard },
  { path: '/post/:id', name: 'post', component: Post },
  { path: '/about', name: 'about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  }
})

// 模拟更多配置行以测试滚动与行号（共 120 行）
// 01
// 02
// 03
// 04
// 05
// 06
// 07
// 08
// 09
// 10
// 11
// 12
// 13
// 14
// 15
// 16
// 17
// 18
// 19
// 20
// 21
// 22
// 23
// 24
// 25
// 26
// 27
// 28
// 29
// 30
// 31
// 32
// 33
// 34
// 35
// 36
// 37
// 38
// 39
// 40
// 41
// 42
// 43
// 44
// 45
// 46
// 47
// 48
// 49
// 50
// 51
// 52
// 53
// 54
// 55
// 56
// 57
// 58
// 59
// 60
// 61
// 62
// 63
// 64
// 65
// 66
// 67
// 68
// 69
// 70
// 71
// 72
// 73
// 74
// 75
// 76
// 77
// 78
// 79
// 80
// 81
// 82
// 83
// 84
// 85
// 86
// 87
// 88
// 89
// 90
// 91
// 92
// 93
// 94
// 95
// 96
// 97
// 98
// 99
// 100
// 101
// 102
// 103
// 104
// 105
// 106
// 107
// 108
// 109
// 110
// 111
// 112
// 113
// 114
// 115
// 116
// 117
// 118
// 119
// 120
export default router
        </code></pre>
      `,
      publishedAt: "2025-12-06T08:30:00.000Z",
      updatedAt: "2025-12-06T09:00:00.000Z",
    },
    {
      id: "router-1",
      title: "Vue Router 搭建单页面应用基础结构",
      summary: "用路由组织页面与跳转，构建清晰的导航体验。",
      tags: ["Router", "SPA"],
      cover: "https://picsum.photos/seed/router/640/360",
      readMins: 7,
      content: `<p>这是一篇示例文章，用于填充内容结构。</p>`,
      publishedAt: "2025-12-06T08:30:00.000Z",
    },
    {
      id: "router-2",
      title: "Vue Router 搭建单页面应用基础结构",
      summary: "用路由组织页面与跳转，构建清晰的导航体验。",
      tags: ["Router", "SPA"],
      cover: "https://picsum.photos/seed/router/640/360",
      readMins: 7,
      content: `<p>这是一篇示例文章，用于填充内容结构。</p>`,
      publishedAt: "2025-12-06T08:30:00.000Z",
      updatedAt: "2025-12-06T09:00:00.000Z",
    },
  ]);

  function extractText(html) {
    const s = (html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/[\r\n\t]+/g, " ")
      .trim();
    return s;
  }

  function computeReadStats(post) {
    const txt = extractText(post?.content);
    const wordChars = txt.match(/[\u4e00-\u9fffA-Za-z0-9]/g);
    const chars = wordChars ? wordChars.length : 0;
    const mins = Math.max(1, Math.round(chars / 500));
    return { chars, mins };
  }

  function normalize() {
    posts.value = posts.value.map((p) => {
      const stats = computeReadStats(p);
      return { ...p, readStats: stats, readMins: stats.mins };
    });
  }

  const sorted = computed(() =>
    [...posts.value].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  );

  function addPost(post) {
    const stats = computeReadStats(post);
    posts.value.push({ ...post, readStats: stats, readMins: stats.mins });
  }

  function updatePost(id, changes) {
    const idx = posts.value.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const next = { ...posts.value[idx], ...changes };
    const stats = computeReadStats(next);
    posts.value[idx] = { ...next, readStats: stats, readMins: stats.mins };
  }

  normalize();

  return { posts, sorted, addPost, updatePost };
});
