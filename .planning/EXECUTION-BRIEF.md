# 执行总纲 — v2.0 ClauseOS Glass Framework + Skill

> 写给**接手执行的模型**。你没有前几轮对话的上下文，这份文件是自包含的：读完这一份 + 对应 phase 的 PLAN 就能开工。
> 最后更新：2026-07-31

---

## 1. 这个项目到底在做什么

**不是**做一个任务管理 App。仓库里那个任务仪表盘是 **demo / 验收台**。

真正的交付物是**一套可复刻到任何项目的美术资产**，消费路径有两条：

```
美术 → Skill → app        （任何前端项目吃上这套美术）
美术 → Skill → Remotion   （同一套美术打到视频渲染）
```

**美术的真身 = token + 契约（Skill），React/CSS 只是第一个实现。**（CEO 决策 2026-07-31，已锁）

这条定位决定了所有技术选择：凡是「只有浏览器才成立」的东西，都不能放进 token 层，只能放进 web 实现层。

**v2.0 范围**：token 层解耦到非浏览器也能吃 + 玻璃原语 + 色调包 + Skill。
**v2.1 范围（本里程碑不做）**：Remotion 实现层。

---

## 2. 六条红线（违反即回退）

### R1. 玻璃的任何祖先都不能有 `filter`
2026-07-31 实测：带 `filter` 的祖先会**重置 backdrop-filter 的采样根**，导致内部所有玻璃采样不到背景，静默失效。

这个 bug 在深色主题下看不出来（黑上叠黑），在浅色主题下露成灰色板砖。仓库里统计卡和登录卡曾长期是「假玻璃」，原因就是 `.glass-stage` 上挂了一句装饰性的 `filter: drop-shadow(...)`。

- 浮起阴影一律用玻璃元素自己的 `box-shadow`，不要用祖先的 `drop-shadow`
- 同理慎用祖先上的 `transform` / `opacity` / `will-change`（会创建新的层叠/包含块）
- 这条必须写进 Skill 的硬禁忌，并在 Phase 10 有测试兜住

### R2. 台面不透明 = 没有玻璃
`backdrop-filter` 模糊一块纯色等于什么都没做，玻璃会看起来像灰塑料片。**漂移色彩层（atmosphere）是系统的一部分，不是 demo 装饰。**

参考实现：`src/components/liquid/spectraGlass.css` 里的 `.liquid-stage-wash`（四团跟主题的色斑 + 34–52s 缓慢漂移 + `prefers-reduced-motion` 关闭）。

### R3. 对比度基线不得回退
当前基线：**6 套色调 × 4 个页面 = 24 个组合，WCAG 0 处不达标，最差 4.54:1**。

门槛：常规文字 4.5:1，大字（≥24px 或 ≥18.66px 且 ≥700 字重）3:1。改任何颜色/透明度后必须重测（方法见第 5 节）。

### R4. 一套色打到底，不许彩虹
wash 的 `soft/mid/deep/glow/chrome` 五个角色是**同一色相的深浅档**，不是五种颜色。切主题后整页（壳/窗格/内嵌/阴影/进度条）必须同色相。

仓库里已经清掉一批硬编码克莱因蓝的泄漏（卡片投影、hover 光晕、hero 边框、地面阴影、CTA 按钮、甘特条）。**新代码不许再出现硬编码品牌色**，用 `var(--accent-primary)` 或 `color-mix(in srgb, var(--accent-primary) N%, transparent)`。

### R5. CSS-first，WebGL/canvas 只能是可选增强
不装 WebGL 也要能出玻璃。canvas wash 是戏眼，不是地基。

### R6. demo 不许当产品堆功能
不要往任务仪表盘加业务功能（真实数据、后端、鉴权、看板视图）。它只是「示例组合」。

---

## 3. Remotion 的硬限制（决定了 v2.1 怎么做，v2.0 要为它留口）

