# Phase 2: Production WebGL Liquid Component - Research

**Researched:** 2026-07-30
**Domain:** WebGL2 fragment-shader liquid background → reusable, theme-token-driven, integrable component
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VISUAL-02 | 将 WebGL 液态移植为生产组件（Three.js/R3F 或保留原生 WebGL），配色/速度/扭曲提升为 uniform，由主题 token 驱动 | Stack decision (§Standard Stack), shader-port mechanics (§Architecture Patterns §1), uniform architecture (§2), stacking-context contract (§4), component API (§5). All four success criteria mapped below. |

**Success-criteria → research mapping:**
1. `<LiquidBackground/>` reusable component, fixed full-screen canvas, z:10, pointer-events:none → §Standard Stack (decision), §Architecture Patterns §4–§5
2. u_color[5]/u_base/intensity/speed/warp as uniforms, theme-token-driven, no hardcoded vec3 in hot path → §Architecture Patterns §2–§3
3. canvas in root stacking context, no transform/opacity/will-change ancestors, backdrop-filter safe → §Architecture Patterns §4
4. healthy-GPU rendering of flow+morph liquid, no console errors → §Common Pitfalls, §Validation Architecture
</phase_requirements>

## Summary

Phase 2 turns the standalone `liquid-demo.html` (a 236-line zero-dependency WebGL1 page) into a production-ready, reusable component whose palette/intensity/speed/warp are runtime uniforms driven by theme tokens. The domain-warped fbm shader (Ashima 3D simplex noise, 5-octave fbm, 2-pass domain warping, 5-color palette) is the **source of truth and is ported verbatim** — only the five `vec3` color literals, the dark base, and the intensity/speed/warp magic numbers are promoted to uniforms.

