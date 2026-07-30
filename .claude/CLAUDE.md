<!-- GSD:project-start source:PROJECT.md -->

## Project

**灵犀 Nexus — 液态美学桌面应用界面**

「灵犀 Nexus」是一个面向企业员工的桌面端（Web 应用）生产力/任务管理产品界面设计。以深色玻璃质感（dark glassmorphism）为基底，以** WebGL 驱动的动态液态渐变**作为贯穿全站的视觉母题，目标是既美观又易用。当前已产出 4 个核心界面的静态设计稿（Ardot 画布）与 1 个可直接运行的 WebGL 液态动态背景（HTML）。

**Core Value:** 用户打开应用第一眼就能感受到「会流动、会呼吸」的液态视觉，且这种液态美学作为系统级母题一致地贯穿登录、仪表盘、列表详情、设置等所有界面——而非某一处的装饰。

### Constraints

- **Tech stack**: 静态设计稿 = Ardot .ardot；动态液态 = WebGL fragment shader（域扭曲 simplex 噪声） — 动态效果无法在静态画布内呈现
- **Performance**: WebGL 液态需考虑 GPU 开销与降级，深色底保证 UI 文字可读
- **Tooling**: fetch_editor_state 不支持按节点下钻，无法直接取得子节点 ID；截图后端当前不稳定
- **Compatibility**: 液态需兼容 prefers-reduced-motion 与低端设备

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## TL;DR — Two Stacks

| | Recommended Default | Lighter Fallback |
|---|---|---|
| **Use when** | App is React-based (the likely case for a desktop web app) | App is framework-light, or bundle size is the hard constraint |
| **Rendering** | Three.js `0.184.0` + `@react-three/fiber` `9.x` | OGL `1.0.11` |
| **Shader** | `RawShaderMaterial` + domain-warped fbm noise (port from existing demo) | `Program` + same fragment shader (port from existing demo) |
| **Bundle (gzip)** | ~150 KB (three) + ~30 KB (R3F) | ~5–8 KB |
| **DX win** | Declarative `<Canvas>`, `useFrame`, React lifecycle integration, drei helpers | Minimal, raw-shader-focused, no scene-graph tax |
| **Confidence** | HIGH | HIGH |

