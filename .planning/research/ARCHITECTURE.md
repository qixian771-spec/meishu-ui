# Architecture Research

**Domain:** WebGL liquid-gradient background layer composited under a glassmorphism UI in a web app
**Project:** 灵犀 Nexus (dark glass + 翠绿 accent, liquid as system-wide visual motif)
**Researched:** 2026-07-30
**Confidence:** HIGH (layering/visibility) · MEDIUM (backdrop-filter cost, resolution scaling, poster)

---

## Standard Architecture

### System Overview

The liquid layer is a **single fixed full-screen canvas sitting at the bottom of the z-stack**, with the entire app UI rendered above it as a transparent layer tree. Glassmorphism panels use `backdrop-filter` to blur whatever is behind them — which, in this model, is the live animated canvas. A static poster image sits *behind* the canvas as a paint-color floor, so if WebGL fails or is gated off, the user still sees a themed gradient, not a black void.

```
┌─────────────────────────────────────────────────────────────────────┐
│  z: 30+  App UI Layer  (transparent root, cards, text, nav, buttons) │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐    │
│  │ Glass Card   │  │ Glass Card        │  │ Solid UI (buttons)   │    │
│  │ backdrop-    │  │ backdrop-filter   │  │ no backdrop-filter   │    │
│  │ filter:blur  │  │ blur(...) saturate│  │                      │    │
│  └──────────────┘  └──────────────────┘  └──────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│  z: 10   Liquid Canvas  <canvas>  position:fixed; inset:0            │
│          pointer-events:none; z-index:10                             │
│          (WebGL fragment shader · domain-warped fbm noise)           │
├─────────────────────────────────────────────────────────────────────┤
│  z: 0    Poster Fallback  <div>  position:fixed; inset:0             │
│          background-image: liquid-poster.webp  (theme-colored)       │
│          (visible only when WebGL is off / gated)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **LiquidCanvas** | Owns the WebGL context, shader program, rAF loop, resize/DPR, visibility pause, uniform updates. Renders one full-screen triangle. | A single `<canvas>` + a renderer class. Pure rendering — no theme logic. |
| **ThemeBridge** | Translates app theme tokens (colors, intensity, speed) into shader `uniform` values. The only thing that knows both worlds. | A pure function `theme → uniform struct`, called each frame or on theme change. |
| **QualityGate** | Decides at runtime whether to run WebGL, run static, and at what resolution scale. One-time + adaptive. | Feature-detect WebGL, read `prefers-reduced-motion` / `save-data` / heuristics, watch frame timing. |
| **PosterLayer** | Static themed gradient image shown when WebGL is off/gated. Always present in DOM behind canvas. | `<div>` with `background-image`, sized to viewport. |
| **GlassPanel (UI)** | Frosted-glass cards using `backdrop-filter`. Lives in the app layer; does NOT know about WebGL directly. | CSS class + `backdrop-filter: blur() saturate()`. |

---

## Layering & Stacking Model

### The three rules that make composition work

1. **Fixed canvas, full-bleed, behind everything.** The canvas is `position: fixed; inset: 0; width/height: 100%`. It never scrolls, never reflows, never participates in layout. This is exactly what `liquid-demo.html` already does — keep it.
2. **`pointer-events: none` on the canvas.** The liquid is decorative; all clicks must pass through to the UI. Without this, the canvas would swallow every pointer event on the page. The poster div gets `pointer-events: none` too.
3. **App UI is a single transparent root at `z-index ≥ 30`.** The app's root container has `background: transparent` (or a very subtle tint) so the liquid shows through the gaps between cards. Cards themselves are semi-opaque glass.

### z-index ladder (fixed, documented contract)

| Layer | z-index | pointer-events | Notes |
|-------|---------|----------------|-------|
| Poster floor | 0 | none | Only paints when canvas is hidden |
| Liquid canvas | 10 | none | Decorative |
| App UI root | 30 | auto | Transparent; holds all interactive content |
| Modals / toasts | 50 | auto | Above app, still over the liquid |
| (none above 50) | — | — | Liquid is never on top |

> **Why a documented ladder:** glassmorphism *requires* the glass element's backdrop (the canvas) to be in the same stacking context ancestry path. If you isolate the canvas into its own stacking context via `will-change: opacity` or `transform` on an ancestor, `backdrop-filter` on cards above it can silently stop sampling the real backdrop. Keep the canvas in the root stacking context; don't wrap it in transformed/opacity-layered containers.

---

## Glassmorphism Composition: Live Canvas vs Static Poster

This is the highest-risk area of the architecture. **`backdrop-filter` over a live animated WebGL canvas is the worst-case input for the property** (confidence: MEDIUM, corroborated across sources).

### What actually happens per frame

When a glass card uses `backdrop-filter: blur(R)`, the compositor must:
1. Capture the pixels *behind* the card into an offscreen texture.
2. Run a Gaussian convolution (separable blur) over that texture — cost scales with blur radius `R`.
3. Composite the blurred result back under the card.

Over a **static** image, step 1 is cached. Over a **live animated canvas**, the backdrop changes every frame, so **there is no cache — all three steps run every frame**, for every glass card, for the full area of each card. The demo's `blur(26px)` is a large radius; combined with several cards and a 5-octave fbm shader, this is the single biggest GPU cost in the whole app.

### Recommendation: blur the *source*, not the backdrop

| Strategy | Cost | Visual | Verdict |
|----------|------|--------|---------|
| `backdrop-filter: blur(26px)` over live canvas (demo's approach) | Very high — full-res re-blur every frame | Authentic glass | Ship as the *premium* path only |
| `backdrop-filter: blur(12px)` + saturate, modest radius | ~4× less bandwidth than 26px | Slightly less frosted, still glassy | **Default** |
| Static poster + `backdrop-filter` | Low (cached backdrop) | Glass over a still image | Fallback path |
| No blur, just translucent tint | Negligible | Flat, not glass | Last-resort fallback |

**Concrete guidance:**
- Cap the default blur radius at **~12–16px**; reserve 26px for the login/hero screen where only one or two cards exist.
- **Never nest glass-over-glass.** Two stacked `backdrop-filter` cards compound cost and on iOS may downgrade to no effect after 2 layers.
- Keep `saturate(1.2)` — it's cheap relative to blur and sells the "liquid under glass" look.
- Provide a `@supports not (backdrop-filter: blur(1px))` fallback that swaps glass cards to a semi-opaque solid tint (the poster's job, mirrored).

---

## Performance Architecture

### The rAF loop (upgrade the demo's loop)

The demo loops unconditionally. In a real app the loop must be **gated and pausable**:

```js
// LiquidCanvas core loop (pseudocode)
let rafId = null;
let running = false;