Remotion 渲染器**不支持**（[官方 limitations](https://www.remotion.dev/docs/client-side-rendering/limitations)）：

| 不支持 | 我们的美术在哪用了它 | v2.1 的替代手法 |
|---|---|---|
| `backdrop-filter` | 全部玻璃 | 预合成：背景层单独渲一份 `filter: blur()` 副本，裁到面板形状，再叠半透明色板 + rim |
| `mix-blend-mode` | glassWash / ultrathink 的 `multiply` | 预乘算成实色直接填 |
| `z-index` | 分层 | 用 DOM 顺序 |
| CSS keyframes 时间轴 | `.liquid-stage-wash` 漂移 | `useCurrentFrame()` 驱动 transform |

注意 `filter`（非 backdrop）**是支持的**——但见 R1，它会杀掉 backdrop-filter。Remotion 里习惯用 `filter` 做淡入淡出，一加就把玻璃全废，所以 v2.1 走预合成路径反而更安全。

**v2.0 要为此留的口只有一个**：token 层必须能在没有 DOM 的环境里解析出完整色表（FR-06）。别的都留给 v2.1。

---

## 4. 代码现状地图（2026-07-31 实测）

```
src/
  liquid/                      液态/玻璃底层 + token 数据
    accentThemes.ts      393行  ★ 已是纯数据 + 3个纯函数，最接近 token 层
    glassWash.ts          97行  canvas wash 绘制（surface-aware）
    ultrathink.ts        165行  canvas shimmer（surface-aware）
    liquid.css                  html/body/#root 基底
    LiquidCanvas.ts / liquid.frag / QualityGovernor.ts / tierResolver.ts …  WebGL 层
  theme/
    AccentThemeContext.tsx 152行 ★ 混合体，Phase 9 主要战场
  components/
    liquid/
      spectraGlass.css   2673行 ★ 单体巨石：框架样式 + demo 布局混在一起
      SpectraGlassCard.tsx 288行
      LiquidAvatar/Badge/Button/Logo/StaticBlobs.tsx
      liquidElements.css / navStyles.css
    dashboard/
      DashboardWorkspace.tsx 460行  demo 主页面
      UltrathinkStrip.tsx
    theme/ThemeSwitcher.tsx
  App.tsx                283行  四个 demo 页面（任务管理/项目总览/设置中心/账号登录）
```

**依赖极简**：运行时只有 `react` + `react-dom`；开发有 `vite` / `vitest` / `typescript` / `vite-plugin-glsl` / `@testing-library/*` / `jsdom`。没有 monorepo（无 `packages/`）。

**测试基线**：`npm test` → 21 files / 76 tests 全绿。这是不可回退线。

### 三个关键文件的现状细节

**`src/liquid/accentThemes.ts`** — 已经很干净，基本就是 token 源：
- 类型：`AccentThemeId`（`ref123｜klein｜sky｜amber｜chrome｜white`）、`WashRole`（`soft｜mid｜deep｜glow｜chrome`）、`WashPalette`（ink/mid/glow/rim 各为 `[r,g,b]`）、`AccentTheme`
- 数据：`ACCENT_THEMES`、`ACCENT_THEME_ORDER`、`ACCENT_THEME_LIST`、`DEFAULT_ACCENT_THEME`（`ref123`）、`ACCENT_THEME_STORAGE_KEY`（`lingxi-accent-theme`）
- 纯函数：`isAccentThemeId`、`resolveAccentTheme`（含 legacy `mint→ref123` 映射）、`washForTheme`
- `white` 是唯一 `surface: 'light'`，有 `stageBg: '#F4F5F7'`
- 注意：`AccentTheme.ultrathink` 引了 `./ultrathink` 的 `UltrathinkColors` 类型——Phase 9 拆 token 时要处理这个方向依赖（type-only import 可保留，但别把 canvas 代码拖进 token 层）

**`src/theme/AccentThemeContext.tsx`** — Phase 9 要拆的混合体，152 行里有三样东西：
1. `pickOnAccent(hex)`（24–39 行）：按亮度在 `#0A0A0F` / `#F8FAFC` 里选 CTA 文字色，**纯函数、平台无关** → 应下沉到 token 层
2. `readStoredTheme()`（49–62 行）：localStorage 读取 + legacy 迁移 → 属于 web 实现
3. `useEffect` 里约 50 行 `root.style.setProperty(...)`（78–129 行）：**这里混了两件事**——「按 surface 决定整套文字色阶 / wash 的 alpha 档位（light 0.35/0.5/0.75，dark 0.45/0.4/0.55）」是平台无关的**决策**，而 `setProperty` 是 DOM **注入**。决策要下沉，注入留在 web

**`src/components/liquid/spectraGlass.css`** — 2673 行巨石，Phase 9 要切开。里面混着：
- 框架级：`.glass-container*`（含 `--quiet`/`--hero`/`--wash-*` 变体）、`.glass-panel-box*`、`.glass-sidebar`、`.glass-nav-item`、`.glass-input`、`.glass-stage`、`.glass-cast-shadow`、`.glass-rim-arc`、`.liquid-stage-wash`、`html[data-surface='light']` 覆盖块
- demo 级：`.dash-*`（几十个类）、`.task-table`/`.task-footer`/`.pager*`、`.filter-*`、`.tasks-layout`、`.settings-stack`、`.login-stage`、`.app-page-header`、`.card-stage-floor`
- 切割原则：类名以 `glass-` / `liquid-` 打头、或是 token/surface 覆盖 → 框架；`dash-`/`task-`/`filter-`/页面布局 → demo

---

## 5. 怎么验证「玻璃真的生效」和「对比度没回退」

**这是最容易糊弄过去的地方**——CSS 看着写对了不等于渲染对了（见 R1，那个 bug 存在了很久没人发现）。

项目跑在 `http://127.0.0.1:5173/`（`npm run dev`）。用浏览器工具做两件事：

### 5.1 玻璃生效自查
对每个声称是玻璃的元素，确认三件事同时成立：
1. 自己有 `backdrop-filter: blur(...)`
2. 背景色 alpha 明显小于 1（一般 0.03–0.08 深色 / 0.6–0.75 浅色）
3. **所有祖先的 `filter` 都是 `none`** ← R1

第 3 条可以直接查：
```js
// 列出所有「玻璃元素的祖先里有 filter」的违规项
[...document.querySelectorAll('*')].filter(el => {
  const cs = getComputedStyle(el);
  if (!cs.backdropFilter || cs.backdropFilter === 'none') return false;
  let p = el.parentElement;
  while (p) { if (getComputedStyle(p).filter !== 'none') return true; p = p.parentElement; }
  return false;
}).map(el => el.className);
// 期望：空数组
```

### 5.2 对比度审计（24 组合）
遍历 6 套色调 × 4 个页面，对每个含文字的元素合成实际背景色算 WCAG 比值。

**两个坑必须避开，否则数字全是假的：**

- **过渡节流**：后台 webview 会冻结 CSS 过渡时间轴，切主题后 `getComputedStyle` 会长时间返回**切换前**的旧值。症状是一堆比值整齐地卡在 1.0x 附近（浅色卡片填充配浅色文字）。解法：切换后强制结束过渡
  ```js
  document.getAnimations()
    .filter(a => a.constructor.name === 'CSSTransition')
    .forEach(a => { try { a.finish(); } catch {} });
  ```
  或者干脆 `localStorage.setItem('lingxi-accent-theme', id)` 然后 reload，以加载态测量。
- **canvas 采样漂移**：早期脚本会去 canvas 上取像素当背景，采样点随布局变化乱跑，产出大量假阳性。**别采 canvas**，用纯 DOM 祖先链合成背景（起点是 `--spectra-dark-bg`），canvas wash 与台面同向，不会翻转结论。
- 元素若有 `filter: brightness(n)`（例如浅色主题下的状态文字），算前景色时要把 n 乘进去。

**主题切换器只在「设置中心」页存在**，所以顺序必须是：进设置页 → 点色调 chip（`[data-theme-chip="<id>"]`）→ 再跳到目标页测量。

---

## 6. 执行顺序与总验收

```
Phase 9  → 10 → 11 → 12     （严格串行，10 依赖 9 的 token，11 依赖 10 的原语，12 依赖 11 的成品）
```

每个 phase 目录下有 `PLAN.md`（概览 + 拆分）和 `NN-0X-PLAN.md`（可执行步骤）。**按 plan 顺序做，每个 plan 做完就跑该 plan 的验收，绿了再进下一个。**

里程碑总验收：
- [ ] `npm test` 全绿，且测试数 ≥ 76（只增不减）
- [ ] `npm run build` 成功
- [ ] 24 组合对比度 0 fail，最差 ≥ 4.5:1
- [ ] 5.1 的祖先 filter 违规查询返回空数组
- [ ] token 层能在 Node 里解析（`node --experimental-strip-types` 或 vitest 环境，无 DOM）
- [ ] 有人拿着 Skill + FRAMEWORK.md 能在空项目里搭出 Shell→Pane→Inset 三层玻璃

---

## 7. 有疑问时的判断顺序

1. 这条改动是「只有浏览器成立」的吗？是 → 不能进 token 层
2. 会让 demo 变成产品吗？会 → 不做
3. 会动到对比度或透明度吗？会 → 改完必须重跑 24 组合
4. 会给玻璃的祖先加 `filter`/`transform`/`opacity` 吗？会 → 换成玻璃自身的 `box-shadow`
5. 拿不准的方向性问题（交付形态、范围、优先级）→ 停下来问 CEO，不要自己替他决定
