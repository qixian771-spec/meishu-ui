# Project Research Summary

**Project:** 灵犀 Nexus
**Domain:** WebGL liquid-gradient productivity/task-management desktop web UI (enterprise, dark glassmorphism)
**Researched:** 2026-07-30
**Confidence:** HIGH

## Executive Summary

灵犀 Nexus is a dark glassmorphism desktop web app for enterprise employees whose signature is a **system-wide WebGL liquid gradient** — a continuously flowing, domain-warped simplex-noise field that breathes behind every screen. It is not a single decoration; it is the motif from which all other differentiators (liquid logo, active-nav pill, border buttons, avatar ring, tinted data viz) derive their palette and motion language. Experts build this as a **layered z-stack**: a static poster image at the floor (z:0) as a paint-color safety net, a fixed full-screen `<canvas>` above it (z:10, `pointer-events:none`) running the fragment shader, and a transparent React UI tree on top (z:30+) whose glassmorphism panels use `backdrop-filter` to blur whatever is behind them.

The recommended approach is **React 19 + Three.js 0.184.0 + @react-three/fiber v9 + drei v10 + vite-plugin-glsl**, porting the existing `liquid-demo.html` domain-warped fbm shader verbatim (it is the correct SOTA technique). OGL 1.0.11 is the documented lighter fallback if the app is framework-light or ~150 KB is a hard constraint — the shader itself stays identical in either stack. The critical architectural insight is that **`backdrop-filter` over a live animated canvas is the worst-case input for the property** (no backdrop cache; full re-blur every frame, per panel), so the glass layer must be decoupled from the live canvas via a snapshot texture, blur-radius capped (~12–16px), and simultaneous glass surfaces budgeted to ≤2 per screen.

The dominant risks are performance and accessibility, not visual. The 8-pass fbm shader (~40 `snoise` evals/pixel/frame) thermally throttles integrated GPUs; `backdrop-filter` storms compound it; the demo's ungated `requestAnimationFrame` loop is a **WCAG 2.2.2 Level A failure** (no `prefers-reduced-motion` respect); `precision highp float` unconditionally declared black-screens a slice of mobile GPUs; and bright drifting blobs intermittently break text contrast (WCAG 1.4.3). All of these have known, cheap mitigations — but only if they are baked in at component-creation time, not retrofitted. The poster-first build order guarantees a non-black floor from day one so later steps can fail safely.

## Key Findings

### Recommended Stack

Default: **React 19 + Three.js 0.184.0 + R3F v9 + drei v10 + Vite 6 + vite-plugin-glsl 1.5.5**. The shader (domain-warped fbm of 3D simplex noise, Ashima/MIT, ported from `liquid-demo.html`) is the source of truth and stays identical across stacks — the stack decision is only about the *wrapper* around it. Lighter fallback: **OGL 1.0.11** (~5–8 KB, no React coupling) when bundle size is the hard constraint.

- **Three.js 0.184.0** — WebGL renderer; `RawShaderMaterial` gives direct GLSL control; WebGPU-ready (r171+) with zero-config WebGL2 fallback.
- **@react-three/fiber v9** — declarative `<Canvas>`, `useFrame` for per-frame uniform updates, React lifecycle cleanup. The background becomes a self-contained `<LiquidBackground />`.
- **@react-three/drei v10** — `shaderMaterial` factory, `Stats`, `useDetectGPU` for adaptive tiering. Saves ~100 lines of boilerplate.
- **vite-plugin-glsl 1.5.5** — import `.frag`/`.vert` files with `#include` chunk support; eliminates inline template-literal shaders.
- **Defer:** `@react-three/postprocessing` v3 (bloom ~15% GPU cost, shader already looks rich), `zustand` (only if app state drives uniforms).
- **Avoid:** `regl` (maintenance INACTIVE per Snyk), Babylon.js (1.4 MB, game-engine overkill), PixiJS (wrong paradigm), p5.js (toy), raw WebGL1 for production, CSS-only gradients (cannot domain-warp).

### Expected Features

**Table stakes (must-have for launch):** stats/KPI cards, task list with filtering & sorting, task detail drawer, upcoming-deadlines widget, dark mode (primary), global/scoped search, user profile/settings, keyboard navigation, empty states, skeleton/loading states, responsive desktop-first layout.

