# meishu-ui

<p align="center">
  <a href="https://qixian771-spec.github.io/meishu-ui/">
    <img src="docs/media/gallery.png" alt="meishu-ui gallery — full-screen glass art system" width="100%" />
  </a>
</p>

<p align="center">
  <strong>Full-screen glass art system</strong> — tokens + Skill contract + React/CSS + Remotion precomposed.<br/>
  满屏玻璃美术资产：真身是 <strong>token + 契约</strong>；Web 走 <code>Glass*</code>，视频走 <code>Precomposed*</code>。
</p>

<p align="center">
  <a href="https://qixian771-spec.github.io/meishu-ui/"><img src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-4ADE80?style=flat-square" alt="Live Demo" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT" /></a>
  <a href="https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.1"><img src="https://img.shields.io/badge/version-v2.1-informational?style=flat-square" alt="v2.1" /></a>
  <img src="https://img.shields.io/badge/tests-129%20passing-success?style=flat-square" alt="tests" />
</p>

<p align="center">
  <a href="https://qixian771-spec.github.io/meishu-ui/"><b>Live Demo</b></a> ·
  <a href="docs/FRAMEWORK.md">Framework</a> ·
  <a href="skill/meishu-ui/">Skill</a> ·
  <a href="src/glass/README.md">src/glass</a>
</p>

> Demo gallery is an **acceptance stage**, not a product UI.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm test
npm run build
```

## Remotion (v2.1)

```bash
npm run remotion:studio
```

Composition: `PrecomposedDemo`.

## Integrate (Web)

```ts
import {
  applyThemeTokens,
  resolveThemeTokens,
  GlassAtmosphere,
  GlassShell,
  GlassPane,
  GlassInset,
} from './src/glass';
import './src/glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));
```

Precomposed / video: see [`skill/meishu-ui/references/recipes-precomposited.md`](skill/meishu-ui/references/recipes-precomposited.md).

## Theme packs

`ref123` · `klein` · `sky` · `amber` · `cinnabar` · `chrome` · `white` (light)

## Hard don'ts

1. No `filter` on ancestors of **live** Web glass
2. Don't ship glass over an opaque stage — need Atmosphere
3. No hardcoded brand hues — use accent / wash tokens
4. Nest blur ≤ 2 depths; deeper → tint-only

## Status

| Milestone | What |
|-----------|------|
| [v2.0](https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.0) | `Glass*` live glass, 7 packs, gallery, Skill |
| [v2.1](https://github.com/qixian771-spec/meishu-ui/releases/tag/v2.1) | `Precomposed*` + Remotion demo |

## Manage this repo (cheat sheet)

| What | How |
|------|-----|
| About / topics / homepage | `gh repo edit --description … --homepage … --add-topic …` |
| Live demo | GitHub Actions → Pages (`.github/workflows/pages.yml`) |
| Social preview card | Settings → General → Social preview → upload `docs/media/og.png` |
| Releases | Tags `v2.0` / `v2.1` already pushed |
| README is the homepage | First image + badges = first screen visitors see |

## License

MIT — see [LICENSE](LICENSE).

Visual inspiration only: ClauseOS / RonDesignLab. Not affiliated.

<p align="center">
  <img src="docs/media/og.png" alt="meishu-ui social card" width="640" />
</p>
