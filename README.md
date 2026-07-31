# meishu-ui

Full-screen **glass art system** — reusable tokens + Skill contract + React/CSS implementation.  
满屏玻璃美术资产：真身是 **token + 契约**；`src/glass` 是 Web 实现，`Precomposed*` 走 Remotion / 视频预合成。

Demo gallery in this repo is an **acceptance stage**, not a product UI.

## Quick start

```bash
npm install
npm run dev          # gallery at http://localhost:5173
npm test             # 129 tests
npm run build
```

## Remotion (v2.1)

```bash
npm run remotion:studio
```

Composition: `PrecomposedDemo`.

## Integrate

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

- Framework notes: [`docs/FRAMEWORK.md`](docs/FRAMEWORK.md)
- Package readme: [`src/glass/README.md`](src/glass/README.md)
- Agent Skill: [`skill/meishu-ui/`](skill/meishu-ui/)
- Precomposed recipes: [`skill/meishu-ui/references/recipes-precomposited.md`](skill/meishu-ui/references/recipes-precomposited.md)

## Theme packs

`ref123` · `klein` · `sky` · `amber` · `cinnabar` · `chrome` · `white` (light)

## Hard don'ts

1. No `filter` on ancestors of **live** Web glass (`backdrop-filter` dies silently)
2. Don't ship glass over an opaque stage — need Atmosphere / colour to refract
3. No hardcoded brand hues — use accent / wash tokens
4. Nest blur budget: true blur ≤ 2 depths; deeper → tint-only

## Status

| Milestone | What |
|-----------|------|
| v2.0 | `Glass*` live glass, 7 packs, gallery, Skill |
| v2.1 | `Precomposed*` + Remotion demo |

## License

MIT — see [LICENSE](LICENSE).

Visual inspiration only: ClauseOS / RonDesignLab case studies. Not affiliated.
