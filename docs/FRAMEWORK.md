# FRAMEWORK.md — meishu-ui glass

## Positioning

Art truth = **token + contract (Skill)**. Two implementations:

| Path | Package | Blur |
|------|---------|------|
| Web live | `Glass*` + `src/glass/css` | `backdrop-filter` |
| Precomposed / video | `Precomposed*` + `src/glass/precomposed` | clipped backdrop copy + `filter: blur` |

## Layers

Atmosphere → Shell → Pane → Inset. Same contract both paths. See `skill/meishu-ui/references/layer-model.md`.

## Quick start — Web

```ts
import {
  applyThemeTokens, resolveThemeTokens,
  GlassAtmosphere, GlassShell, GlassPane, GlassInset,
} from '../src/glass';
import '../src/glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));
```

## Quick start — Precomposed / Remotion

```ts
import {
  resolveThemeTokens,
  PrecomposedAtmosphere, PrecomposedShell, PrecomposedPane, PrecomposedInset,
} from '../src/glass';

const tokens = resolveThemeTokens('ref123');
// Remotion demo: remotion/PrecomposedDemo.tsx — npm run remotion:studio
```

Details: `skill/meishu-ui/references/recipes-precomposited.md`.

## API

Public exports: `src/glass/index.ts` — tokens, `applyThemeTokens`, live `Glass*`, precomposed `Precomposed*` / `buildPaneSpec` / `buildAtmosphereSpec`, `resolveBlurForDepth`.

## Blur budget

| Depth | Blur | Mode |
|------|------|------|
| 1 | 24px | live / precomposed blur copy |
| 2 | 14px | live / precomposed blur copy |
| 3+ | 0 | tint-only |

## Theme packs

`ref123` 翠玉 · `klein` 克莱因 · `sky` 天际 · `amber` 琥珀 · `cinnabar` 中国红 · `chrome` 铬 · `white` 白瓷 (light).

## Hard don'ts

No `filter` on ancestors of **live** Web glass; never ship glass over an opaque stage; no hardcoded brand hues; light surface needs overrides; blur nest ≤ 2.

## Self-check

See `skill/meishu-ui/references/audit.md`.

## Known limits

- `klein` ≈ `sky` kept on purpose
- Not an npm package yet — copy/symlink `src/glass`
- Remotion studio optional for local preview (`npm run remotion:studio`)
