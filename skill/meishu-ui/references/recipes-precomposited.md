# Pre-composited recipes (Remotion / video)

> **v2.1 — renderable.** Uses `src/glass/precomposed`. Demo: `remotion/PrecomposedDemo.tsx`.

Video Chromium often lacks `backdrop-filter`, `mix-blend-mode`, and reliable `z-index`.

## Approach

1. `resolveThemeTokens(id)` → pass `tokens` into precomposed components (use `*Rgb` / washes inside builders)
2. Glass = clipped blurred copy of backdrop (`filter: blur` on `.pc-blur-copy` only) + translucent fill + rim
3. Wash = premultiplied solid colour via `buildPaneSpec` (no multiply blend)
4. Layers = DOM order (Atmosphere under Shell under Pane)
5. Motion = `useCurrentFrame()` driven transforms on Atmosphere `drift` — not CSS keyframes

Do **not** put `filter` on ancestors of **live** Web glass (`GlassPane`). Precomposed blur copies are a separate tree.

## Runnable recipe

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  resolveThemeTokens,
  PrecomposedAtmosphere,
  PrecomposedShell,
  PrecomposedPane,
  PrecomposedInset,
} from '../src/glass';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = resolveThemeTokens('ref123');
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ background: tokens.stage.bg }} className="pc-root">
      <PrecomposedAtmosphere
        tokens={tokens}
        drift={{
          xA: Math.sin(t * 0.35) * 0.06,
          yA: Math.cos(t * 0.28) * 0.05,
          xB: Math.cos(t * 0.22) * 0.07,
          yB: Math.sin(t * 0.31) * 0.06,
        }}
      />
      <PrecomposedShell tokens={tokens} side={<nav>side</nav>}>
        <PrecomposedPane tokens={tokens} wash="glow">
          <PrecomposedInset tokens={tokens} wash="mid">row</PrecomposedInset>
        </PrecomposedPane>
      </PrecomposedShell>
    </AbsoluteFill>
  );
};
```

Studio: `npm run remotion:studio` → composition `PrecomposedDemo`.

## Builders (tests / non-React)

```ts
import { resolveThemeTokens, buildPaneSpec, buildAtmosphereSpec } from '../src/glass';

const tokens = resolveThemeTokens('klein');
const pane = buildPaneSpec(tokens, 1, 'glow'); // blurPx / fill / rim*
const atm = buildAtmosphereSpec(tokens);
```

Nest budget is the same as Web: depth 3+ → `tintOnly: true`, `blurPx: 0`.
