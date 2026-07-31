---
name: meishu-ui
description: 满屏玻璃美术系统 (full-screen glass UI) — 平台无关 token + 分层契约（台面/壳/窗格/内嵌），一套色调打到底、玻璃套玻璃、深浅色 surface。Web 走 CSS backdrop-filter 实时玻璃，视频渲染器 (Remotion) 走预合成玻璃。非 SwiftUI / 非 iOS。
---

# meishu-ui

可复刻的玻璃美术。真身 = **token + 契约**；`src/glass` 是第一个 React/CSS 实现。

## 何时激活

- 要给项目套上满屏玻璃 / 玻璃套玻璃
- 多色调可切换的深浅色玻璃界面
- 同一套美术打到视频渲染（Remotion）
- 玻璃看起来像「灰塑料片」需要诊断

## 分层（不可颠倒）

```
Atmosphere  漂移色斑 — 玻璃的折射源；缺了必失效
  ↓
Shell       外壳/侧栏 — 默认透亮玻璃
  ↓
Pane        主窗格 — rim + wash + 可读内容区
  ↓
Inset/Row   玻璃套玻璃 — 更轻；第 3 层起 tint-only
```

API（Web）：`GlassAtmosphere` / `GlassShell` / `GlassPane` / `GlassInset`  
API（预合成）：`PrecomposedAtmosphere` / `PrecomposedShell` / `PrecomposedPane` / `PrecomposedInset`  
Token：`resolveThemeTokens` / `applyThemeTokens` / `buildPaneSpec`  
细节 → `references/`。

## 平台分叉

| | Web（实时） | 渲染器（预合成） |
|---|---|---|
| 模糊 | `backdrop-filter` | 背景副本 `filter: blur()` 裁形 |
| wash | canvas / multiply | 预乘实色 |
| 分层 | z-index | DOM 顺序 |
| 色值 | CSS 变量 | `ThemeTokens` 传入组件 |
| 组件 | `Glass*` | `Precomposed*` |

预合成可跑配方：`references/recipes-precomposited.md` · Demo：`npm run remotion:studio`。

## 硬禁忌

1. 玻璃祖先不得有 `filter`（会静默杀掉 backdrop-filter）
2. 台面不得不透明
3. 不许硬编码品牌色 — 用 `var(--accent-primary)` / wash token
4. 浅色 `data-surface=light` 必须写覆盖
5. 真 blur ≤ 2 层

## CSS-first

不装 WebGL 也必须能出玻璃。canvas wash 可选。

## 最小配方

```tsx
import {
  applyThemeTokens, resolveThemeTokens,
  GlassAtmosphere, GlassShell, GlassPane, GlassInset,
} from './glass';
import './glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));

<>
  <GlassAtmosphere />
  <GlassShell side={<nav />}>
    <GlassPane wash="glow">
      <GlassInset as="row">row</GlassInset>
    </GlassPane>
  </GlassShell>
</>
```

更多：`references/layer-model.md` · `tokens.md` · `hard-donts.md` · `recipes-web.md` · `audit.md`
