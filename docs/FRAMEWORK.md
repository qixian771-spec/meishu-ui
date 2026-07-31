# FRAMEWORK.md — meishu-ui glass

## Positioning

Art truth = **token + contract (Skill)**. React/CSS in `src/glass` is the first implementation. Remotion is planned for v2.1.

## Layers

Atmosphere → Shell → Pane → Inset. See `src/glass/README.md` and `skill/meishu-ui/references/layer-model.md`.

## Quick start

```ts
import {
  applyThemeTokens, resolveThemeTokens,
  GlassAtmosphere, GlassShell, GlassPane, GlassInset,
} from '../src/glass';
import '../src/glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));
```

## API

Public exports: `src/glass/index.ts` — tokens, `applyThemeTokens`, `GlassAtmosphere`, `GlassShell`, `GlassPane`, `GlassInset`, `resolveBlurForDepth`.

## Blur budget

| Depth | Blur | Mode |
|------|------|------|
| 1 | 24px | live |
| 2 | 14px | live |
| 3+ | 0 | tint-only |

## Theme packs

`ref123` 翠玉 · `klein` 克莱因 · `sky` 天际 · `amber` 琥珀 · `cinnabar` 中国红 · `chrome` 铬 · `white` 白瓷 (light).

## Hard don'ts

No `filter` on glass ancestors; never ship glass over an opaque stage; no hardcoded brand hues; light surface needs overrides; blur nest ≤ 2.

## Self-check

See `skill/meishu-ui/references/audit.md`.

## Known limits

- Remotion implementation not shipped (v2.1)
- `klein` ≈ `sky` kept on purpose
- Not an npm package yet — copy/symlink `src/glass`
- React only
