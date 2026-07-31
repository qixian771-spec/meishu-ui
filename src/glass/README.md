# `src/glass` — web implementation of the glass art system

**Truth layer** = platform-agnostic tokens + Skill contract.  
**This folder** = Web live glass (`Glass*`) + precomposed / video glass (`Precomposed*`, `precomposed/`). Remotion demo: `remotion/PrecomposedDemo.tsx`.

## Consume in another project

```ts
import {
  resolveThemeTokens,
  applyThemeTokens,
  GlassAtmosphere,
  GlassShell,
  GlassPane,
  GlassInset,
} from './glass';
import './glass/css/index.css';

applyThemeTokens(resolveThemeTokens('ref123'));
```

Public exports: see `index.ts`.

## Nesting & blur budget

True `backdrop-filter` blur is capped at **2 depths**. Deeper layers auto-switch to **tint-only** (no blur, raised fill + rim) so nesting stays readable and cheap.

| Depth | Blur | Mode |
|------|------|------|
| 1 (Shell/Pane) | 24px | live glass |
| 2 | 14px | live glass |
| 3+ | 0 | tint-only |

Override with `tintOnly` on Pane/Inset when needed.

## Hard rule

Never put `filter` on any ancestor of a glass element — it re-roots `backdrop-filter` sampling and glass silently becomes a grey slab. Put float shadows on the glass node’s own `box-shadow`. Dev builds warn via `assertNoFilteredAncestor`.

Opaque stage with no atmosphere ⇒ no refraction. Keep `<GlassAtmosphere />` under glass.
