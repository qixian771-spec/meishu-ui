# Pre-composited recipes (Remotion / video)

> **Not render-verified.** Landing in v2.1. Treat as contract guidance only.

Video Chromium often lacks `backdrop-filter`, `mix-blend-mode`, and reliable `z-index`.

Approach:

1. `resolveThemeTokens(id)` → use `*Rgb` arrays
2. Glass = clipped blurred copy of backdrop + translucent fill + rim strokes
3. Wash = premultiplied solid colour (no multiply blend)
4. Layers = DOM order
5. Motion = `useCurrentFrame()` driven transforms (not CSS keyframes on atmosphere)

Do **not** mix live `backdrop-filter` with ancestor `filter` fades — see hard-donts.
