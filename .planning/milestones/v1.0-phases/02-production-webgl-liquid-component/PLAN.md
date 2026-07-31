---
phase: 02-production-webgl-liquid-component
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - tsconfig.json
  - index.html
  - src/main.tsx
  - src/App.tsx
  - src/liquid/liquid.css
  - src/liquid/fullscr.vert
  - src/liquid/liquid.frag
  - src/liquid/types.ts
  - src/liquid/themeBridge.ts
  - src/liquid/defaultTheme.ts
  - src/liquid/LiquidCanvas.ts
  - src/liquid/LiquidBackground.tsx
  - src/liquid/mount.ts
  - src/liquid/index.ts
  - src/liquid/__tests__/themeBridge.test.ts
  - src/liquid/__tests__/uniforms.test.ts
  - src/liquid/__tests__/LiquidBackground.test.tsx
  - src/liquid/__tests__/stacking-context.test.ts
autonomous: true
requirements: [VISUAL-02]
user_setup: []

must_haves:
  truths:
    # SC1
    - "A developer mounts <LiquidBackground/> and the domain-warped liquid renders on a fixed full-screen canvas (z:10, pointer-events:none) with no manual WebGL wiring."
    # SC2
    - "The five palette colors, dark base, intensity, speed, and warp are GL uniforms; changing the theme prop updates them at runtime WITHOUT recompiling the shader."
    - "The shader algorithm (snoise, 5-octave fbm, 2-pass domain warp, color-mix chain) is byte-identical to liquid-demo.html; only palette/params became uniforms."
    - "The per-frame hot path contains zero hardcoded color literals; hex→vec3 conversion runs on theme change only."
    # SC3
    - "The canvas sits in the root stacking context (fixed, inset:0, z:10, pointer-events:none) with no transform/opacity/will-change/filter/contain/isolation ancestor, so backdrop-filter sampling is not silently broken."
    # SC4
    - "On a healthy GPU the component renders flowing+morphing liquid with zero console errors."
    # Phasing guardrails (reserve for Phase 3/4, do NOT implement them now)
    - "The rAF loop is structured as start()/stop()/renderOnce() from day one so Phase 3 can gate it without invasive refactor."
    - "A z:0 solid u_base-colored div exists behind the canvas so a WebGL failure never yields a black void (full themed poster pipeline is Phase 3)."
  artifacts:
    - "src/liquid/liquid.frag — ported shader (verbatim algorithm, uniforms promoted)"
    - "src/liquid/fullscr.vert — fullscreen-triangle vertex (verbatim from demo)"
    - "src/liquid/LiquidCanvas.ts — framework-agnostic WebGL2 engine class"
    - "src/liquid/themeBridge.ts — pure hex→uniform bridge (theme change only)"
    - "src/liquid/defaultTheme.ts — default theme reproducing the demo's exact values"
    - "src/liquid/types.ts — LiquidTheme / LiquidUniforms / LiquidCanvasOptions interfaces"
    - "src/liquid/LiquidBackground.tsx — thin React wrapper (portal to document.body)"
    - "src/liquid/mount.ts — vanilla mountLiquidBackground() helper"
    - "src/liquid/index.ts — public API barrel"
    - "src/liquid/liquid.css — .liquid-canvas + .liquid-base-layer stacking contract"
    - "src/App.tsx + src/main.tsx — dev page mounting <LiquidBackground/> + theme switcher"
    - "vite.config.ts, package.json, index.html — Vite 8 + react-ts + vite-plugin-glsl toolchain"
    - "src/liquid/__tests__/*.test.ts(x) — contract test suite (Vitest + jsdom)"
  key_links:
    - "theme prop → themeToUniforms() → gl.uniform* (NO recompile on theme change)"
    - "<LiquidBackground/> useEffect → new LiquidCanvas().start() on mount; .dispose() on unmount"
    - "canvas portaled to document.body as a DIRECT child (no transformed/opacity ancestor) → backdrop-filter-safe root stacking context"
    - ".frag/.vert → vite-plugin-glsl import as strings → LiquidCanvas compile/link (WebGL2-first, highp→mediump fallback)"
---

## Phase Goal

**As a** frontend integrator, **I want to** mount a theme-token-driven `<LiquidBackground/>` component that renders the verbatim domain-warped liquid shader on a fixed full-screen canvas, **so that** the system-wide liquid motif is production-ready to embed behind any app screen without hand-wiring WebGL, and its palette/speed/warp can be re-skinned at runtime by theme tokens.

