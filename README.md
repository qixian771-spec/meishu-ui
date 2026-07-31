# meishu-ui

**在线画廊（点开即看，不用另找链接）：**  
### 👉 https://qixian771-spec.github.io/meishu-ui/

<p align="center">
  <a href="https://qixian771-spec.github.io/meishu-ui/">
    <img src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E7%94%BB%E5%BB%8A-Live%20Demo-4ADE80?style=for-the-badge&logo=github" alt="在线画廊 Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://qixian771-spec.github.io/meishu-ui/">
    <img src="docs/media/gallery.png" alt="点击进入在线画廊 — meishu-ui glass art gallery" width="100%" />
  </a>
</p>

<p align="center"><b>↑ 点击上图 = 打开在线画廊</b>（满屏玻璃 · 七套色 · 嵌套预算）</p>

---

满屏**玻璃美术系统**：真身是 **token + 契约（Skill）**；Web 用 `Glass*`（`backdrop-filter`），视频 / Remotion 用 `Precomposed*`。

Full-screen **glass art system** — tokens + Skill + React/CSS live glass + Remotion precomposed.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT" /></a>
  <a href="https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.1"><img src="https://img.shields.io/badge/version-v2.1-informational?style=flat-square" alt="v2.1" /></a>
  <img src="https://img.shields.io/badge/tests-129%20passing-success?style=flat-square" alt="tests" />
</p>

| 看效果 | 读契约 | 拷代码 |
|--------|--------|--------|
| [**在线画廊**](https://qixian771-spec.github.io/meishu-ui/) | [Skill `meishu-ui`](skill/meishu-ui/) · [FRAMEWORK](docs/FRAMEWORK.md) | [`src/glass`](src/glass/README.md) |

> 仓库里的页面是**验收画廊**，不是某个产品 App。

---

## 30 秒本地跑

```bash
npm install
npm run dev    # http://localhost:5173  ← 和线上画廊同一套
```

## 接入（Web）

```ts
import {
  applyThemeTokens, resolveThemeTokens,
  GlassAtmosphere, GlassShell, GlassPane, GlassInset,
} from './src/glass';
import './src/glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));
```

视频预合成：[`recipes-precomposited.md`](skill/meishu-ui/references/recipes-precomposited.md) · `npm run remotion:studio`

## 七套色调

`ref123` 翠玉 · `klein` 克莱因 · `sky` 天际 · `amber` 琥珀 · `cinnabar` 中国红 · `chrome` 铬 · `white` 白瓷

## 硬禁忌

1. 玻璃祖先不得有 `filter`（会杀掉 `backdrop-filter`）
2. 台面不得不透明 — 要有 Atmosphere
3. 不许硬编码品牌色 — 用 accent / wash token
4. 真 blur ≤ 2 层；更深 tint-only

## 版本

| Tag | 内容 |
|-----|------|
| [v2.0](https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.0) | 实时玻璃原语 · 七套色 · 画廊 · Skill |
| [v2.1](https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.1) | 预合成玻璃 · Remotion demo |

## License

MIT · [LICENSE](LICENSE)

视觉灵感来自 ClauseOS / RonDesignLab，无隶属关系。