**Liquid differentiators (competitive advantage — all derive from the system-wide background):**
- **WebGL liquid background (system-wide)** — the foundation; P1, HIGH complexity.
- Liquid-gradient logo mark (CSS-animated, LOW) — brand identity.
- Liquid active-state navigation pill (MEDIUM) — signature "pour" micro-interaction.
- Liquid-border primary CTAs (MEDIUM) — reserved for 1–2 actions/screen.
- Liquid-gradient avatar ring (LOW) — cheap, high payoff.
- Liquid glass command palette / Cmd+K (MEDIUM) — P2.

**Anti-features (scope-creep guards):** glassmorphism on every element (GPU + readability collapse), liquid on dense data tables (WCAG contrast failure), full-screen WebGL on every route with no idle throttle (battery drain), parallax-on-scroll (vestibular trigger — anti-pattern for an 8h/day enterprise tool), real-time collab cursors (out of scope — no backend), custom liquid chart engine (theme an existing lib instead), WebGL liquid toasts (low ROI for ephemeral elements), 3D-tilt cards (gimmicky + vestibular).

**Defer to v1.x:** light "Spectra" theme variant (HIGH effort — full token re-skin + contrast re-audit), cursor-reactive distortion (perf-gated), command palette, liquid-tinted data viz, Kanban/Timeline views. **Defer to v2+:** liquid morph screen transitions, custom chart engine, real-time collaboration.

### Architecture Approach

Layered z-stack with strict one-way data flow. The canvas is `position:fixed; inset:0; pointer-events:none` at z:10, never participating in layout. App UI is a transparent root at z:30; modals/toasts at z:50. The liquid is never on top. `backdrop-filter` correctness depends on keeping the canvas in the root stacking context — wrapping it in a `transform`/`opacity`/`will-change` ancestor silently breaks glass sampling.

**Major components:**
1. **LiquidCanvas** — owns WebGL context, shader program, gated rAF loop, resize/DPR, uniform updates. Pure rendering.
2. **ThemeBridge** — pure function `theme → uniform struct`; the only component that knows both worlds. Same palette feeds the live shader AND the poster (T1↔T3 seamlessness).
3. **QualityGate** — runtime capability detection (WebGL support, `prefers-reduced-motion`, `save-data`, low-power heuristic) → tier decision.
4. **PosterLayer** — static themed `.webp` (≤80 KB) always in DOM at z:0; visible only when canvas is off/gated. No layout shift on fallback.
5. **GlassPanel (UI)** — `backdrop-filter` cards; never imports the canvas; composition is visual only.

**Three fallback tiers:** T1 full animated WebGL (healthy GPU, motion allowed) → T2 frozen single frame (`prefers-reduced-motion` or marginal GPU) → T3 poster image (no WebGL / `save-data` / low-power). Palette is uniform-driven (no shader recompilation): `u_color[5]`, `u_base`, `u_intensity`, `u_speed`, `u_warp`. Colors update on theme change only; `u_time`/`u_speed` update every frame.

### Critical Pitfalls

1. **`backdrop-filter` over an animated canvas = per-frame re-blur storm** (Pitfall 1, 10) — blur the *source* (snapshot texture at 8–12 fps) not the live backdrop; cap radius ~12–16px; budget ≤2 live glass surfaces/screen; `@supports` fallback to solid tint; `contain: layout paint`.
2. **fbm domain-warp shader melts integrated GPUs & batteries** (Pitfall 2) — ~40 `snoise`/pixel/frame; adaptive resolution 0.5–0.75×, octave tiering, DPR cap 1.5 for canvas, `powerPreference:'high-performance'`, 30fps background on low tier. Thermal-throttle signature: high FPS 30s then decline.
3. **`prefers-reduced-motion` ignored = WCAG 2.2.2 Level A failure** (Pitfall 3, 9) — gate the rAF loop on `matchMedia`, listen for changes, render ONE static frame then stop; also `visibilitychange` → cancel rAF when tab hidden, time-offset on resume.
4. **`precision highp float` black-screens mobile/older GPUs** (Pitfall 4, 8) — detect+branch: attempt highp link, fall back to mediump *cheaper* shader (naive fbm breaks at 16-bit); prefer WebGL2 (mandates highp); never ship untested on a real iPhone ("iOS is the canary").
5. **Text contrast fails at bright drifting blobs** (Pitfall 5) — WCAG 1.4.3; keep text in opaque-enough panels, reserve "quiet zones" over dark base, `text-shadow` halo for floating text, `:focus-visible` ≥3:1; test against the *brightest* of 10 captured frames, not the average.
6. **Design-tool-vs-runtime divergence** (Pitfall 6) — Ardot `capture_screenshot` already ADAPTER_TIMEOUTs on SCREEN-blend; static canvas cannot represent animation. Make the live HTML the source of truth; review against the running shader, not the Ardot screenshot.