> Source: ROADMAP Phase 2 Goal — "液态背景从独立 demo 进化为生产可用、可集成的组件，shader 原样移植到目标技术栈，配色/速度/扭曲提升为 uniform 并由主题 token 驱动。"

<objective>
Port the standalone `liquid-demo.html` domain-warped fbm liquid shader into a production-ready, reusable, theme-token-driven component on a Vite 8 + React-TS + vite-plugin-glsl toolchain. The shader algorithm is ported **verbatim** (Ashima snoise, 5-octave fbm, 2-pass domain warp, 5-color mix chain) — only the five palette colors, dark base, intensity, speed, and warp are promoted to GL uniforms driven by a `LiquidTheme`. A vanilla-WebGL2 `LiquidCanvas` engine class owns context/compile/link/rAF/resize/cleanup; a thin `<LiquidBackground/>` React wrapper (portal to `document.body`) and a vanilla `mountLiquidBackground()` helper integrate it. The canvas is fixed at z:10 in the root stacking context with a z:0 solid base-colored floor div behind it. The rAF loop is structured as `start()/stop()/renderOnce()` from day one (Phase 3 will gate it); full poster pipeline is Phase 3, reduced-motion is Phase 4, liquid-element differentiators are Phase 5 — none of those are built here.

Purpose: Turn the proven demo into the stable, integrable, themeable foundation that Phases 3–7 build on (degradation, accessibility, differentiators, integration spec, QA all derive from this component's palette/motion language).
Output: A runnable `npm run dev` page showing flowing+morphing liquid driven by `defaultTheme`, a theme switcher proving runtime uniform-driven theming, a green contract test suite, and a clean `npm run build`.
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-production-webgl-liquid-component/RESEARCH.md
@liquid-demo.html
</context>

<scope_boundaries>
IN SCOPE (VISUAL-02 only):
- Vite 8 + react-ts + vite-plugin-glsl scaffold
- Verbatim shader port (.frag/.vert) with palette/base/intensity/speed/warp → uniforms
- ThemeBridge + defaultTheme (reproduces demo) + LiquidTheme contract
- LiquidCanvas engine: WebGL2-first context, highp→mediump declaration fallback, start/stop/renderOnce, resize/DPR clamp, context-loss onError, setTheme (no recompile)
- <LiquidBackground/> React wrapper (portal to body) + mount.ts vanilla helper + index.ts barrel
- Stacking-context contract + dev-mode ancestor guard + z:0 solid base floor div
- Dev page with theme switcher proving runtime theming
- Contract test suite (Vitest + jsdom)

OUT OF SCOPE (explicitly deferred — do NOT build):
- Phase 3 (VISUAL-03): qualityScale tiers, visibilitychange gating, full themed WebP poster pipeline, save-data/low-power heuristics. ONLY reserve z:0 with a solid base-colored div now.
- Phase 4 (VISUAL-04): prefers-reduced-motion freeze, no-WebGL poster fallback, cheaper-mediump octave-reduced shader variant. ONLY implement the highp→mediump declaration fallback here.
- Phase 5 (DESIGN-03/04/05): liquid element differentiators (logo/nav/buttons/avatar), static-canvas verification.
- DO NOT scaffold a full app shell / glass panels / nav / screens (later phases).
</scope_boundaries>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Vite 8 react-ts + vite-plugin-glsl toolchain + dev shell with z:0 base floor</name>
  <files>package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx, src/liquid/liquid.css, src/liquid/__tests__/setup.ts</files>
  <action>
Scaffold a Vite 8 react-ts project in the workspace root (the folder is currently a pure design folder with no package.json). Run the Vite react-ts template to produce package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx. Then add dev dependencies: vite-plugin-glsl@1.6.1, vitest, @testing-library/react, @testing-library/jest-dom, jsdom. Configure vite.config.ts with both the React plugin and the glsl() plugin (so .frag/.vert import as strings), plus a Vitest `test` block using environment jsdom, globals true, and setupFiles pointing to src/liquid/__tests__/setup.ts (which registers @testing-library/jest-dom matchers).

Create src/liquid/liquid.css defining the stacking-context contract (per RESEARCH Pattern 4): `.liquid-canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; display: block; }` with NO transform/opacity/will-change/filter/backdrop-filter/mask/clip-path/perspective/contain/isolation/mix-blend-mode. Define `.liquid-base-layer { position: fixed; inset: 0; z-index: 0; }` (the Phase-2 solid floor; full poster is Phase 3). Also set html, body, #root to have none of the context-creating properties above so the canvas (portaled to body) sits in the root stacking context.

src/App.tsx: render the z:0 base floor div (background #0A0A0F via inline style or a class) plus a placeholder mount point for <LiquidBackground/> (wired in Task 5). src/main.tsx: standard React 19 createRoot mount. index.html: keep `<div id="root">` as a direct child of body with no transformed ancestors.

Pin versions in package.json (vite 8.2.0, vite-plugin-glsl 1.6.1, react/react-dom 19, vitest, testing-library, jsdom). Per RESEARCH Package Legitimacy Audit, vite and vite-plugin-glsl carry a false-positive SUS recency flag but are canonical, high-download, real-repo packages with NO postinstall scripts — verify `npm view <pkg> scripts.postinstall` is empty before trusting the install (captured in verify).
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npm install && npx vite build && npx vitest run --reporter=dot 2>&1 | tail -5</automated>
    <human-check>Inspect package.json: confirm vite 8.2.0, vite-plugin-glsl 1.6.1, react/react-dom 19, vitest are pinned and that `npm view vite-plugin-glsl scripts.postinstall` and `npm view vite scripts.postinstall` both print empty (no supply-chain execution). Run `npm run dev` and confirm the page serves a dark #0A0A0F base floor with no console errors.</human-check>
  </verify>
  <done>Vite dev server serves; `npm run build` compiles; Vitest runs (0 tests, no config errors); the z:0 base floor div renders dark #0A0A0F; html/body/#root have no context-creating CSS properties. Traces: SC1 (canvas shell scaffolded), SC3 (stacking contract + z:0 reserved), SC4 (clean build).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Verbatim shader port — fullscr.vert + liquid.frag with palette/base/intensity/speed/warp promoted to uniforms</name>
  <files>src/liquid/fullscr.vert, src/liquid/liquid.frag, src/liquid/__tests__/uniforms.test.ts</files>
  <behavior>
    - liquid.frag declares `uniform vec3 u_color[5]`, `uniform vec3 u_base`, `uniform float u_intensity`, `uniform float u_speed`, `uniform float u_warp` (plus existing u_res, u_time).
    - The demo's five named palette variables and the dark base literal are ABSENT from liquid.frag (replaced by u_color[0..4] / u_base).
    - snoise, fbm, the domain-warp structure (q→r→f), and the color-mix chain are byte-identical to liquid-demo.html.
    - The color-mix section references u_color[0..4]; u_warp multiplies the q and r feedback (2.0 and 2.5=2.0×1.25); u_speed multiplies u_time; u_intensity scales the color term; u_base is the dark addend.
    - Algorithm constants (uv-scale 1.35, noise offsets, 0.6 pink weight, 0.32 vignette) remain literal floats — they are NOT themeable.
  </behavior>
  <action>
Depends on Task 1 (needs vite-plugin-glsl to compile .frag/.vert imports).

Create src/liquid/fullscr.vert as the verbatim fullscreen-triangle vertex from liquid-demo.html (attribute vec2 a_pos; gl_Position = vec4(a_pos,0.0,1.0)).

Create src/liquid/liquid.frag by porting liquid-demo.html's FRAG block BYTE-FOR-BYBYTE in algorithm, promoting only five categories of literal to uniforms per RESEARCH Pattern 1: the five palette color literals → `uniform vec3 u_color[5]`; the dark base → `uniform vec3 u_base`; intensity (was 0.9) → `uniform float u_intensity`; speed (was the 0.05 u_time multiplier) → `uniform float u_speed`; warp (was 2.0 for q feedback and 2.5 for r feedback) → `uniform float u_warp` (use u_warp for q and u_warp*1.25 for r so default u_warp=2.0 reproduces the demo exactly). Keep `precision highp float;` as the declaration (WebGL2 mandates highp; the declaration fallback for WebGL1 is handled by the engine in Task 4, not by editing this file). Keep u_res and u_time as uniforms. The snoise function (Ashima 3D simplex, MIT), the 5-octave fbm loop, the two-pass domain warp (q then r then f), the smoothstep color-mix chain, the intensity smoothstep, the vignette, and gl_FragColor output must all stay identical to the demo. Do NOT rewrite, "optimize", or change octave count.

Write src/liquid/__tests__/uniforms.test.ts asserting: (1) the five uniform declarations exist in the imported liquid.frag source string; (2) the demo's five named palette variables and the base literal are absent from the source; (3) `u_color[` appears at least 5 times (used in the mix chain); (4) the algorithm constants (1.35, 0.32, 0.6) remain present. Import the shader source via the glsl plugin (`import fragSrc from '../liquid.frag?raw'` or the default string export).
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vitest run src/liquid/__tests__/uniforms.test.ts && npx vite build</automated>
  </verify>
  <done>liquid.frag + fullscr.vert compile via vite-plugin-glsl; uniform declarations present; demo palette variable names and base literal absent; algorithm constants preserved; `vite build` succeeds (proves GLSL syntax valid). Traces: SC2 (uniforms exposed, hot path free of hardcoded color literals).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: ThemeBridge + defaultTheme + types — pure hex→uniform contract reproducing the demo exactly</name>
  <files>src/liquid/types.ts, src/liquid/themeBridge.ts, src/liquid/defaultTheme.ts, src/liquid/__tests__/themeBridge.test.ts</files>
  <behavior>
    - hexToVec3('#4ADE80') ≈ [0.290, 0.871, 0.502] (within 1e-3); malformed hex (wrong length / non-hex chars) throws.
    - themeToUniforms(defaultTheme).u_color is a Float32Array of length 15 whose values reproduce the demo's five palette vec3 tuples.
    - themeToUniforms(defaultTheme).u_base ≈ [0.039, 0.039, 0.059]; u_intensity === 0.9; u_speed === 0.05; u_warp === 2.0.
    - Numeric theme fields are clamped/validated: intensity to [0,1], speed to ≥0, warp to >0.
  </behavior>
  <action>
Depends on Task 2 (LiquidUniforms must match the GLSL uniform names declared in liquid.frag).

Create src/liquid/types.ts with interfaces: `LiquidTheme { colors: [string,string,string,string,string]; base: string; intensity: number; speed: number; warp: number }`, `LiquidUniforms { u_color: Float32Array; u_base: [number,number,number]; u_intensity: number; u_speed: number; u_warp: number }`, `LiquidCanvasOptions { canvas: HTMLCanvasElement; theme: LiquidTheme; dprCap?: number; onError?: (e: Error) => void }`.

Create src/liquid/themeBridge.ts: `hexToVec3(hex)` parses a #RRGGBB string strictly (reject malformed input by throwing), returning [r,g,b] in 0..1. `themeToUniforms(theme)` validates and clamps numeric fields (intensity 0..1, speed ≥0, warp >0; reject malformed hex) and returns a LiquidUniforms with u_color as `new Float32Array(theme.colors.flatMap(hexToVec3))`. This function runs on THEME CHANGE ONLY — never per frame.

Create src/liquid/defaultTheme.ts exporting `defaultTheme: LiquidTheme` reproducing the demo's exact values as hex: colors = ['#A78BFA','#60A5FA','#4ADE80','#FB7185','#F472B6'] (violet/blue/green/coral/pink), base = '#0A0A0F', intensity = 0.9, speed = 0.05, warp = 2.0. These hex values are the theme-token contract (the CSS-var mapping in RESEARCH Pattern 2 is the future binding; defaultTheme is the stable default).

Write src/liquid/__tests__/themeBridge.test.ts covering the behavior cases above, including that defaultTheme reproduces the demo's numeric vec3 values (cross-check against the known demo tuples).
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vitest run src/liquid/__tests__/themeBridge.test.ts</automated>
  </verify>
  <done>themeToUniforms + hexToVecs unit tests green; defaultTheme numeric values equal the demo's source literals; malformed input rejected; numeric fields clamped. Traces: SC2 (theme-token driven by construction; hot path free of parsing/literals).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: LiquidCanvas engine — WebGL2-first, precision fallback, start/stop/renderOnce, resize/DPR, context-loss onError, setTheme no-recompile</name>
  <files>src/liquid/LiquidCanvas.ts, src/liquid/__tests__/LiquidCanvas.test.ts</files>
  <behavior>
    - Constructor acquires a WebGL2 context first (getContext('webgl2', {antialias:false, alpha:false, powerPreference:'high-performance'})), falling back to 'webgl' then 'experimental-webgl'; if all fail, calls onError and does not throw.
    - Shader links with highp; on a WebGL1-only context where highp link fails, recompiles the fragment with the mediump precision declaration and relinks (declaration fallback only — NO octave reduction; the cheaper-mediump shader variant is Phase 4).
    - start() begins a requestAnimationFrame loop that pushes u_time every frame and draws the fullscreen triangle; stop() cancels rAF without destroying the context; renderOnce(time?) draws exactly one frame.
    - resize() clamps devicePixelRatio to dprCap (default 2, preserving the demo), sets canvas.width/height, gl.viewport, and u_res to the drawing-buffer size.
    - setTheme(theme) pushes the new uniforms via gl.uniform* WITHOUT recompiling or relinking the program.
    - webglcontextlost listener calls onError and stops the loop; the caller (Phase 3 poster) handles the fallback — Phase 2 only surfaces the error so the z:0 base floor (Task 1) prevents a black void.
    - dispose() deletes GL resources, removes listeners, and cancels rAF.
  </behavior>
  <action>
Depends on Task 2 (.frag/.vert) and Task 3 (types + themeBridge + defaultTheme).

Implement src/liquid/LiquidCanvas.ts per RESEARCH Pattern 5 and the Code Examples (core loop skeleton, resize with DPR clamp). Acquire the WebGL2-first context (Pattern 3). Implement `linkWithPrecision`: compile+link with the highp liquid.frag source; if LINK_STATUS is false AND the context is NOT WebGL2, recompile the fragment source with the precision declaration swapped to mediump and relink (string-replace the precision line only — do not touch the algorithm). On WebGL2, highp always links so no fallback is needed.

Structure the loop as start()/stop()/renderOnce() from day one (Pitfall 4 guardrail) even though Phase 2 only calls start() — Phase 3 will add visibilitychange/reduced-motion gating onto this structure without refactor. Keep a startT timestamp; pushTime computes (now-startT)/1000 and calls gl.uniform1f(uTime, t). Draw with gl.drawArrays(gl.TRIANGLES, 0, 3) over the fullscreen-triangle buffer (Float32Array([-1,-1, 3,-1, -1,3])). Implement resize() with Math.min(devicePixelRatio||1, dprCap). Implement setTheme() to call themeToUniforms and push u_color (gl.uniform3fv), u_base (gl.uniform3f), u_intensity/u_speed/u_warp (gl.uniform1f) — never recompile. Register webglcontextlost → onError + stop(). dispose() cleans up.

Write src/liquid/__tests__/LiquidCanvas.test.ts in jsdom. Since jsdom has no real GL, stub canvas.getContext to return a mock GL object recording uniform calls and drawArrays calls; assert: start() schedules rAF and drawArrays is invoked; stop() cancels rAF; renderOnce(1.5) pushes u_time=1.5 and draws one frame then does NOT continue; setTheme() calls gl.uniform3fv with a 15-length array and does NOT call createShader/compileShader/linkProgram again; onError fires when getContext returns null. (Real-GPU rendering is verified manually in Task 7.)
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vitest run src/liquid/__tests__/LiquidCanvas.test.ts && npx vite build</automated>
  </verify>
  <done>Engine unit tests green (mock-GL): start/stop/renderOnce behave; setTheme pushes uniforms without recompile; context-loss → onError; no-GL → onError (no throw). `vite build` compiles the TS. Traces: SC1 (reusable engine), SC2 (uniforms pushed, no recompile), SC4 (precision safety — highp→mediump fallback).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 5: LiquidBackground React wrapper (portal to body) + mount.ts helper + stacking-context dev guard</name>
  <files>src/liquid/LiquidBackground.tsx, src/liquid/mount.ts, src/liquid/index.ts, src/liquid/__tests__/LiquidBackground.test.tsx, src/liquid/__tests__/stacking-context.test.ts, src/App.tsx</files>
  <behavior>
    - <LiquidBackground theme={defaultTheme}/> renders a <canvas class="liquid-canvas"> as a DIRECT child of document.body via React portal, with z:10, pointer-events:none, position:fixed.
    - On mount it instantiates LiquidCanvas with the theme and calls start(); on unmount it calls dispose() (no leaked rAF / GL context).
    - A dev-mode stacking-context guard walks canvas.parentNode (from document.body down) and console.warns if any ancestor's computed style has transform/opacity/will-change/filter/backdrop-filter/mask/clip-path/perspective/contain/isolation/mix-blend-mode.
    - mountLiquidBackground(container, theme, opts) returns { unmount } for non-React contexts.
    - index.ts barrel exports LiquidBackground, mountLiquidBackground, defaultTheme, LiquidTheme/LiquidUniforms types, LiquidCanvas.
  </behavior>
  <action>
Depends on Task 4 (LiquidCanvas engine) and Task 1 (liquid.css stacking contract).

Implement src/liquid/LiquidBackground.tsx: a React component accepting `{ theme?, className?, dprCap?, onError? }` (default theme = defaultTheme). Use `createPortal` to render the <canvas className={`liquid-canvas ${className||''}`}> into document.body so it is a direct child of body regardless of where <LiquidBackground/> sits in the React tree — this honors RESEARCH Pattern 4's "direct child of <body>" contract robustly within React. In a useEffect, instantiate `new LiquidCanvas({ canvas, theme, dprCap, onError })`, call `.start()`, and run the dev-mode stacking-context guard (walk parentNode chain from canvas up to document.body, read getComputedStyle on each ancestor, console.warn on any context-creating property — guard behind import.meta.env.DEV so it never ships to production). Return a cleanup that calls `.dispose()`. When the theme prop changes, call `liquidCanvas.setTheme(theme)` (effect dependency on theme).

Implement src/liquid/mount.ts: `mountLiquidBackground(container, theme?, opts?)` that creates a canvas, appends it to container (should be document.body), instantiates LiquidCanvas, starts it, and returns `{ unmount() }` calling dispose + removeChild.

Create src/liquid/index.ts barrel exporting the public API.

Update src/App.tsx to mount <LiquidBackground theme={defaultTheme}/> (the portal handles body placement) alongside the z:0 base floor div from Task 1 — after this task the dev page shows flowing liquid for the first time.

Write src/liquid/__tests__/LiquidBackground.test.tsx (jsdom + testing-library): render <LiquidBackground/>, assert a canvas with class liquid-canvas exists as a child of document.body, assert computed z-index 10 and pointer-events none, assert unmount removes it. Write src/liquid/__tests__/stacking-context.test.ts: mount the canvas, then programmatically give a synthetic ancestor a `transform` and assert the dev guard emits a console.warn (and that with no context-creating ancestors it warns nothing).
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vitest run src/liquid/__tests__/LiquidBackground.test.tsx src/liquid/__tests__/stacking-context.test.ts && npx vite build</automated>
    <human-check>Run `npm run dev` and confirm flowing+morphing liquid is now visible behind the dark base floor (liquid first visible). Open DevTools → confirm the <canvas class="liquid-canvas"> is a direct child of <body>, computed z-index 10, pointer-events none, and that NO transform/opacity/will-change appears on body/html/#root or the canvas. Console must be clean (no stacking-guard warnings on a correctly-mounted page).</human-check>
  </verify>
  <done><LiquidBackground/> mounts a fixed z:10 pointer-events:none canvas as a direct child of body; liquid renders on the dev page; unmount disposes the engine; dev guard warns only when an ancestor creates a stacking context; index.ts barrel complete. Traces: SC1 (the reusable <LiquidBackground/> component), SC3 (root stacking context enforced + guarded).</done>
</task>

<task type="auto">
  <name>Task 6: Runtime theme-drive demo — theme switcher proving uniform-driven theming without recompile</name>
  <files>src/App.tsx, src/liquid/defaultTheme.ts</files>
  <action>
Depends on Task 5 (<LiquidBackground/> mounted and rendering) and Task 3 (LiquidTheme contract).

Extend src/App.tsx with a small theme-switcher control (a couple of buttons or a select) that swaps the `theme` prop passed to <LiquidBackground/> between `defaultTheme` and at least one alternate `LiquidTheme` (e.g., a "warm" variant with different palette hex values, same base/intensity/speed/warp). This PROVES at runtime that the palette/speed/warp are uniform-driven by theme tokens: clicking the switcher changes the liquid's colors live WITHOUT a shader recompile and WITHOUT a page reload (setTheme path from Task 4). Add an alternate theme export (e.g., `warmTheme`) to defaultTheme.ts or a new themes file.

Also expose a speed/warp tweak (e.g., a slider or a second button) to demonstrate u_speed and u_warp are live uniforms — slowing the flow or intensifying the warp at runtime. Keep the control minimal and clearly labeled; this is a dev QA harness, not production UI (production app shell is a later phase).

The point of this task is observable proof of SC2 ("由主题 token 驱动"): a reviewer can change the theme and SEE the liquid re-skin instantly with no console errors and no shader recompile log.
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vite build && npx vitest run --reporter=dot 2>&1 | tail -3</automated>
    <human-check>Run `npm run dev`. (1) Confirm flowing+morphing liquid renders. (2) Click the theme switcher: confirm the liquid palette changes INSTANTLY (same flowing motion, different colors) with no page reload and no shader-compile console output — proving setTheme pushes uniforms without recompile. (3) Tweak speed/warp: confirm the flow slows/speeds and warp intensifies live. (4) Console stays clean throughout.</human-check>
  </verify>
  <done>Theme switcher re-skins the liquid live via setTheme (no recompile, no reload); speed/warp tweaks mutate motion live; console clean. Traces: SC2 (theme tokens drive uniforms at runtime), SC4 (healthy-GPU render, no console errors).</done>
</task>

<task type="auto">
  <name>Task 7: Phase verification gate — prove all 4 success criteria on a healthy GPU</name>
  <files>src/liquid/__tests__/*.test.ts(x)</files>
  <action>
Depends on Tasks 1–6 (all components built and wired).

This is the formal Phase 2 verification task. Run the full automated contract suite and execute the manual visual-QA checklist that proves all four VISUAL-02 success criteria on the available healthy GPU. Do NOT implement new features here — only verify and fix any regression found.

Automated suite (must all be green): themeBridge.test, uniforms.test, LiquidCanvas.test, LiquidBackground.test, stacking-context.test, plus `npx vite build` (proves .frag/.vert compile and TS typechecks). These cover the CONTRACT: uniform declarations present, palette literals absent, defaultTheme reproduces the demo, engine start/stop/renderOnce/setTheme/no-recompile/context-loss, canvas placement, stacking-context guard.

Manual visual QA (run `npm run dev`, compare side-by-side with liquid-demo.html opened directly in another tab):
- SC1: <LiquidBackground/> renders a fixed full-screen canvas at z:10 with pointer-events:none; it is a reusable component mounted with no manual WebGL wiring. Confirm via DevTools Elements panel.
- SC2: u_color[5]/u_base/u_intensity/u_speed/u_warp are uniforms (confirmed by uniforms.test + the live theme switcher from Task 6 changing colors without recompile); the shader hot path has zero hardcoded color literals (uniforms.test). Confirm the theme switcher re-skins live.
- SC3: the canvas is in the root stacking context — DevTools computed styles show NO transform/opacity/will-change/filter/contain/isolation on body, html, #root, or the canvas; the dev-mode stacking guard emits NO warnings on a correctly-mounted page. (To prove the guard works, temporarily nest the canvas under a transformed div and confirm a warning fires — then revert.)
- SC4: on the healthy GPU, the liquid renders flowing+morphing motion visually indistinguishable from liquid-demo.html; the browser console shows ZERO errors/warnings during load, animation, and theme switching.

If any criterion fails, fix the regression in the relevant task's files (do not expand scope). Document the manual QA result (pass/fail per criterion) in the phase SUMMARY.
  </action>
  <verify>
    <automated>cd "/Users/niuniu/Desktop/exe的ui" && npx vitest run && npx vite build</automated>
    <human-check>Open `npm run dev` and liquid-demo.html side by side. Walk the SC1–SC4 checklist above. All four must pass: reusable fixed z:10 pointer-events:none canvas (SC1); uniforms theme-token-driven with live re-skin and no hardcoded color literals (SC2); root stacking context with no context-creating ancestors and a clean dev guard (SC3); flowing+morphing render visually matching the demo with a clean console (SC4). Record pass/fail per criterion.</human-check>
  </verify>
  <done>Full automated contract suite green; `vite build` clean; manual QA confirms all four VISUAL-02 success criteria pass on the healthy GPU with a clean console; visual parity with liquid-demo.html confirmed. Traces: SC1, SC2, SC3, SC4 (all).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| npm registry → local node_modules | Build-time dependency install crosses the supply-chain boundary (vite, vite-plugin-glsl, react, vitest). |
| LiquidTheme prop (caller) → LiquidCanvas engine | Runtime theme values (hex strings, numbers) cross into GL uniform setters. |
| GPU/WebGL context → page | Context-loss events arrive asynchronously from the GPU/browser. |
| Shader source → GPU compiler | Static build-time .glsl files compiled by the GPU (no user-supplied GLSL). |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-02-SC | Tampering | npm installs (vite, vite-plugin-glsl, react, vitest) | high | mitigate | Pin exact versions in package.json (Task 1); verify `npm view <pkg> scripts.postinstall` is empty for every installed package (no supply-chain execution at install time); RESEARCH Package Legitimacy Audit confirmed vite/vite-plugin-glsl SUS flags are false-positive recency signals on canonical high-download real-repo packages with no postinstall. Human confirms the pinned package list (Task 1 human-check). |
| T-02-01 | Tampering | LiquidTheme input (hex strings, numbers) | medium | mitigate | hexToVec3 strictly parses #RRGGBB and throws on malformed input (Task 3); numeric fields clamped/validated (intensity 0..1, speed ≥0, warp >0). No innerHTML/dangerouslySetInnerHTML — className applied via React (auto-escaped). |
| T-02-02 | Denial of Service | WebGL context (memory-pressure loss on mobile Safari) | medium | mitigate | webglcontextlost listener calls onError and stops the loop (Task 4); the z:0 solid base floor (Task 1) prevents a black void. Full themed-poster recovery is Phase 3; Phase 2 only surfaces the error safely. |
| T-02-03 | Information Disclosure | Shader compile/link failure logs | low | mitigate | Compile/link failures route through onError, never crash the page; verbose GL internals are logged only in dev (import.meta.env.DEV) and stripped from production builds. |
| T-02-04 | Tampering | Shader source injection | low | accept | Shader source is static build-time .glsl files imported via vite-plugin-glsl — never concatenated from user input. No runtime GLSL evaluation. N/A in Phase 2. |
</threat_model>

<verification>
**Automated (per commit / phase gate):**
- `npx vitest run` — full contract suite: themeBridge (hex→vec3 + defaultTheme reproduces demo), uniforms (declarations present, palette literals absent, algorithm constants preserved), LiquidCanvas (start/stop/renderOnce, setTheme no-recompile, context-loss onError, no-GL onError), LiquidBackground (canvas as body child, z:10, pointer-events:none, unmount cleanup), stacking-context (dev guard warns on transformed ancestor, silent on clean mount).
- `npx vite build` — compiles .frag/.vert via vite-plugin-glsl (catches GLSL syntax errors) and typechecks TS.

**Manual visual QA (phase gate, healthy GPU):**
- `npm run dev` renders flowing+morphing liquid visually matching liquid-demo.html (SC4).
- Theme switcher re-skins live without recompile (SC2).
- DevTools confirms fixed z:10 pointer-events:none canvas as a direct child of body with no context-creating ancestors; dev guard silent (SC1, SC3).
- Console clean across load, animation, and theme switching (SC4).

**Out of Phase-2 scope (deferred verification):** real mediump/iPhone precision validation (Phase 4/7), degradation-tier exercise T1→T2→T3 (Phase 3), cross-device GPU perf (Phase 7), prefers-reduced-motion freeze (Phase 4).
</verification>

<success_criteria>
1. **SC1** — `<LiquidBackground/>` renders the verbatim domain-warped fbm shader as a reusable component on a fixed full-screen canvas (z:10, pointer-events:none). [Tasks 1, 4, 5, 7]
2. **SC2** — u_color[5]/u_base/u_intensity/u_speed/u_warp are GL uniforms; theme tokens drive them at runtime with no recompile; the shader hot path has zero hardcoded color literals. [Tasks 2, 3, 4, 6, 7]
3. **SC3** — canvas in the root stacking context (no transform/opacity/will-change/filter/contain/isolation ancestor); backdrop-filter sampling not silently broken; dev guard enforces it. [Tasks 1, 5, 7]
4. **SC4** — on a healthy GPU the component renders flowing+morphing liquid with zero console errors. [Tasks 4, 5, 6, 7]
</success_criteria>

<output>
Create `.planning/phases/02-production-webgl-liquid-component/02-01-SUMMARY.md` when done. Record per-criterion pass/fail from the Task 7 manual QA.
</output>