**Stack decision (the #1 call for this phase):** The workspace is a **pure design folder** — no `package.json`, no React, no Vite; only reference images, an Ardot design, and `liquid-demo.html`. The research-locked default (React 19 + Three.js 0.185 + R3F v9 + drei) was predicated on an existing React app, which does not exist. Because the shader is a single full-screen triangle + fragment shader (no scene graph, no materials, no post-processing needed in Phase 2), Three.js/R3F add ~180 KB and abstraction overhead for **zero functional benefit** at this scope. Therefore: **build a framework-agnostic vanilla-WebGL2 engine (`LiquidCanvas` class + `.glsl` files + `ThemeBridge` function) with a thin `<LiquidBackground/>` wrapper**, using Vite 8 + vite-plugin-glsl 1.6.1 only for dev-server DX and shader-file imports. This is the most faithful verbatim port (vanilla→vanilla), adds zero rendering-library weight, defers the full-app-stack commitment until the app shell is actually built (later phases), and is the lowest-risk MVP path. The React+Three.js+R3F stack remains the documented migration path (§Standard Stack §Alternatives) for when a full React app is scaffolded.

**Primary recommendation:** Vanilla-WebGL2 engine class + uniform-driven shader port + thin framework wrapper; WebGL2-first context (mandates `highp`, eliminating most precision black-screens); canvas as a fixed direct child of `<body>` with a documented no-transform/opacity/will-change-ancestor contract so `backdrop-filter` on future glass panels never silently breaks.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Liquid shader rendering (fbm, domain warp, color mix) | Browser / GPU (WebGL2 fragment shader) | — | Pure client-side pixel computation; no server, no layout participation. |
| Uniform updates (palette/intensity/speed/warp → GL uniforms) | Browser / Client (JS) | — | `gl.uniform*` calls from a `ThemeBridge` pure function; theme change only, never per-frame except u_time. |
| Canvas placement & stacking context | Browser / Client (CSS/DOM) | — | `position:fixed; inset:0; z-index:10; pointer-events:none` as a direct child of `<body>` — a DOM/CSS contract, not a render concern. |
| Theme-token resolution | Browser / Client (JS) | API / Backend (future) | Tokens currently live as a JS `LiquidTheme` object; will bind to CSS custom properties / a token system when the app shell exists. |
| Lifecycle (resize, rAF, cleanup, context-loss) | Browser / Client (JS engine class) | — | Owned entirely by `LiquidCanvas`; the wrapper just mounts/disposes. |

## Standard Stack

### Stack Decision: Framework-Agnostic Vanilla-WebGL2 Engine + Thin Wrapper

**Decision:** Build the liquid background as a **framework-agnostic vanilla-WebGL2 engine** — a reusable `LiquidCanvas` class, separate `.glsl` shader files, and a pure `ThemeBridge` function — wrapped by a thin `<LiquidBackground/>` component (React and/or vanilla `mount()` helper). Use **Vite 8 + vite-plugin-glsl 1.6.1** only as the dev server / build tool so `.frag`/`.vert` files import as strings with `#include` support.

**Rationale (why NOT scaffold React+Three.js+R3F here):**
1. **No app exists.** The workspace has no `package.json`, no React, no Vite — it is a design folder (reference images + Ardot + `liquid-demo.html`). Scaffolding a full React+Three.js app *just to host a background canvas* is premature; the app shell (glassmorphism panels, nav, screens) is later-phase work.
2. **The shader is one full-screen triangle.** Three.js/R3F's value props — scene graph, materials system, post-processing pipeline, WebGPU migration — provide **zero functional benefit** for a fullscreen fragment shader with no geometry, no textures, no passes. The research's own reasoning applies: "OGL is the better technical fit for a single fullscreen shader (5 KB vs 150 KB)" and "the stack decision is about the *wrapper* around that shader, not the shader." `[VERIFIED: .planning/research/STACK.md]`
3. **Most faithful verbatim port.** `liquid-demo.html` IS vanilla WebGL. Porting vanilla→vanilla is the closest possible "原样移植." Migrating to Three.js's `RawShaderMaterial` would add a framework abstraction layer between the demo and the production code, increasing divergence risk for an MVP.
4. **Lowest risk for MVP.** No 180 KB dependency to version-pin, no React-19/R3F-v9 peer-compat surface, no reconciler lifecycle to reason about. The engine is ~150 lines of well-trodden WebGL boilerplate (context, compile, link, buffer, uniform, draw, resize, cleanup).
5. **Defers commitment.** The wrapper is ~30 lines either way. When a real React app is scaffolded (later phases), the engine drops in unchanged; if the team then prefers R3F ecosystem consistency, migrating the *wrapper* to R3F is trivial (the shader file and ThemeBridge stay identical).

**What the wrapper provides (satisfies success-criteria #1's `<LiquidBackground/>`):** A React component that creates a `<canvas>`, instantiates `LiquidCanvas`, wires `theme` prop → `setTheme()`, and disposes on unmount. A vanilla `mountLiquidBackground(container, theme)` helper is provided for non-React contexts. The component name `<LiquidBackground/>` is honored; "component" does not mandate React internally.

### Core

| Library / Tool | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Vanilla WebGL2** (browser API) | n/a (built-in) | Rendering context for the fullscreen fragment shader | The demo proves vanilla WebGL works. WebGL2 mandates `highp` support in fragment shaders (eliminates the precision black-screen class). Zero bundle weight. `[VERIFIED: webglfundamentals — WebGL2 mandates fragment highp]` |
| **Vite** | 8.2.0 | Dev server + build tool | Standard 2026 bundler; fast HMR for shader iteration; required host for vite-plugin-glsl. `[VERIFIED: npm registry — vite@8.2.0, 142M/wk]` |
| **vite-plugin-glsl** | 1.6.1 | Import `.frag`/`.vert` as strings; `#include` chunk support | Eliminates inline template-literal shaders; gives syntax highlighting + minification. Canonical GLSL plugin for Vite. `[VERIFIED: npm registry — vite-plugin-glsl@1.6.1, repo github.com/UstymUkhman/vite-plugin-glsl]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **TypeScript** | 5.x (via Vite) | Type the `LiquidCanvas` class, `LiquidTheme`, uniform structs | Always — the engine + ThemeBridge benefit from types. Vite's `@vitejs/plugin-react` / `vite-tsconfig-paths` handle this. |
| **three** | 0.185.1 | (Migration path only) If the team later chooses R3F for the app | Defer — not used in Phase 2. Documented in §Alternatives. `[VERIFIED: npm — three@0.185.1]` |
| **@react-three/fiber** | 9.6.1 | (Migration path only) R3F wrapper | Defer. `[VERIFIED: npm — @react-three/fiber@9.6.1, verdict OK]` |
| **@react-three/drei** | 10.7.7 | (Migration path only) `shaderMaterial` factory, `useDetectGPU` | Defer. `[VERIFIED: npm — @react-three/drei@10.7.7, verdict OK]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla WebGL2 engine (recommended) | React 19 + Three.js 0.185 + R3F v9 + drei v10 | Adds ~180 KB + React/R3F peer-compat surface for zero functional gain on a fullscreen-triangle shader. Correct choice **only when a React app already exists** — it does not. Use as the migration path when the app shell is built. |
| Vanilla WebGL2 engine | OGL 1.0.11 (5 KB thin wrapper) | OGL saves ~80 lines of boilerplate (Renderer/Program/Mesh/Geometry) but adds a dependency for a fullscreen-triangle case that's already trivial in raw WebGL2. Acceptable if the team wants a maintained abstraction; the shader + ThemeBridge stay identical. |
| Separate `.glsl` files via vite-plugin-glsl | Inline template-literal strings (demo's approach) | No syntax highlighting, no `#include`, no minification. Fine for a 236-line demo; does not scale. Use `.glsl` files. |
| WebGL2 context + GLSL ES 1.00 (recommended) | WebGL2 + GLSL ES 3.00 (`#version 300 es`) | ES 3.00 requires `in`/`out`/`out vec4 fragColor` rewrites — diverges from "verbatim port." ES 1.00 shaders run unchanged on a WebGL2 context (backward-compatible) and still get mandated `highp`. Prefer ES 1.00 for faithfulness; migrate to ES 3.00 only if ES 3.00-only features are needed (none in Phase 2). |

**Installation:**
```bash
npm create vite@latest . -- --template vanilla-ts   # scaffold in the design folder
npm install -D vite-plugin-glsl@1.6.1
# No runtime rendering dependency — vanilla WebGL2 is a browser API.
```

```js
// vite.config.ts
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
});
```

**Version verification (run this session):**
```text
vite-plugin-glsl  1.6.1  (published 2026-07-25, 112K/wk, repo UstymUkhman/vite-plugin-glsl)  [VERIFIED: npm registry]
vite              8.2.0  (published 2026-07-30, 142M/wk, repo vitejs/vite)                   [VERIFIED: npm registry]
three             0.185.1 (migration path only)                                            [VERIFIED: npm registry]
@react-three/fiber 9.6.1  (verdict OK)                                                     [VERIFIED: npm registry]
@react-three/drei  10.7.7 (verdict OK)                                                     [VERIFIED: npm registry]
node              v22.22.2  (local)                                                         [VERIFIED: local]
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| vite-plugin-glsl | npm | multi-year (latest patch 5 days old) | 112K/wk | github.com/UstymUkhman/vite-plugin-glsl | SUS (`too-new` on latest publish) | Approved — SUS is a false-positive (recent patch, not package age); well-established canonical plugin. Planner may add `checkpoint:human-verify` before install per protocol. |
| vite | npm | multi-year (8.2.0 published today) | 142M/wk | github.com/vitejs/vite | SUS (`too-new`) | Approved — false-positive on the most ubiquitous bundler in the JS ecosystem. |
| three | npm | multi-year (0.185.1 published 2026-07-01) | 12.5M/wk | github.com/mrdoob/three.js | SUS (`too-new`) | Approved — false-positive; three.js is THE canonical WebGL library. (Migration path only — not installed in Phase 2.) |
| @react-three/fiber | npm | 9.6.1 (2026-04-28) | 4.6M/wk | github.com/pmndrs/react-three-fiber | OK | Approved (migration path only) |
| @react-three/drei | npm | 10.7.7 (2025-11-13) | 4.1M/wk | github.com/pmndrs/drei | OK | Approved (migration path only) |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged suspicious [SUS]:** `vite-plugin-glsl`, `vite`, `three` — all flagged solely because their *latest* publish is recent ("too-new" signal). All three are long-established, high-download, real-repo packages with **no postinstall scripts** (`npm view <pkg> scripts.postinstall` → empty for all). The SUS flag is a false-positive of the recency heuristic. `vite-plugin-glsl` is the only one installed in Phase 2; the planner may insert a `checkpoint:human-verify` before `npm install` per protocol, but no genuine risk is present.

**No postinstall scripts on any package** — verified via `npm view <pkg> scripts.postinstall` (all empty). No supply-chain execution risk at install time.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── liquid/
│   ├── liquid.frag          # PORTED shader (verbatim algorithm; palette→uniforms)
│   ├── fullscr.vert         # fullscreen-triangle vertex (verbatim from demo)
│   ├── LiquidCanvas.ts      # engine class: context, compile, link, uniforms, rAF, resize, dispose
│   ├── themeBridge.ts       # pure fn: LiquidTheme → uniform struct; hexToVec3
│   ├── types.ts             # LiquidTheme, LiquidUniforms, LiquidCanvasOptions interfaces
│   ├── LiquidBackground.tsx # thin React wrapper (optional, satisfies <LiquidBackground/>)
│   ├── mount.ts             # vanilla mountLiquidBackground() helper (optional)
│   ├── defaultTheme.ts      # default theme reproducing the demo's exact values
│   └── index.ts             # public API barrel
├── main.ts                  # dev entry: mounts <LiquidBackground/> or vanilla mount for visual QA
└── index.html               # dev page (replaces liquid-demo.html as the live reference)
```

### Pattern 1: Shader Port — Verbatim Algorithm, Uniforms Promoted
**What:** Move the GLSL from `liquid-demo.html` into `src/liquid/liquid.frag` via `vite-plugin-glsl`. The `snoise`, `fbm`, domain-warp, and color-mix logic stay **byte-for-byte identical** to the demo. Only five categories of literal change: the 5 palette `vec3` literals → `uniform vec3 u_color[5]`; the base `vec3` → `uniform vec3 u_base`; intensity `0.9` → `uniform float u_intensity`; speed `0.05` → `uniform float u_speed`; warp coefficients `2.0`/`2.5` → `uniform float u_warp`.

**When to use:** Always — this IS Phase 2.

**File structure decision:** Separate `.frag`/`.vert` files imported via `vite-plugin-glsl` (NOT inline template strings). Rationale: syntax highlighting, `#include` for the shared `snoise`/`fbm` chunk if desired, minification, and the shader becomes a reviewable artifact. `[VERIFIED: .planning/research/STACK.md — "Eliminates template-literal shader strings"]`

**WebGL version:** Request `canvas.getContext('webgl2')` first, fall back to `getContext('webgl')` / `experimental-webgl`. Keep the shader as **GLSL ES 1.00** (no `#version` directive) — WebGL2 is backward-compatible with ES 1.00 shaders, so the demo's `attribute`/`gl_FragColor`/`precision highp float` source runs unchanged while gaining WebGL2's mandated `highp` support. `[VERIFIED: WebGL2 spec mandates GL_FRAGMENT_SHADER_HIGH_FLOAT; webglfundamentals]`

**Ported fragment shader (uniforms promoted, algorithm verbatim):**
```glsl
// src/liquid/liquid.frag  — ported verbatim from liquid-demo.html; only palette/params → uniforms
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_color[5];    // [violet, blue, green, coral, pink] — was hardcoded vec3 literals
uniform vec3  u_base;        // dark base #0A0A0F — was vec3(0.039,0.039,0.059)
uniform float u_intensity;   // was literal 0.9
uniform float u_speed;       // was literal 0.05 (u_time multiplier)
uniform float u_warp;        // was 2.0 (q feedback) / 2.5 (r feedback)

/* --- 3D Simplex noise (Ashima / Ian McEwan, MIT) — VERBATIM from demo --- */
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v){ /* ...identical to demo lines 91-129... */ }

float fbm(vec3 p){
  float f = 0.0; float amp = 0.5;
  for(int i=0;i<5;i++){ f += amp*snoise(p); p *= 2.0; amp *= 0.5; }
  return f;
}

void main(){
  vec2 uv = (gl_FragCoord.xy*2.0 - u_res) / min(u_res.x, u_res.y);
  float t = u_time * u_speed;                       // was: u_time * 0.05

  vec3 p = vec3(uv*1.35, t);
  vec3 q = vec3(fbm(p), fbm(p + vec3(5.2,1.3,2.8)), fbm(p + vec3(8.3,2.8,1.1)));
  vec3 r = vec3(
    fbm(p + u_warp*q + vec3(1.7,9.2,0.5) + 0.15*t), // was: 2.0*q
    fbm(p + u_warp*q + vec3(8.3,2.8,0.8) + 0.12*t),
    fbm(p + u_warp*q + vec3(4.1,6.0,0.3) + 0.10*t)
  );
  float f = fbm(p + (u_warp*1.25)*r);               // was: 2.5*r  (2.5 = 2.0*1.25)

  vec3 col = mix(u_color[0], u_color[1], smoothstep(0.0, 1.0, q.x*0.5+0.5));
  col = mix(col, u_color[2], smoothstep(0.10, 0.90, r.y*0.5+0.5));
  col = mix(col, u_color[3], smoothstep(0.20, 0.95, r.z*0.5+0.5));
  col = mix(col, u_color[4], smoothstep(0.30, 1.00, q.z*0.5+0.5) * 0.6);

  float inten = smoothstep(-0.25, 0.95, f);
  vec3 outc = u_base + col * inten * u_intensity;   // was: base + col*inten*0.9
  float vig = 1.0 - 0.32 * dot(uv*0.5, uv*0.5);
  outc *= vig;
  gl_FragColor = vec4(outc, 1.0);
}
```
> The `0.6` pink mix-weight, `0.32` vignette, `1.35` uv-scale, and noise offsets (`5.2,1.3,2.8`…) are **algorithm constants**, not themeable palette — they stay literal. Success-criterion #2 forbids only hardcoded **`vec3`** literals in the hot path; these floats are compliant.

### Pattern 2: Uniform Architecture & ThemeBridge
**What:** A pure function `themeToUniforms(theme)` is the **only** code that knows both the theme-token world and the GL-uniform world. It produces a flat uniform struct; `LiquidCanvas` pushes it via `gl.uniform*`. Colors update on theme change only; `u_time` updates every frame.

**Exact uniform interface:**
| Uniform | GLSL type | JS representation | Default (reproduces demo) | Update freq |
|---------|-----------|-------------------|---------------------------|-------------|
| `u_color[5]` | `uniform vec3 u_color[5]` | `Float32Array(15)` (5×rgb) | violet `#A78BFA`, blue `#60A5FA`, green `#4ADE80`, coral `#FB7185`, pink `#F472B6` | theme change |
| `u_base` | `uniform vec3 u_base` | `[r,g,b]` | `#0A0A0F` → `[0.039,0.039,0.059]` | theme change |
| `u_intensity` | `uniform float` | `number` | `0.9` | theme change |
| `u_speed` | `uniform float` | `number` | `0.05` | theme change (reduced-motion → `0`) |
| `u_warp` | `uniform float` | `number` | `2.0` (q=2.0, r=2.5=2.0×1.25) | theme change |
| `u_time` | `uniform float` | `number` | `(now-start)/1000` | every frame |
| `u_res` | `uniform vec2 u_res` | `[w,h]` | drawing-buffer size | resize |

**Theme-token → uniform mapping (for when the token system exists):**
| Theme token (CSS var) | Uniform | Value |
|----------------------|---------|-------|
| `--liquid-violet` | `u_color[0]` | `#A78BFA` |
| `--liquid-blue` | `u_color[1]` | `#60A5FA` |
| `--accent` (翠绿) | `u_color[2]` | `#4ADE80` |
| `--liquid-coral` | `u_color[3]` | `#FB7185` |
| `--liquid-pink` | `u_color[4]` | `#F472B6` |
| `--bg-base` | `u_base` | `#0A0A0F` |
| `--liquid-intensity` | `u_intensity` | `0.9` |
| `--liquid-speed` | `u_speed` | `0.05` |
| `--liquid-warp` | `u_warp` | `2.0` |

> The design-token system (Phase 1 deliverable per SUMMARY.md) does not yet exist in code (Phase 1 was a design backfill). For Phase 2 MVP, `defaultTheme.ts` hardcodes these exact values as the default `LiquidTheme`; the component accepts a `theme` prop so it is token-driven **by construction**. Binding to CSS custom properties / a token store is a later wiring step — the `LiquidTheme` interface is the stable contract. `[ASSUMED]`

**ThemeBridge implementation:**
```ts
// src/liquid/themeBridge.ts
export interface LiquidTheme {
  colors: [string, string, string, string, string]; // 5 hex strings
  base: string;        // hex
  intensity: number;   // 0..1
  speed: number;       // time multiplier
  warp: number;        // domain-warp strength
}
export interface LiquidUniforms {
  u_color: Float32Array;  // length 15
  u_base: [number, number, number];
  u_intensity: number;
  u_speed: number;
  u_warp: number;
}

export function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function themeToUniforms(theme: LiquidTheme): LiquidUniforms {
  return {
    u_color: new Float32Array(theme.colors.flatMap(hexToVec3)),
    u_base: hexToVec3(theme.base),
    u_intensity: theme.intensity,
    u_speed: theme.speed,
    u_warp: theme.warp,
  };
}
```
> `hexToVec3` runs on theme **change only** (not per frame) — so the hot path (the rAF loop) contains zero `vec3` literals and zero hex parsing. `[VERIFIED: .planning/research/ARCHITECTURE.md — "Colors/base/warp: update uniforms only when theme changes; u_time/u_speed every frame; never recompile on theme change"]`

### Pattern 3: Precision Branching (WebGL2-first)
**What:** Eliminate the `precision highp float` black-screen risk (Pitfall 4) by preferring WebGL2, which **mandates** `GL_FRAGMENT_SHADER_HIGH_FLOAT`. The demo's `precision highp float` declaration then always succeeds on WebGL2. For the rare WebGL1-only fallback, attempt highp link; on failure, recompile the fragment with `precision mediump float` and relink.

**Detection approach (Phase 2 baseline):**
```ts
// 1. Context: prefer WebGL2 (mandates highp), fall back to WebGL1
const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' })
        || canvas.getContext('webgl', { antialias: false, alpha: false })
        || canvas.getContext('experimental-webgl');

// 2. Precision: compile with highp (the demo's declaration). On WebGL2 this always links.
//    On WebGL1, if LINK_STATUS === false, recompile fragment with 'precision mediump float'.
function linkWithPrecision(gl, vertSrc, fragHighp, fragMediump) {
  const prog = tryLink(gl, vertSrc, fragHighp);
  if (prog || gl instanceof WebGL2RenderingContext) return prog; // WebGL2 mandates highp
  console.warn('[LiquidCanvas] highp link failed on WebGL1 — retrying mediump');
  return tryLink(gl, vertSrc, fragMediump);
}
```
> Full `getShaderPrecisionFormat` pre-check + a *cheaper* mediump shader variant (octave reduction to avoid 16-bit banding) is **Phase 4** scope (VISUAL-04 explicitly owns "shader 精度安全处理"). Phase 2 implements the WebGL2-first baseline + the highp→mediump declaration fallback, which already prevents black-screens on the vast majority of devices. `[CITED: webglfundamentals — highp optional in WebGL1 frag shaders, Safari getShaderPrecisionFormat quirk; WebGL2 mandates highp]`

### Pattern 4: Stacking-Context Contract (success-criterion #3)
**What:** The canvas must sit in the **root stacking context** so that `backdrop-filter` on future glass panels (z:30+) can sample it. Any ancestor that creates a new stacking context silently breaks glass sampling.

**Canvas CSS (non-negotiable):**
```css
.liquid-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  display: block;
  /* NO transform, opacity, will-change, filter, backdrop-filter, mask, clip-path,
     perspective, contain, isolation, mix-blend-mode on THIS element or any ancestor. */
}
```

**Properties that create a stacking context and MUST be absent on all ancestors of the canvas:**
`transform` ≠ none · `opacity` < 1 · `will-change` (transform/opacity/filter/…) · `filter` ≠ none · `backdrop-filter` ≠ none · `mask`/`mask-image`/`clip-path`/`clip` · `perspective` ≠ none · `contain` (paint/layout/strict/content) · `isolation: isolate` · `mix-blend-mode` ≠ normal.

**Integration rule:** `<LiquidBackground/>` (or `mountLiquidBackground()`) MUST mount the canvas as a **direct child of `<body>`** (or a root container whose own ancestors have none of the above properties). Never nest the canvas inside a transformed/animated/faded container "for perf." `[VERIFIED: .planning/research/ARCHITECTURE.md Anti-Pattern 3 — "wrapping the canvas in a transformed/opacity ancestor isolates it into its own stacking context; backdrop-filter silently breaks"]`

**Dev-mode guard (recommended):** On mount, walk `canvas.parentNode` chain and `console.warn` if any ancestor's computed style has a context-creating property. Cheap, catches the silent-break footgun early.

**z-index ladder (contract):** poster `z:0` · canvas `z:10` · app UI `z:30+` · modals/toasts `z:50`. The liquid is never on top. `[VERIFIED: .planning/research/ARCHITECTURE.md]`

### Pattern 5: Component API
**`LiquidCanvas` engine class (framework-agnostic core):**
```ts
interface LiquidCanvasOptions {
  canvas: HTMLCanvasElement;
  theme: LiquidTheme;
  dprCap?: number;          // default 2 (preserves demo's clamp)
  onError?: (e: Error) => void;  // compile/link fail or context-loss → caller shows poster (T3)
}
class LiquidCanvas {
  constructor(opts: LiquidCanvasOptions);
  start(): void;            // begin rAF loop
  stop(): void;             // cancel rAF (does not destroy context)
  renderOnce(time?: number): void;  // single static frame (for reduced-motion T2)
  setTheme(theme: LiquidTheme): void;  // push new uniforms — NO recompile
  resize(): void;
  dispose(): void;          // delete GL resources, remove listeners, lose context
}
```

**`<LiquidBackground/>` React wrapper (satisfies success-criterion #1):**
```tsx
interface LiquidBackgroundProps {
  theme?: LiquidTheme;      // defaults to defaultTheme (reproduces the demo)
  className?: string;       // appended to .liquid-canvas
  dprCap?: number;          // default 2
  onError?: () => void;     // → parent renders poster fallback
}
// Renders <canvas class="liquid-canvas ..."> as a fixed child.
// MUST be mounted as a direct child of <body> / app root — see stacking-context contract.
```

**Vanilla helper (non-React contexts):**
```ts
function mountLiquidBackground(
  container: HTMLElement,   // should be document.body
  theme?: LiquidTheme,
  opts?: { dprCap?: number; onError?: () => void }
): { unmount(): void };
```

### Anti-Patterns to Avoid
- **Hardcoding palette in shader source** (the demo's current state): un-themeable; every palette tweak recompiles + requires a deploy. Promote to uniforms. `[VERIFIED: ARCHITECTURE.md Anti-Pattern 1]`
- **Wrapping the canvas in a transformed/opacity/will-change ancestor**: silently breaks `backdrop-filter` on glass panels above. Keep canvas in root stacking context. `[VERIFIED: ARCHITECTURE.md Anti-Pattern 3]`
- **Recompiling the shader on theme change**: stalls the pipeline. Uniforms update without recompilation. `[VERIFIED: ARCHITECTURE.md]`
- **Full DPR without clamp on retina**: DPR 3 = 9× fragment invocations for a smooth gradient where extra pixels are invisible. Clamp to 2 (the demo already does this — preserve it). `[VERIFIED: ARCHITECTURE.md Anti-Pattern 5]`
- **Letting rAF run in background tabs / ignoring reduced-motion**: these are Phase 3/4 scope (VISUAL-03/04), but Phase 2 must NOT ship an ungated loop as the *final* state — structure the loop as start/stop from day one so Phase 3 can gate it. `[VERIFIED: SUMMARY.md Pitfalls 2,3]`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shader file imports | Inline template-literal GLSL strings | `vite-plugin-glsl` `.frag`/`.vert` imports | No syntax highlighting, no `#include`, no minification; doesn't scale. |
| Simplex noise / fbm | Rewrite or "optimize" the noise | Port Ashima `snoise` + `fbm` verbatim from the demo | Battle-tested MIT noise; the demo IS the source of truth. Rewriting risks visual regression. |
| Hex→vec3 conversion | Manual string slicing in the hot path | `hexToVec3()` in ThemeBridge, called on theme change only | Keeps the per-frame loop free of parsing/literals. |
| DPR clamping | `canvas.width = clientW * devicePixelRatio` | `Math.min(devicePixelRatio, 2)` (the demo's approach) | DPR 3 = 9× pixels for invisible gain on a smooth gradient. |
| Context-loss recovery | Assume context never dies | Listen `webglcontextlost`/`webglcontextrestored`; call `onError` → poster (T3) | Mobile Safari drops contexts under memory pressure; Phase 2 should at least surface the error so the poster (Phase 3) can catch it. |

**Key insight:** The shader algorithm is the source of truth — do not "improve" it. The only legitimate changes are uniform promotion and (later) precision fallback. Everything else (noise function, octave count, warp structure, color-mix chain) stays identical to the demo.

## Common Pitfalls

### Pitfall 1: backdrop-filter breaks silently under a transformed ancestor
**What goes wrong:** Glass panels above the canvas stop showing the blurred liquid; they blur an empty/transparent backdrop instead.
**Why it happens:** An ancestor of the canvas (or the glass panel) has `transform`/`opacity`/`will-change`/`filter`/`contain`, creating a new stacking context. `backdrop-filter` samples within the element's stacking context; if the canvas is isolated elsewhere, it's invisible to the sampler.
**How to avoid:** Mount the canvas as a direct child of `<body>`; enforce the no-context-creating-ancestor contract (§Pattern 4). Add a dev-mode computed-style guard.
**Warning signs:** Glass panels look flat/transparent instead of frosted-liquid; the liquid is visible in gaps between panels but not *through* them. `[VERIFIED: ARCHITECTURE.md Anti-Pattern 3]`

### Pitfall 2: precision highp float black-screens mobile/older GPUs
**What goes wrong:** The shader compiles but links to a black screen on some mobile/older GPUs where fragment `highp` is unsupported.
**Why it happens:** WebGL1 makes fragment `highp` optional; the demo declares it unconditionally (line 82).
**How to avoid:** WebGL2-first context (mandates highp) + highp→mediump declaration fallback for WebGL1. Phase 4 owns the cheaper-mediump-shader variant.
**Warning signs:** Works on desktop, black on an older Android/iOS device. `[CITED: webglfundamentals; SUMMARY.md Pitfall 4]`

### Pitfall 3: Palette hardcoded → un-themeable + recompile stalls
**What goes wrong:** Changing colors requires editing shader source and recompiling, stalling the pipeline; cannot be driven by theme tokens at runtime.
**Why it happens:** Leaving `vec3 cGreen = vec3(0.290,0.871,0.502)` as a literal (the demo's state).
**How to avoid:** Promote all 5 colors + base to `uniform vec3`; push via `gl.uniform3fv` from ThemeBridge. Never recompile on theme change. `[VERIFIED: ARCHITECTURE.md Anti-Pattern 1]`

### Pitfall 4: Ungated rAF loop (WCAG + battery risk) — structure for Phase 3
**What goes wrong:** The demo's `requestAnimationFrame(frame)` runs unconditionally — in background tabs, under reduced-motion, forever.
**Why it happens:** The demo is a zero-dependency prototype with no lifecycle gating.
**How to avoid:** Phase 2 must structure the loop as **start()/stop()/renderOnce()** from day one (even if Phase 2 only calls `start()`), so Phase 3 can gate on `visibilitychange` + `prefers-reduced-motion` without invasive refactor. Do NOT ship the final product with an ungated loop.
**Warning signs:** GPU stays hot when the tab is backgrounded; motion continues for users with reduced-motion preference. `[VERIFIED: SUMMARY.md Pitfalls 2,3,9]`

### Pitfall 5: Design-tool-vs-runtime divergence
**What goes wrong:** Reviewing the liquid against the Ardot static screenshot (a single-layer linear gradient) instead of the running shader leads to false "it doesn't match" conclusions.
**Why it happens:** Ardot cannot represent animated shaders; `capture_screenshot` already ADAPTER_TIMEOUTs on complex blends.
**How to avoid:** The **running `liquid-demo.html` / the ported component is the source of truth**, not the Ardot canvas. Visual QA is done against the live shader, not the static design screenshot. `[VERIFIED: PROJECT.md; SUMMARY.md Pitfall 6]`

## Code Examples

### Fullscreen-triangle vertex shader (verbatim from demo)
```glsl
// src/liquid/fullscr.vert  — identical to liquid-demo.html VERT
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
```
Geometry: `Float32Array([-1,-1, 3,-1, -1,3])` — one triangle covering the clip space. `[VERIFIED: liquid-demo.html lines 76-79, 210]`

### LiquidCanvas core loop skeleton (start/stop structure for Phase 3 gating)
```ts
// src/liquid/LiquidCanvas.ts (skeleton — see Pattern 1 & 5 for full interfaces)
private rafId: number | null = null;
private running = false;
private startT = performance.now();

start() {
  if (this.running) return;
  this.running = true;
  const frame = (now: number) => {
    if (!this.running) return;
    this.pushTime((now - this.startT) / 1000);  // u_time every frame
    this.gl!.drawArrays(this.gl!.TRIANGLES, 0, 3);
    this.rafId = requestAnimationFrame(frame);
  };
  this.rafId = requestAnimationFrame(frame);
}
stop() { this.running = false; if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = null; }
renderOnce(time = 0) { this.pushTime(time); this.gl!.drawArrays(this.gl!.TRIANGLES, 0, 3); }
// Phase 3 will add: visibilitychange → stop()/start() with time-offset; reduced-motion → renderOnce() + stop().
```
`[VERIFIED: .planning/research/ARCHITECTURE.md — "gate the rAF loop, cancel on visibilitychange, offset time on resume"]`

### Resize with DPR clamp (preserves demo behavior)
```ts
resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);  // dprCap default 2
  const w = Math.floor(this.canvas.clientWidth * dpr);
  const h = Math.floor(this.canvas.clientHeight * dpr);
  this.canvas.width = w; this.canvas.height = h;
  this.gl!.viewport(0, 0, w, h);
  this.gl!.uniform2f(this.uRes, w, h);  // u_res = drawing-buffer size (UV math stays correct)
}
```
`[VERIFIED: liquid-demo.html lines 218-223; ARCHITECTURE.md — u_resolution must be drawing-buffer size]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebGL1 context (`getContext('webgl')`) | WebGL2 context (`getContext('webgl2')`) | WebGL2 universal (97%+) since ~2022 | Mandates fragment `highp`; eliminates precision black-screen class. Demo uses WebGL1 — port upgrades to WebGL2. |
| Inline shader strings | `.glsl` file imports via vite-plugin-glsl | Standard since Vite-era | Syntax highlighting, `#include`, minification. |
| Hardcoded palette in GLSL | Uniform-driven palette | Best practice, project-specific | Runtime-themeable, no recompile. |
| `regl` for declarative WebGL | OGL or vanilla WebGL2 | regl maintenance INACTIVE (Snyk, last release Nov 2024) | Don't build new work on regl. `[VERIFIED: SUMMARY.md — regl INACTIVE]` |

**Deprecated/outdated:**
- `regl` (upstream): maintenance INACTIVE, 110 open issues — do not use. `[VERIFIED: Snyk]`
- Legacy Three.js `EffectComposer + Pass[]`: deprecated r183 in favor of node-graph `RenderPipeline` — irrelevant to Phase 2 (no post-processing) but relevant if R3F migration adds bloom later.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The design-token system (CSS custom properties / token store) does not yet exist in code; `defaultTheme.ts` hardcodes demo values as the default, and the `theme` prop is the stable contract. | Pattern 2 | Low — if tokens already exist, binding is additive; the `LiquidTheme` interface still holds. |
| A2 | WebGL2's mandated fragment `highp` eliminates the precision black-screen on the vast majority of devices; the highp→mediump declaration fallback covers the WebGL1-only tail. | Pattern 3 | Low — Phase 4 (VISUAL-04) owns the full cheaper-mediump-shader variant regardless. |
| A3 | The team will eventually build a React app (per research's "likely case"); the vanilla engine + thin wrapper defers that commitment safely. | Standard Stack | Medium — if the final app is Vue/Svelte, the React wrapper is discarded but the engine + ThemeBridge are framework-agnostic and survive. |
| A4 | `vite-plugin-glsl` 1.6.1's SUS flag is a false-positive (recent-patch recency, not package age). | Package Legitimacy | Very low — 112K/wk, multi-year repo, no postinstall. |

## Open Questions

1. **Does a design-token system (CSS variables / token store) already exist in code, or only in the Ardot design?**
   - What we know: PROJECT.md lists tokens conceptually (`--glass-bg`, `--accent` #4ADE80); REQUIREMENTS DESIGN-02 was "delivered" as design only. No `package.json` / CSS token file found in the workspace.
   - What's unclear: whether a `.css`/`.json` token file exists anywhere (e.g., inside the Ardot export) that Phase 2 should bind to.
   - Recommendation: Planner treats tokens as not-yet-in-code; `defaultTheme.ts` reproduces the demo. If a token file surfaces, wire `LiquidBackground`'s `theme` prop to it — the interface is stable either way.

2. **Should Phase 2 also scaffold the poster layer (z:0), or is that strictly Phase 3?**
   - What we know: ARCHITECTURE.md's build order puts PosterLayer first ("guarantees a non-black floor from day one"). ROADMAP Phase 3 owns T3 poster. Phase 2 success criteria do not mention the poster.
   - Recommendation: Phase 2 should at minimum reserve `z:0` and render a solid `u_base`-colored `<div>` behind the canvas (trivial, prevents a black void if WebGL fails during this phase's QA). Full themed WebP poster pipeline is Phase 3.

3. **Is an iPhone / WebGL1+mediump test device available for Phase 2 QA?**
   - What we know: SUMMARY.md lists "Real-iPhone test access assumed available" as a gap; Phase 7 owns cross-device QA.
   - Recommendation: Phase 2 QA on the available healthy GPU (success-criterion #4). Precision-fallback validation on a real mediump device is Phase 4/7. If an iPhone is available now, smoke-test the WebGL1+mediump path opportunistically.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server / build | ✓ | v22.22.2 | — |
| npm | package install | ✓ | 10.9.7 | — |
| WebGL2 (browser) | Liquid rendering | ✓ (any modern browser) | n/a | WebGL1 context + mediump fallback |
| Vite 8.2.0 | dev server / build / `.glsl` imports | ✗ (not yet installed) | — | `npm install -D vite vite-plugin-glsl` (Wave 0) |
| vite-plugin-glsl 1.6.1 | `.frag`/`.vert` file imports | ✗ (not yet installed) | — | Inline template-literal strings (not recommended) |

**Missing dependencies with no fallback:** none blocking — Vite + vite-plugin-glsl install in Wave 0.
**Missing dependencies with fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (ships with Vite; `npm install -D vitest`) — recommended for a Vite project. Alternatively, manual visual QA against the running component (this phase is visual-first). |
| Config file | `vitest.config.ts` (Wave 0) — or co-located in `vite.config.ts` via `test` key. |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISUAL-02 (a) | `<LiquidBackground/>` mounts a fixed full-screen canvas, z:10, pointer-events:none | unit (DOM) | `npx vitest run src/liquid/__tests__/LiquidBackground.test.tsx` | ❌ Wave 0 |
| VISUAL-02 (b) | u_color[5]/u_base/intensity/speed/warp exposed as uniforms; no hardcoded vec3 literals in shader hot path | unit (source grep + uniform-set assertion) | `npx vitest run src/liquid/__tests__/uniforms.test.ts` | ❌ Wave 0 |
| VISUAL-02 (c) | canvas in root stacking context; no transform/opacity/will-change ancestors | unit (computed-style walk) | `npx vitest run src/liquid/__tests__/stacking-context.test.ts` | ❌ Wave 0 |
| VISUAL-02 (d) | healthy-GPU render: flow+morph, no console errors | manual / smoke (visual QA against running component) | `npx vite dev` → visual inspection | n/a (manual) |
| ThemeBridge | themeToUniforms maps hex→vec3 correctly; default reproduces demo values | unit | `npx vitest run src/liquid/__tests__/themeBridge.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` (fast unit suite) + `npx vite build` (compiles `.glsl` imports — catches shader-port syntax errors)
- **Per wave merge:** full suite + manual visual QA (`npx vite dev`, compare to `liquid-demo.html` side-by-side)
- **Phase gate:** visual parity with `liquid-demo.html` confirmed; no console errors; unit suite green

### Wave 0 Gaps
- [ ] `src/liquid/__tests__/LiquidBackground.test.tsx` — covers VISUAL-02 (a): mount → canvas exists, fixed, z:10, pointer-events:none
- [ ] `src/liquid/__tests__/uniforms.test.ts` — covers VISUAL-02 (b): grep `liquid.frag` for zero `vec3(` literals in `main()`; assert `gl.uniform3fv` called with 15-float array on `setTheme`
- [ ] `src/liquid/__tests__/stacking-context.test.ts` — covers VISUAL-02 (c): mount canvas, walk ancestors, assert none create a stacking context
- [ ] `src/liquid/__tests__/themeBridge.test.ts` — covers ThemeBridge: `hexToVec3('#4ADE80')` ≈ `[0.290,0.871,0.502]`; `defaultTheme` matches demo
- [ ] Framework install: `npm install -D vitest` (+ `@testing-library/react`, `jsdom` for the DOM tests) — Wave 0

> **Note on shader visual testing:** A fullscreen WebGL fragment shader cannot be meaningfully unit-tested for *visual* output in jsdom (no real GL context). VISUAL-02 (d) is manual visual QA: run `npx vite dev`, confirm the ported component renders flowing+morphing liquid indistinguishable from `liquid-demo.html`, with zero console errors. Automated tests cover the *contract* (uniforms set, canvas placement, stacking context); manual QA covers the *rendering*.

## Security Domain

> `security_enforcement: true` in `.planning/config.json`. ASVS Level 1. This phase is a client-side visual component with no auth, no network, no user data, no secrets — the security surface is minimal. Relevant categories listed for completeness.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in this component. |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | No privileged operations. |
| V5 Input Validation | yes (low) | `LiquidTheme` props (hex strings, numbers) are validated: `hexToVec3` parses strictly; numeric uniforms clamped to sane ranges (intensity 0..1, speed ≥0, warp >0). Reject malformed hex. |
| V6 Cryptography | no | No crypto. |
| V7 Errors & Logging | yes (low) | Shader compile/link failures and context-loss call `onError` (→ poster fallback), never crash the page or leak GL internals to production console. |
| V8 Data Protection | no | No stored/transmitted data. |
| V12 Files & Resources | yes (low) | `.glsl` shader files are static build-time assets (no runtime file access); no `eval`/`Function` of user input. |
| V14 Configuration | yes (low) | No `postinstall` scripts in dependencies (verified); no env-var secrets consumed. |

### Known Threat Patterns for WebGL2 + Vite stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious `.glsl` injection (if shader source ever becomes user-supplied) | Tampering | Shader source is static build-time `.glsl` files imported via vite-plugin-glsl — never concatenated from user input. N/A in Phase 2. |
| Supply-chain compromise via `postinstall` | Tampering / Elevation | Verified: `vite`, `vite-plugin-glsl`, `three` all have **no postinstall scripts** (`npm view <pkg> scripts.postinstall` → empty). Pin versions in `package.json`. |
| WebGL fingerprinting / context-loss DoS | Denial of Service | Context-loss is handled (`webglcontextlost` → `onError` → poster). The shader does not read cross-origin textures; no fingerprinting surface beyond context existence (inherent to any WebGL use). |
| DOM injection via `className` prop | Tampering | `className` is applied via React's `className` (auto-escaped) — no `innerHTML` / `dangerouslySetInnerHTML`. |

## Sources

### Primary (HIGH confidence)
- **`liquid-demo.html`** (project file) — first-hand source-of-truth: WebGL1, Ashima snoise, 5-octave fbm, 2-pass domain warping, 5-color palette as `vec3` literals, `precision highp float` (line 82), DPR cap at 2, fullscreen triangle, ungated rAF.
- **`.planning/research/STACK.md`** — stack options (Three.js+R3F default vs OGL lighter fallback vs vanilla), vite-plugin-glsl, version compat matrix. `[VERIFIED: 2026-07-30, cross-checked against npm this session]`
- **`.planning/research/ARCHITECTURE.md`** — z-stack layering, stacking-context contract, ThemeBridge pattern, uniform architecture, rAF gating, anti-patterns.
- **`.planning/research/SUMMARY.md`** — pitfalls (precision, backdrop-filter, reduced-motion, ungated rAF, design-vs-runtime divergence), build order.
- **npm registry** (this session) — version verification: vite-plugin-glsl@1.6.1, vite@8.2.0, three@0.185.1, @react-three/fiber@9.6.1, @react-three/drei@10.7.7; postinstall scripts empty for all.
- **webglfundamentals.org** — WebGL2 mandates fragment `highp`; WebGL1 highp optional; Safari `getShaderPrecisionFormat` quirk; must check LINK_STATUS.

### Secondary (MEDIUM confidence)
- **`.planning/PROJECT.md`** / **`.planning/REQUIREMENTS.md`** / **`.planning/ROADMAP.md`** — VISUAL-02 scope, Phase 2 success criteria, dependencies, deferred items (poster = Phase 3, precision = Phase 4).
- **gsd-tools package-legitimacy** — SUS verdicts on vite/vite-plugin-glsl/three are "too-new" false-positives; @react-three/fiber and @react-three/drei verdict OK.

### Tertiary (LOW confidence)
- None — all claims verified or cited from project research / official sources this session.

## Metadata

**Confidence breakdown:**
- Standard stack (vanilla WebGL2 + Vite + vite-plugin-glsl): HIGH — the demo proves vanilla WebGL works; WebGL2 mandates highp; versions verified on npm this session.
- Stack decision (vanilla over React+Three.js): HIGH — workspace has no React app; shader is a fullscreen triangle; research's own OGL reasoning applies.
- Uniform architecture: HIGH — directly from ARCHITECTURE.md ThemeBridge pattern, verified against the demo's literal values.
- Precision branching: MEDIUM-HIGH — WebGL2-mandates-highp is spec-verified; the WebGL1 mediump-tail fallback is standard but the cheaper-mediump-shader variant is Phase 4.
- Stacking-context contract: HIGH — MDN + ARCHITECTURE.md Anti-Pattern 3.
- Component API: HIGH — derived from ARCHITECTURE.md component responsibilities + standard class/wrapper pattern.

**Research date:** 2026-07-30
**Valid until:** 2026-09-30 (90 days — stable WebGL2/Vite APIs; re-verify npm versions before install)