## Recommended Stack (Default: React + Three.js + R3F)

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Three.js** | `0.184.0` (r184, Mar 2026) | WebGL rendering engine, ShaderMaterial for the fullscreen fragment shader | Industry standard (270× more npm downloads than Babylon.js). `RawShaderMaterial` gives direct GLSL control with zero opinionated shader injection — exactly what a fullscreen domain-warped noise background needs. Future-proof: r171 (Sept 2025) made WebGPU production-ready with zero-config `import { WebGPURenderer } from 'three/webgpu'` and automatic WebGL2 fallback. Post-processing rewritten as node-graph `RenderPipeline` in r183 — bloom/glow for the liquid is a one-liner if needed later. |
| **@react-three/fiber** | `9.x` (9.5.0+ tested Feb 2026) | React renderer for Three.js — declarative `<Canvas>`, `useFrame` hook | Zero overhead over vanilla Three.js (components render outside React's reconciler; R3F actually *outperforms* vanilla at scale via React scheduling). v9 pairs with React 19 (concurrent features). Gives you clean lifecycle: mount/unmount cleanup, `useThree` for renderer/camera access, `useFrame` for per-frame uniform updates. The fullscreen-shader background becomes a self-contained `<LiquidBackground />` component. |
| **@react-three/drei** | `10.x` (10.7.7+ tested Feb 2026) | R3F helper library | Provides `shaderMaterial` factory (auto-extends Three.js + registers as JSX element), `Stats` for FPS monitoring, `useDetectGPU` for adaptive quality. Not strictly required but saves ~100 lines of boilerplate. |
| **React** | `19.x` | UI framework | Required peer of R3F v9. If on React 18, use R3F v8 instead (stable, well-tested). The desktop web-app UI (panels, nav, glassmorphism cards) lives in React; the WebGL canvas is one component within it. |
| **Vite** | `6.x` | Build tool / dev server | Standard 2025/2026 frontend bundler. Fast HMR for shader iteration. Native ESM. Required for `vite-plugin-glsl`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **vite-plugin-glsl** | `1.5.5` (Oct 2025) | Import `.glsl`/`.frag`/`.vert` files as strings with `#include` chunk support | **Always.** Lets you extract the fragment shader (currently inline in the HTML demo) into `liquid.frag` with proper syntax highlighting, `#include` for shared noise chunks, and minification. Compatible with Three.js. Eliminates template-literal shader strings. |
| **@react-three/postprocessing** | `3.x` | Post-processing effects (bloom, chromatic aberration) | **Optional, defer.** Only if you want the liquid gradient to *glow* beyond what the shader itself produces. The demo's dark-base + colored-noise already looks good without bloom. Adding bloom costs ~15% more GPU. If you add it, use the new `RenderPipeline` (r183+) not the legacy `EffectComposer`. |
| **lygia** (GLSL lib) | latest | Curated GLSL shader function library (noise, color spaces, math) | **Optional.** If you want to refactor the inline simplex noise into maintained chunks. The demo already has Ashima's `snoise` inlined — works fine. LYGIA offers `#include`-ready versions if you want cleaner organization. |
| **zustand** | `5.x` | Lightweight state store | If app state needs to drive shader uniforms (e.g., color theme changes, interaction intensity). R3F ecosystem standard for non-React-pure state. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **glsl-canvas** (VS Code extension) | Live GLSL preview in editor | Iterate on the fragment shader without running the full app. Supports `#include`, uniforms via config. Massive DX boost for shader authoring. |
| **@types/three** | TypeScript definitions for Three.js | Install as dev dependency. R3F v9 generates JSX types dynamically from Three.js API — no manual type maintenance. |
| **Stats.js** / drei `Stats` | FPS / memory overlay | Wire up during development to catch perf regressions. Remove in production. |

### Installation

# Core

# Shader tooling

# Optional (defer until needed)

# npm install @react-three/postprocessing@3 zustand@5

## Lighter Fallback Stack (OGL)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **OGL** | `1.0.11` (June 2026) | Minimal WebGL abstraction | 5–8 KB gzipped, zero dependencies. Provides exactly `Renderer` + `Program` + `Mesh` + `Geometry` — the four classes a fullscreen-triangle shader needs. No scene graph, no material system, no dead code. You write the GLSL yourself (you already are). Thin enough to debug at the WebGL level. |
| **Vite** | `6.x` | Build tool | Same as default stack. |
| **vite-plugin-glsl** | `1.5.5` | Shader file imports | Same as default stack. |

## GLSL Shader Approach — Recommendation

| Approach | Verdict | Rationale |
|----------|---------|-----------|
| **Domain warping (current)** | ✅ USE THIS | The standard technique for "flowing, morphing" liquid color fields (Inigo Quilez popularized it). Noise fed back into itself creates continuous, organic deformation without discrete blob boundaries. Performant: 5-octave fbm + 2 warp passes = ~80 ALU instructions/fragment, runs 60fps on integrated GPUs at 1080p. Matches the project requirement of "流动、变形" (flow + morph). |
| **Metaballs (isosurface blending)** | ⚠️ Only if you need distinct blob edges | Produces discrete, rounded blobs with clear boundaries (like lava-lamp cells). Requires either many SDF evaluations or marching-squares on CPU. Higher cost, different aesthetic — looks "blobby" not "liquid-field". Not what the reference images show. |
| **Raymarched fluids (Navier-Stokes)** | ❌ Overkill | Full GPU fluid simulation via raymarching. Photorealistic but extremely expensive (100s of instructions/fragment, multiple render passes). Designed for hero shots, not a persistent system-wide background. Would melt laptop GPUs. |

## Performance & Degradation Strategy

| Concern | Technique | Implementation |
|---------|-----------|----------------|
| **Pixel ratio** | Cap at 2 | `dpr={Math.min(window.devicePixelRatio, 2)}` on R3F `<Canvas>`, or `renderer.setPixelRatio()` in OGL. On 3× DPR screens this cuts fragment workload by 56% with imperceptible visual loss. |
| **Dynamic resolution** | Render to half-res target, upscale | If FPS drops, render the shader to a `WebGLRenderTarget` at 0.5× and stretch to canvas. The liquid gradient is blurry by nature — half-res is invisible. |
| **Tab visibility** | Pause render loop | `document.addEventListener('visibilitychange', …)` → cancel `requestAnimationFrame` when hidden. Prevents GPU spin when user switches tabs. R3F: set `frameloop="never"` and manually invalidate. |
| **prefers-reduced-motion** | Freeze to static frame | `window.matchMedia('(prefers-reduced-motion: reduce)')` → render one frame with `uTime = fixed_value`, stop the loop. The gradient becomes a beautiful static image. |
| **Low-end GPU detection** | Adaptive quality | drei's `useDetectGPU` (wraps `detect-gpu` library) gives tier (0–3). On tier 0–1: reduce fbm octaves from 5→3, lower DPR cap to 1.5, disable post-processing. |
| **antialias** | Disable for fullscreen shader | `antialias: false` — there are no polygon edges to smooth in a fullscreen fragment shader. Saves MSAA bandwidth. The demo already does this. |

## Design-Tool-to-Code Handoff

| Source | Handoff Approach | Notes |
|--------|------------------|-------|
| **Ardot → UI components** | **Manual.** Ardot has no code export. Export design tokens (colors, radii, spacing, typography) as a JSON/CSS-variables file and implement components by hand in React. | The 4 interface designs (login, dashboard, list+detail, settings) are reference visuals, not auto-converted code. This is fine — the glassmorphism panels are simple CSS (`backdrop-filter: blur()`, `background: rgba()`, `border-radius`). |
| **Ardot → WebGL shader** | **No path.** Static design tools cannot represent animated shaders. The `liquid-demo.html` IS the design-to-code handoff for the liquid effect — the shader code is the source of truth. | The .ardot canvas approximates the liquid with a single-layer linear gradient (per project notes). The real liquid look comes from the shader, which is code-only. |
| **If migrating to Figma** | Locofy.ai (React+Tailwind export) or Builder.io (component-mapping + AI) | Both are the leading Figma→React tools in 2025/2026. Locofy generates cleaner componentized React; Builder.io maps to existing component libraries. Neither handles WebGL — only the CSS/HTML UI layer. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not (for this project) |
|----------|-------------|-------------|---------------------------|
| WebGL engine | Three.js 0.184.0 | OGL 1.0.11 | OGL is the better *technical* fit for a single fullscreen shader (5 KB vs 150 KB), but loses React integration and ecosystem. Use OGL only if bundle size is a hard constraint or the app isn't React. |
| WebGL engine | Three.js | Babylon.js 8.x | 1.4 MB bundle (vs ~150 KB). Game-engine focus (physics, inspector, scene optimizer). Massive overkill for one background shader. |
| WebGL engine | Three.js | regl 2.1.1 | **Maintenance: INACTIVE** (Snyk). No commits in 12+ months, 110 open issues. The `@plotly/regl` fork is Plotly-internal. Functional/declarative API is elegant but the project is effectively abandoned for new creative work. |
| WebGL engine | Three.js | Raw WebGL1 (current demo) | Works for a demo, but you reinvent resize handling, context-loss recovery, cleanup, and React lifecycle every time. No path to post-processing or WebGPU. Fine as a prototype; not production. |
| WebGL engine | Three.js | PixiJS 8.x | 2D sprite/rendering focused. Custom shaders are second-class. Wrong paradigm for a fullscreen fragment-shader field. |
| React integration | R3F v9 | Vanilla Three.js in `useEffect` | Loses declarative model, lifecycle safety, and `useFrame` ergonomics. You'd manually manage `requestAnimationFrame` + cleanup + resize observers. R3F handles all of this. |
| Shader lang | GLSL (WebGL2) | WGSL (WebGPU) | WebGPU is now cross-browser (Safari 26, Sept 2025), but for a fullscreen fragment shader WebGL2 GLSL is 100% sufficient. WebGPU's compute-shader advantage doesn't help a background gradient. Stay on GLSL now; Three.js r171+ makes WebGPU migration trivial later if needed. |
| Post-processing | Defer (shader self-contained) | @react-three/postprocessing | The domain-warped noise + dark base already produces a rich look. Bloom would add glow but costs ~15% GPU. Add only if the liquid needs to "emit" beyond its color value. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **regl** (upstream `regl` package) | Maintenance INACTIVE per Snyk. No releases since Nov 2024. 110 open issues. A background shader is a 5-year commitment — don't build on an abandoned library. | OGL (if minimal) or Three.js (if full-featured) |
| **Babylon.js** | 1.4 MB bundle, game-engine architecture (physics, inspector, scene optimizer built-in). You'd ship 1.4 MB to render one fullscreen triangle. | Three.js (150 KB, renderer-only) |
| **p5.js** | Creative-coding toy, not production. No tree-shaking, no TypeScript story, global mode footguns. Fine for CodePen; not for a desktop app. | Three.js or OGL |
| **Canvas 2D / CSS-only gradients** | Cannot produce true flowing/morphing deformation. CSS `@property` animated gradients and `background-blend-mode` tricks are static or linear — no domain warping, no organic motion. The project explicitly requires WebGL ("用 webgl"). | WebGL fragment shader (the demo approach) |
| **WebGL1 context** (`getContext('webgl')`) | The demo uses WebGL1. WebGL2 is universally supported (97%+ browsers). WebGL2 gives better precision defaults, `texelFetch`, and is the path Three.js/OGL target. | WebGL2 context — Three.js and OGL both default to WebGL2 |
| **Inline shader strings in JS** | No syntax highlighting, no `#include`, no minification, hard to iterate. The demo's template-literal shader is fine for a demo but doesn't scale. | `vite-plugin-glsl` + `.frag`/`.vert` files |
| **EffectComposer (legacy post-processing)** | Three.js r183 deprecated the old `EffectComposer + Pass[]` pattern in favor of node-graph `RenderPipeline`. Using legacy API means future migration debt. | If post-processing needed: new `RenderPipeline` API (r183+) |

## Stack Patterns by Variant

- Use: Three.js 0.184.0 + R3F v9 + drei v10 + vite-plugin-glsl
- Because: R3F gives declarative `<Canvas>`, `useFrame` for uniform updates, and React lifecycle cleanup. The background becomes a reusable `<LiquidBackground />` component.
- Use: Three.js 0.184.0 + R3F v8 (latest 8.x) + drei v9
- Because: R3F v9 requires React 19. v8 is stable and well-tested with React 18. Same DX, slightly older types.
- Use: Three.js 0.184.0 + TresJS (`@tresjs/core` v4) — the Vue renderer for Three.js (analogous to R3F)
- Because: TresJS is the Vue equivalent of R3F. Same Three.js underneath. Alternative: raw Three.js in `onMounted`/`onUnmounted` with manual cleanup.
- Use: OGL 1.0.11 + vite-plugin-glsl
- Because: 5 KB, purpose-built for shader-driven creative work, no scene-graph overhead. The fullscreen-triangle + fragment-shader pattern is OGL's sweet spot.
- Use: Raw WebGL2 (port the demo, add resize/cleanup/visibility handling manually)
- Because: Zero library overhead. You already have a working demo. The cost is ~50 lines of boilerplate for lifecycle management that OGL/Three.js would give you for free.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@react-three/fiber@9` | `react@19`, `react-dom@19` | R3F v9 is a React 19 compatibility release. Do NOT use v9 with React 18. |
| `@react-three/fiber@8` | `react@18`, `react-dom@18` | Last v8 line. Stable, production-tested. Use if not yet on React 19. |
| `@react-three/drei@10` | `@react-three/fiber@9`, `three@0.165+` | drei v10 targets R3F v9. For R3F v8, use drei v9. |
| `three@0.184.0` | `@react-three/fiber@9.5+` | R3F dynamically maps JSX from Three.js API — works with any recent Three.js. Pin three to avoid surprise breakage from quarterly releases. |
| `vite-plugin-glsl@1.5.5` | `vite@5+`, `vite@6` | Updated Oct 2025 for Vite 6 / Oxc transform support. Works with both Three.js and OGL. |
| `@react-three/postprocessing@3` | `@react-three/fiber@9`, `three@0.180+` | Uses new RenderPipeline API (r183+). Not needed initially — defer. |
| OGL `1.0.11` | Any framework or vanilla | Zero peer dependencies. Works standalone. No React/Vue coupling. |

## Sources

| Source | What was verified | Confidence |
|--------|-------------------|------------|
| [Three.js official changelog](https://threejs.org/changelog/?r170) + [r173 release](https://github.com/mrdoob/three.js/releases/tag/r173) | Version progression r170→r184, WebGPU timeline, BatchedMesh, post-processing rewrite | HIGH (official) |
| [utsubo.com — Three.js 2026 analysis](https://www.utsubo.com/blog/threejs-2026-what-changed) | r171 WebGPU zero-config, r182 stable (Dec 2025), r184 current (Mar 2026), download dominance | MEDIUM (cross-checked with official changelog) |
| [cuberoot.me — Three.js stack reference](https://cuberoot.me/zh/code/stack/three) | r184 = 0.184.0 current stable, RenderPipeline node graph in r183, npm ~140K/week | MEDIUM (cross-checked) |
| [R3F v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide) | R3F v9 = React 19 compat, CanvasProps, async gl prop for WebGPU, Suspense fixes | HIGH (official R3F docs) |
| [lobehub — R3F skill reference](https://lobehub.com/zh/skills/mattwoodco-skills-react-three-fiber) | Tested versions Feb 2026: three@0.182.0, fiber@9.5.0, drei@10.7.7 | MEDIUM |
| [hivebook.wiki — OGL reference](https://hivebook.wiki/wiki/ogl-minimal-low-level-webgl-library) | OGL v1.0.11 (June 2026), class inventory, OGL vs Three.js tradeoffs | MEDIUM |
| [aidxn.com — OGL vs Three.js](https://aidxn.com/blog/ogl-minimal-webgl-library-vs-threejs) | OGL 5 KB, use cases (shader backgrounds, particles), when OGL beats Three.js | MEDIUM |
| [Snyk — regl package health](https://www.snyk.io/package/npm/regl) | regl 2.1.1, maintenance INACTIVE, last release Nov 2024, 110 open issues | HIGH (automated health analysis) |
| [vite-plugin-glsl npm](https://www.npmjs.org/package/vite-plugin-glsl) | v1.5.5, #include support, Three.js/Babylon/lygia compatible, Vite 6 support | HIGH (official npm) |
| [juejin.cn — Three.js perf tips](https://juejin.cn/post/7605881632541769779) | DPR cap at 2 (56% workload reduction), matrixAutoUpdate, visibility API, tone mapping cost | MEDIUM (practitioner writeup, cross-checked) |
| [dev.to — Figma-to-code tool comparison](https://dev.to/shaahzaibrehman/best-tools-to-convert-figma-to-react-free-paid-with-benefits-and-pricing-2025-guide-5bl4) + [0xminds 2025 comparison](https://0xminds.com/blog/guides/figma-to-code-ai-tools-2025) | Locofy (best React), Builder.io (component mapping), Anima (prototyping). None handle WebGL. | MEDIUM |
| [liquid-demo.html] (project file) | Existing shader approach: WebGL1, Ashima snoise, 5-octave fbm, 2-pass domain warping, 5-color palette, DPR cap at 2, dark base | HIGH (first-hand source) |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