## Implications for Roadmap

The single most important ordering constraint: **the WebGL liquid background + its degradation + reduced-motion gating must be built and stable before any liquid-element differentiator**, because logo/nav/buttons/avatars all derive their palette and motion language from the system-wide background. The poster floor must come first so every later step can fail without a black void. Light "Spectra" theme is explicitly deferred to v1.x (full token re-skin + contrast re-audit is high effort with no launch-blocking value).

### Phase 1: Foundation — Tokens, Poster Floor, App Shell
**Rationale:** No dependencies; guarantees a non-black visual baseline to develop against. Establishes the contract every later phase assumes.
**Delivers:** Dark glassmorphism design token system (`--glass-bg`, `--glass-blur`, `--glass-border`, `--text-strong`, `--accent` 翠绿 #4ADE80), PosterLayer (themed `.webp` at z:0), Vite+React+R3F scaffold, z-index ladder documented.
**Addresses:** table-stakes token system; anti-feature "glass everywhere" (tokens encode restraint).
**Avoids:** Pitfall 6 (establishes HTML-as-truth, tokens shared by shader + Ardot).

### Phase 2: Liquid Background Core — Canvas, Stacking Contract, Quality Gate
**Rationale:** The foundation all differentiators build on. Port the proven `liquid-demo.html` shader; get the z-stack and pointer-events contract right *before* theming or perf polish.
**Delivers:** `<LiquidBackground />` component, fixed full-screen canvas at z:10, `pointer-events:none`, fullscreen-triangle shader ported via `vite-plugin-glsl`, DPR clamp at 2, QualityGate (T1/T2/T3 capability detection).
**Uses:** Three.js 0.184.0, R3F v9, drei `shaderMaterial`.
**Avoids:** Pitfall 8 (write loop bounds as `const` from the start), Pitfall 6 (canvas in root stacking context, no transform/opacity ancestor).

### Phase 3: Performance & Degradation — Reduced-motion, Visibility, Adaptive Resolution
**Rationale:** The highest-risk dimension. Must be baked into the loop at creation — retrofitting resolution scaling into a working shader is invasive. This is PROJECT.md's Active item.
**Delivers:** rAF gate on `prefers-reduced-motion` (one static frame + stop), `visibilitychange` cancel/resume with time-offset, adaptive `qualityScale` (1.0→0.75→0.5) with frame-budget governor, `highp`/`mediump` link-status branch, `powerPreference:'high-performance'`, WebGL2-first context.
**Avoids:** Pitfalls 2, 3, 4, 9 — the four that *must* be designed in here, not retrofitted.

### Phase 4: Theming Bridge — Tokens → Uniforms
**Rationale:** Correctness/feature concern (low risk, high value) that needs a working themed canvas to measure against. Unblocks theme switching and the deferred light variant.
**Delivers:** ThemeBridge pure function (`theme → uniform struct`), palette promoted from hardcoded `vec3` literals to `uniform vec3 u_color[5]` + `u_base`/`u_intensity`/`u_speed`/`u_warp`, same palette feeding PosterLayer (T1↔T3 seamlessness), no shader recompilation on theme change.
**Avoids:** Anti-Pattern 1 (hardcoded palette → un-themeable, recompile stalls).

### Phase 5: Glassmorphism UI Layer — Blur Tuning, Contrast, Panel Budget
**Rationale:** The most expensive, hardest-to-measure layer; depends on a stable themed canvas underneath. Set the panel budget *before* building multi-panel screens.
**Delivers:** Snapshot-texture decoupling (blur a low-FPS canvas capture, not the live backdrop), blur radius cap ~12–16px (26px reserved for single-panel login/hero), ≤2 live `backdrop-filter` surfaces/screen, `@supports not (backdrop-filter)` solid-tint fallback, `contain: layout paint`, contrast tested against brightest-of-10-frames, `:focus-visible` ≥3:1.
**Avoids:** Pitfalls 1, 5, 10, 11.

### Phase 6: Core Screens — Login, Dashboard, Task List+Detail, Settings
**Rationale:** Standard React UI patterns on a now-stable liquid+glass foundation. The 4 PROJECT.md screens.
**Delivers:** Login/register (full liquid + glass form), dashboard (4–6 KPI cards + schedule strip), task list + filtering + detail drawer, settings/profile + avatar ring. Table-states features.
**Avoids:** Anti-features (solid surfaces for dense tables, liquid in gutters not behind text).

### Phase 7: Liquid Element Differentiators — Logo, Active Nav, Border Buttons, Avatar Ring
**Rationale:** All derive palette/motion from the system-wide background — can only ship after Phase 2–4 are stable. Mostly CSS animation (cheap).
**Delivers:** Liquid-gradient logo mark, liquid active-state nav pill (signature "pour" transition <400ms), liquid-border primary CTAs (1–2/screen), liquid-gradient avatar ring.
**Avoids:** Anti-feature "liquid buttons everywhere" (reserved accent only).

### Phase 8: Cross-device QA & Poster Pipeline
**Rationale:** Validates the fallback chain end-to-end and generates the poster asset from a shader anchor frame.
**Delivers:** Real-iPhone smoke test, fallback-chain exercise (T1→T2→T3), auto-generated themed WebP poster (≤80 KB) from `u_time=ANCHOR_TIME`, runtime-capture review workflow (replaces Ardot screenshot sign-off).
**Avoids:** Pitfalls 4, 6, 7.

### Phase Ordering Rationale
- **Poster-first:** a non-black floor exists from Phase 1, so every later phase can fail safely.
- **Background before differentiators:** the dependency graph is strict — logo/nav/buttons/avatars all consume the background's palette and motion language.
- **Degradation before glass tuning:** `backdrop-filter` correctness and perf depend on a stable, gated canvas; tuning blur over an ungated loop measures noise.
- **Theming before resolution scaling:** theming is correctness (low risk, high value); adaptive quality is perf-polish that needs a working themed canvas to measure.
- **Glass blur late:** most expensive, hardest to measure, depends on stable canvas underneath.
- **Light Spectra deferred to v1.x:** high effort (full token re-skin + contrast re-audit), no launch-blocking value.

### Research Flags
Phases likely needing deeper research during planning:
- **Phase 2 (Liquid Background Core):** shader port specifics (WebGL1→WebGL2 migration of `gl_FragColor`/`texture2D`/`attribute`/`varying`), precision branching architecture.
- **Phase 3 (Performance & Degradation):** adaptive quality governor tuning thresholds, GPU-tier detection heuristics, snapshot-texture FPS vs. blur-cost tradeoff.
- **Phase 5 (Glassmorphism UI Layer):** snapshot-texture blur technique (the recommended decoupling) needs prototyping; animated-background contrast testing methodology.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** standard Vite/React/token setup.
- **Phase 6 (Core Screens):** standard React productivity-UI patterns.
- **Phase 7 (Liquid Element Differ):** mostly CSS conic-gradient + mask animation, well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Cross-verified across Three.js official changelog (r170→r184), R3F v9 migration guide, npm, Snyk (regl health), multiple independent analyses. Versions current as of Mar 2026. |
| Features | HIGH | Productivity-dashboard table-stakes are well-established; liquid differentiators map cleanly to documented iOS 26 Liquid Glass / Framer patterns. |
| Architecture | HIGH (layering) / MEDIUM (backdrop-filter cost, resolution scaling, poster) | Layering/visibility verified against MDN + project's own working demo; `backdrop-filter`-over-live-canvas cost corroborated but exact numbers need empirical validation. |
| Pitfalls | HIGH | Verified against current sources AND the project's own `liquid-demo.html` (line 82 `precision highp`, `blur(26px)`, ungated rAF, 8×fbm) and observed `capture_screenshot` ADAPTER_TIMEOUT. |

**Overall confidence:** HIGH

### Gaps to Address
- **Exact performance budget numbers** (blur-radius ceiling, snapshot FPS, octave-count-per-tier) need empirical validation on target integrated-GPU hardware during Phase 3/5.
- **Snapshot-texture blur technique** (the recommended `backdrop-filter` decoupling) is architecturally described but not yet prototyped — Phase 5 planning should spike it.
- **Poster asset generation pipeline** (auto-capture from shader anchor frame → themed WebP) is specified at the contract level but the tooling path is undefined — Phase 8.
- **Light "Spectra" theme tokens** undefined (deferred to v1.x — acceptable gap).
- **Real-iPhone test access** assumed available; if not, the WebGL1/mediump fallback path cannot be fully validated (Pitfall 4).

## Sources

### Primary (HIGH confidence)
- **`liquid-demo.html`** (project file) — first-hand reference implementation: WebGL1, Ashima snoise, 5-octave fbm, 2-pass domain warping, 5-color palette, DPR cap at 2, dark base, `precision highp float` line 82, `blur(26px)`, ungated rAF.
- **`.planning/PROJECT.md`** — validated requirements/constraints; observed `capture_screenshot` ADAPTER_TIMEOUT on SCREEN-blend; perf/degradation flagged as Active item.
- **Three.js official changelog** (threejs.org/changelog) + r173/r184 releases — version progression, WebGPU timeline (r171 zero-config), RenderPipeline node graph (r183).
- **R3F v9 Migration Guide** (r3f.docs.pmnd.rs) — React 19 compat, CanvasProps, async gl prop for WebGPU.
- **MDN** — `requestAnimationFrame` background-tab behavior, `prefers-reduced-motion`, Page Visibility API.
- **webglfundamentals.org** — WebGL precision issues (highp optional in frag shaders, Safari `getShaderPrecisionFormat` bug, must check LINK_STATUS).
- **three.js issues #13288/#16687** — iOS `sampler2D` defaults to lowp → jitter; declare `highp sampler2D`.
- **WCAG 2.2.2** (Pause/Stop/Hide, Level A) + **WCAG 1.4.3** (contrast 4.5:1) — accessibility conformance requirements.
- **vite-plugin-glsl npm** — v1.5.5, `#include` support, Vite 6 / Oxc compatibility.
- **Snyk** — `regl` package health: maintenance INACTIVE, last release Nov 2024, 110 open issues.

### Secondary (MEDIUM confidence)
- utsubo.com / cuberoot.me — Three.js 2026 state, r184 current, npm download dominance.
- lobehub — R3F tested versions Feb 2026 (three@0.182, fiber@9.5.0, drei@10.7.7).
- hivebook.wiki / aidxn.com — OGL v1.0.11 (June 2026), 5 KB, class inventory, use cases.
- tsight.io / maviklabs.com / colorfyi.com — `backdrop-filter` per-frame re-blur cost, downsampling-before-blur mitigation, `contain`/`@supports`.
- Intel dynamic-resolution-rendering paper — offscreen framebuffer at fractional scale.
- Framer Shader 3D Background — production pattern (DPR scaling, viewport pause, ResizeObserver, cleanup).
- Glassmorphism guides (neelnetworks, zenixtools, framerwebsites, nineproo, axonixtools) — blur radius, saturation, anti-nesting, restraint.
- juejin.cn — iOS 26 Liquid Glass CSS implementation; Three.js perf tips (DPR cap, matrixAutoUpdate, visibility).
- madebybeings.com — interactive liquid gradient Three.js tutorial.
- designyff.com — animated rotating-border avatar technique.
- volumeshadertest.com / zonotools — GPU stress-test methodology (integrated-GPU thermal throttle, dual-GPU power saving).

---
*Research completed: 2026-07-30*
*Ready for roadmap: yes*