function frame(now) {
  if (!running) return;
  updateUniforms(now);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  rafId = requestAnimationFrame(frame);
}

function start() { if (!running) { running = true; rafId = requestAnimationFrame(frame); } }
function stop()  { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
```

### Pause when tab hidden (confidence: HIGH — MDN)

`requestAnimationFrame` is auto-throttled in background tabs in most browsers, **but not reliably across all engines** — explicitly handle it:

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();          // freeze: cancel rAF, GPU goes idle
  else start();                          // resume: re-seed start time so motion doesn't jump
});
```

On resume, **offset the time uniform** so the animation continues smoothly rather than teleporting (the demo's `(now - start)` would jump by the full hidden duration). Track accumulated paused time:

```js
// on resume: start += (now - hiddenAt)  → u_time stays continuous
```

### `prefers-reduced-motion` (confidence: HIGH)

Honor it by **freezing the shader to a single static frame** and showing the poster:

```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  renderOneFrame(u_time = ANCHOR_TIME);  // draw once, then stop the loop
  showPoster();                           // optional: poster is equally valid
}
```

### Pixel-ratio clamping & resolution scaling (confidence: MEDIUM)

The demo already clamps DPR to 2 — good baseline. Layer a **quality scale factor** on top for adaptive downscaling:

```js
// effective drawing buffer = CSS size × min(dpr, 2) × qualityScale
const dpr = Math.min(devicePixelRatio || 1, 2);
const qualityScale = qualityGate.scale;  // 1.0 (high) → 0.5 (low)
canvas.width  = Math.floor(clientW * dpr * qualityScale);
canvas.height = Math.floor(clientH * dpr * qualityScale);
// CSS size stays 100% so the browser upscales the smaller buffer to fill the screen
```

Because the liquid is **smooth continuous color fields** (no hard edges), downscaling to 0.5× is nearly imperceptible — aliasing only bites at sharp edges, which this shader doesn't produce. This cuts fragment-shader invocations to **25%** at 0.5×. `u_resolution` must be set to the *actual drawing-buffer* size so the noise UV math stays correct.

### Adaptive quality (watch the frame budget)

A simple closed-loop governor prevents sustained jank:

```js
// every ~30 frames, measure frame time
if (avgFrameTime > 22ms && qualityScale > 0.5) qualityScale -= 0.25;  // drop a tier
if (avgFrameTime < 12ms && qualityScale < 1.0) qualityScale += 0.25;  // recover a tier
```

Tiers: `1.0 → 0.75 → 0.5`. Step down on sustained jank; step up only after stable good performance (hysteresis prevents oscillation).

### Resize handling

Use **`ResizeObserver`** on the canvas's parent (or `window` resize for a full-bleed fixed canvas), **debounced** (~150ms). Re-running the expensive fbm shader at every intermediate resize tick wastes GPU. The demo's `resize()` is correct but fires on every resize event — debounce it.

### GPU cost summary

| Concern | Cost driver | Mitigation |
|---------|-------------|------------|
| Shader itself | 5-octave fbm × double domain warp, full-screen | Resolution scaling (0.5–0.75×) |
| Glass blur over live canvas | `backdrop-filter` re-blur every frame | Cap blur ~12–16px; avoid nesting; blur fewer/smaller cards |
| Background-tab waste | rAF keeps running | Explicit `visibilitychange` → cancel rAF |
| High-DPI displays | DPR 3× = 9× the pixels of DPR 1× | Clamp DPR to 2; add quality scale |
| Resize storms | Re-allocating buffer + re-render each tick | Debounce resize |

---

## Theming: Theme Tokens → Shader Uniforms

### The problem with the demo

The demo **hardcodes the palette inside the shader source** (`cViolet`, `cBlue`, `cGreen`, `cCoral`, `cPink` as `vec3` literals). This is un-themeable — changing colors requires recompiling the shader. In a real app the palette must be **runtime-driven**.

### Recommended: uniforms, not shader recompilation

Promote every themeable value to a `uniform`. The shader stays compiled once; the app pushes new colors each frame (or on theme change only):

```glsl
// fragment shader — palette as uniforms
uniform vec3 u_color[5];   // violet, blue, green, coral, pink
uniform vec3 u_base;       // dark base (#0A0A0F)
uniform float u_intensity; // brightness multiplier
uniform float u_speed;     // time multiplier (0 = frozen)
uniform float u_warp;      // domain-warp strength
```

```js
// ThemeBridge: app theme tokens → uniform array
function themeToUniforms(theme) {
  return {
    u_color: [
      hexToVec3(theme.liquid.violet),   // #A78BFA → vec3(0.655, 0.545, 0.980)
      hexToVec3(theme.liquid.blue),
      hexToVec3(theme.brand.accent),    // #4ADE80 翠绿
      hexToVec3(theme.liquid.coral),
      hexToVec3(theme.liquid.pink),
    ],
    u_base:      hexToVec3(theme.bg.base),     // #0A0A0F
    u_intensity: theme.liquid.intensity ?? 0.9,
    u_speed:     reducedMotion ? 0 : (theme.liquid.speed ?? 0.05),
    u_warp:      theme.liquid.warp ?? 2.5,
  };
}
```

### Data flow: theme → uniforms

```
App Theme Store (tokens: colors, speed, intensity)
        │  (subscribe / on theme change)
        ▼
   ThemeBridge  ── themeToUniforms(tokens) ──►  uniform struct
        │                                            │
        │  (also feeds)                              │ each frame (or on change)
        ▼                                            ▼
   PosterLayer  ◄── same palette ─────────────  LiquidCanvas.gl.uniform*
   (generates matching static image)            (pushes u_color[], u_base, u_speed...)
```

**Key invariant:** the **same theme tokens feed both the live shader and the poster image**, so the two layers are visually identical and the fallback transition is invisible. This is why `ThemeBridge` is a separate component — it's the single source of truth for "what palette does the liquid use right now."

### Update frequency

- **Colors / base / warp:** update uniforms only when the theme *changes* (rare). Cheap — a few `gl.uniform3f` calls.
- **u_time / u_speed:** update every frame (this is the animation driver).
- Don't recompile the shader for theme changes — ever. Recompilation stalls the pipeline.

---

## Fallback / Poster Strategy

### Three tiers of degradation

| Tier | Trigger | What shows | Motion |
|------|---------|------------|--------|
| **T1 — Full WebGL** | WebGL supported, GPU healthy, motion allowed | Live animated liquid canvas | Full |
| **T2 — Frozen frame** | `prefers-reduced-motion` set, or GPU marginal | WebGL renders ONE static frame, loop stopped | None (static) |
| **T3 — Poster image** | WebGL unsupported (`getContext` null), or `save-data`, or low-power heuristic | Themed `.webp` background on the poster div | None |

### Poster generation

Capture a representative still from the shader at a chosen anchor time (`u_time = ANCHOR_TIME`) and export to **WebP, ≤80KB** (it's on the critical paint path). The poster is theme-colored via the same `ThemeBridge` palette, so:
- T1 → T3 transition is seamless (same colors).
- A theme switch in T3 re-tints by swapping poster assets (or, better, CSS-overlaid gradient layers).

### Capability detection (QualityGate)

```js
const gate = {
  webgl:        !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'),
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  saveData:     navigator.connection?.saveData ?? false,
  lowPower:     heuristicLowPower(),  // cores, memory, UA hints
};
// T3 if !webgl || saveData; T2 if reducedMotion; else T1
```

The poster `<div>` is **always in the DOM** at z:0 behind the canvas. In T1 the opaque canvas paints over it; in T3 the canvas is removed/hidden and the poster shows. This means no layout shift on fallback — the floor is always there.

---

## Data Flow

### Request / render flow

```
[User opens app]
       ↓
QualityGate ──► tier decision (T1/T2/T3)
       ↓
 if T3:  show PosterLayer, hide canvas             (no WebGL)
 if T2:  LiquidCanvas.renderOneFrame(ANCHOR_TIME)  (static)
 if T1:  LiquidCanvas.start()  ──► rAF loop         (animated)
       ↓
 each frame:
   ThemeBridge.themeToUniforms(theme) ──► gl.uniform* (colors/base on change; time every frame)
   gl.drawArrays(full-screen triangle)
       ↓
 [tab hidden] ── visibilitychange ──► stop() (cancel rAF)
 [tab visible] ── visibilitychange ──► start() (re-seed time, resume)
 [theme change] ──► ThemeBridge recomputes ──► push new color uniforms (no recompile)
 [resize] ──► debounced ──► reallocate drawing buffer, set u_resolution
```

### State ownership

```
┌─ ThemeStore ──────────┐   subscribe   ┌─ ThemeBridge ─┐   uniforms   ┌─ LiquidCanvas ─┐
│  colors, speed, ...   │ ────────────► │  tokens→vec   │ ───────────► │  GL context     │
└───────────────────────┘               └───────────────┘              └─────────────────┘
                                              │  also feeds                    ▲
                                              ▼                                │ frame timing
                                       ┌─ PosterLayer ─┐                  ┌─ QualityGate ─┐
                                       │  themed image  │ ◄── tier ────── │  webgl/reduce/ │
                                       └────────────────┘                  │  saveData/power│
                                                                           └────────────────┘
```

**Direction is strictly one-way:** Theme → ThemeBridge → (LiquidCanvas uniforms + PosterLayer). LiquidCanvas never reads theme directly; PosterLayer never reads GL state. QualityGate is the only thing that decides *whether* the canvas runs.

---

## Suggested Build Order

Dependencies are strict — each step unlocks the next.

```
1. PosterLayer (z:0 floor)           ← no deps; guarantees a non-black floor from day one
        ↓ (gives a visual baseline to develop against)
2. LiquidCanvas core (port demo)     ← fixed canvas, shader, rAF, DPR clamp = 2
        ↓ (proves the visual on the real app shell)
3. Stacking + pointer-events contract← canvas z:10 pointer-events:none, app z:30 transparent
        ↓ (UI becomes clickable over the liquid)
4. QualityGate (capability detect)   ← webgl/reduced-motion/saveData → T1/T2/T3
        ↓ (decides if loop runs at all; wires poster fallback)
5. Visibility + reduced-motion pause ← visibilitychange cancel/restart; freeze on reduce
        ↓ (background-tab & a11y correctness)
6. ThemeBridge (tokens → uniforms)   ← promote hardcoded palette to uniforms
        ↓ (palette becomes runtime-themeable; no recompile)
7. Resolution scaling + adaptive Q   ← quality scale factor, frame-budget governor
        ↓ (perf on low-end GPUs)
8. Glass blur tuning                 ← cap backdrop-filter radius, anti-nesting rules
        ↓ (compositing perf over live canvas)
9. Poster asset pipeline             ← auto-generate themed WebP from shader anchor frame
        (T1↔T3 seamlessness)
```

**Why this order:**
- **Poster first** means you always have *something* on screen — every later step can fail without a black void.
- **Stacking contract before theming** because `backdrop-filter` correctness depends on stacking-context hygiene; get that right before you tune visuals.
- **ThemeBridge before resolution scaling** because theming is a correctness/feature concern (low risk, high value), while adaptive quality is a perf-polish concern that needs a working themed canvas to measure against.
- **Glass blur tuning late** because it's the most expensive, hardest-to-measure layer and depends on a stable canvas underneath.

---

## Anti-Patterns

### Anti-Pattern 1: Hardcoding the palette in shader source
**What people do:** leave `vec3 cGreen = vec3(0.290, 0.871, 0.502);` as a literal (the demo's current state).
**Why it's wrong:** un-themeable; every palette tweak recompiles the shader (pipeline stall) and requires a code deploy.
**Do this instead:** promote to `uniform vec3 u_color[N]`; set via `gl.uniform3fv` from `ThemeBridge`.

### Anti-Pattern 2: Nesting glass cards over glass cards
**What people do:** a frosted modal over a frosted dashboard card, both with `backdrop-filter`.
**Why it's wrong:** compound blur cost every frame; iOS downgrades to no effect after ~2 layers; the inner card blurs an already-blurred layer (visual mud).
**Do this instead:** only the *topmost* glass layer uses `backdrop-filter`; modals over glass use a solid translucent tint.

### Anti-Pattern 3: Wrapping the canvas in a transformed/opacity ancestor
**What people do:** put `will-change: opacity` or `transform` on a container around the canvas for "perf."
**Why it's wrong:** isolates the canvas into its own stacking context; `backdrop-filter` on cards above can no longer sample the real backdrop — glass silently breaks.
**Do this instead:** keep the canvas in the root stacking context; apply any transform to the canvas *element itself* (it's `position:fixed` anyway).

### Anti-Pattern 4: Letting rAF run in background tabs
**What people do:** trust the browser to auto-throttle (the demo does this).
**Why it's wrong:** not reliable across all engines; even throttled, it keeps the GPU context alive and burns battery.
**Do this instead:** explicit `visibilitychange` → `cancelAnimationFrame` / restart, with time-offset on resume.

### Anti-Pattern 5: Full DPR on retina without quality scaling
**What people do:** `canvas.width = clientW * devicePixelRatio` with DPR 3.
**Why it's wrong:** 9× the fragment invocations of DPR 1, for a smooth gradient where the extra pixels are invisible.
**Do this instead:** clamp DPR to 2, then multiply by an adaptive `qualityScale` (0.5–1.0).

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| ThemeStore ↔ ThemeBridge | subscribe (one-way) | Bridge is pure; no back-pressure |
| ThemeBridge ↔ LiquidCanvas | `gl.uniform*` calls | Colors on change; time every frame |
| ThemeBridge ↔ PosterLayer | shared palette struct | Keeps T1↔T3 visually identical |
| QualityGate ↔ LiquidCanvas | start/stop/renderOnce | Gate owns the run/don't-run decision |
| QualityGate ↔ PosterLayer | show/hide | T3 shows poster, hides canvas |
| App UI ↔ (liquid) | **none — indirect via backdrop-filter** | UI never imports the canvas; composition is visual only |

### External Services

None. The liquid layer is fully client-side and self-contained (the demo proves zero-dependency operation). The only "external" input is the app's theme token store.

---

## Scaling Considerations

| Scale (viewport / device) | Architecture adjustment |
|---------------------------|-------------------------|
| Desktop, dedicated GPU | T1, qualityScale 1.0, DPR clamp 2, full blur — the demo's experience |
| Laptop integrated GPU | T1, qualityScale 0.75, blur ~12px, adaptive governor active |
| Tablet / low-end mobile | T1 or T2, qualityScale 0.5, blur ≤10px, fewer/smaller glass cards |
| Unsupported / save-data / extreme low-power | T3 poster only — no WebGL context created |

### First bottleneck
**Glass blur over the live canvas** — this hits before the shader itself does, because blur runs at full CSS resolution while the shader can be downscaled. Cap blur radius and card count *first*; only then tune the shader's resolution scale.

---

## Sources

- MDN, `Window.requestAnimationFrame()` — auto-pause in background tabs (confidence: HIGH) — https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Page Visibility API usage for pausing rAF / cancelAnimationFrame pairing (confidence: HIGH, multiple corroborating sources) — https://blog.jikun.dev/basic/js/webapi-page-visibility.html
- `backdrop-filter` rendering-pipeline cost: offscreen texture capture + Gaussian convolution per frame; radius scaling; compositing-layer isolation breaking backdrop sampling (confidence: MEDIUM, corroborated) — https://tsight.io/articles/10588405 , https://tsight.io/articles/11190168 , https://avinspire.in/blog/css-glassmorphism-backdrop-filters
- Downsampling-before-blur mitigation (~16× less work, imperceptible on dynamic backgrounds) (confidence: MEDIUM) — https://tsight.io/articles/10588405
- Dynamic resolution rendering (offscreen framebuffer at fractional scale, upscale via full-screen quad) (confidence: MEDIUM) — https://www.intel.com/content/dam/develop/external/us/en/documents/dynamic-resolution-rendering-on-opengl-es-2.pdf
- WebGL2 Shadertoy lesson — `u_resolution` uniform for correct UV math across canvas sizes (confidence: HIGH) — https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-shadertoy.html
- Framer Shader 3D Background — production pattern: DPR scaling, viewport-based pause, ResizeObserver, context cleanup (confidence: MEDIUM) — https://www.framer.com/marketplace/components/shader-3d-background/
- Project source: `liquid-demo.html` (working reference implementation) & `.planning/PROJECT.md` (requirements/constraints)

---
*Architecture research for: WebGL liquid-gradient background under glassmorphism UI*
*Researched: 2026-07-30*
