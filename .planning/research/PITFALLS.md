# Pitfalls Research

**Domain:** WebGL fragment-shader liquid-gradient background + glassmorphism UI (desktop web app, dark base)
**Project:** 灵犀 Nexus
**Researched:** 2026-07-30
**Confidence:** HIGH (claims verified against current sources + the project's own `liquid-demo.html`)

> Scope note: this file is the pitfalls dimension only. It is grounded in the actual shipped `liquid-demo.html` (full-screen triangle, `precision highp float`, 8× `fbm` domain-warp ≈ 40 `snoise` evals/pixel/frame, `backdrop-filter: blur(26px) saturate(1.2)`, `requestAnimationFrame` with no gating) and the project's already-observed `capture_screenshot` ADAPTER_TIMEOUT on SCREEN-blend + multi-radial-gradient.

---

## Critical Pitfalls

### Pitfall 1: `backdrop-filter` blur over an *animated* canvas = per-frame re-blur storm

**What goes wrong:**
The glass panel sits directly over a `requestAnimationFrame`-driven WebGL canvas. Every animation frame the canvas repaints, which invalidates the backdrop of every `backdrop-filter` element above it. The browser must re-capture the backdrop, re-run the Gaussian convolution, and re-composite — *every frame, for the full area of every glass element*. `liquid-demo.html` uses `blur(26px)`, a large radius whose kernel cost grows with radius. The result is a multiply: (shader cost per frame) × (blur recompute per frame) × (number of glass surfaces). This is the single most expensive combination in the whole stack.

**Why it happens:**
`backdrop-filter` is documented as "among the most computationally expensive CSS features" specifically because it re-rasterizes and re-filters the backdrop on any change behind it. A static backdrop is cheap (cached once); an animated backdrop defeats that cache entirely. Developers see 60fps on their M-series Mac and ship it; integrated-GPU laptops and phones drop to 15–30fps with the fans on.

**How to avoid:**
- **Decouple the blur from the live canvas.** Render the liquid into the canvas, but do *not* put `backdrop-filter` glass directly over it. Instead, either (a) snapshot the canvas to a texture at low FPS (e.g. 8–12fps) and blur *that* static texture behind the glass, or (b) give glass panels a semi-opaque dark tint + a *static* pre-blurred pseudo-element that approximates the liquid, refreshed only on tab focus / resize.
- **Cap blur radius.** `blur(8px)` is meaningfully cheaper than `blur(26px)`. Re-evaluate whether 26px is design-load-bearing or habitual; pair a smaller blur with `saturate()`/`brightness()` to recover perceived depth.
- **Limit simultaneous glass surfaces.** One frosted modal is fine; a sticky header + sidebar + tooltip + modal all using `backdrop-filter` over the same animated canvas compounds linearly. Audit every glass surface and convert non-essential ones to solid translucent `background`.
- **`@supports` fallback** to a solid translucent background where `backdrop-filter` is unsupported or where a runtime perf flag trips.
- **`contain: layout paint`** on glass elements to bound the repaint surface.

**Warning signs:**
- DevTools Performance → long "Composite Layers" / "Paint" tasks every frame; "Layer Tree" shows a non-cached backdrop layer.
- Frame rate fine on dev Mac, collapses on an Intel-UHD laptop or any phone.
- Fans spin up on the login page alone (no other work happening).

**Phase to address:**
"Liquid + glass integration" phase — *before* glass is laid on top of the canvas. Architecting the decoupling here is far cheaper than retrofitting. Verify with a 60s profile on an integrated-GPU laptop.

---

### Pitfall 2: Full-screen fbm-in-fbm domain-warped shader melts integrated GPUs & batteries

**What goes wrong:**
The shader is genuinely heavy: `fbm` is 5 octaves of `snoise`; domain warping calls `fbm` 3× for `q`, 3× for `r`, then 1× more for `f` → **8 `fbm` = ~40 `snoise` evaluations per pixel per frame**. At 2560×1440 × DPR 2 that's ~14.7M pixels × 40 = ~590M snoise calls/frame. This is the exact workload class that "Volume Shader"-style stress tests throttle on: high FPS for 30–60s, then 20–40% sustained drop as the laptop thermals throttle. On battery, GPU clocks are further clamped. Dual-GPU laptops often hand the browser the *integrated* chip for power saving, so the discrete GPU the dev assumed is present is never used.

**Why it happens:**
Domain-warped fbm looks beautiful and reads as "liquid," so it's kept. But the cost is O(octaves × warp_passes × pixels × DPR²). Devs test on desktop discrete GPUs where it's free; production runs on Intel Iris/UHD, AMD Vega iGPUs, and mobile where it is not.

**How to avoid:**
- **Adaptive resolution.** Render the shader to an offscreen buffer at 0.5×–0.75× device pixels and CSS-scale up — liquid blobs are soft, so upscaling is visually free and cuts work by 2–4×.
- **Reduce octaves / warp passes on low-tier GPUs.** Tier the shader: full 8-fbm on discrete, 4-fbm / 2-warp on integrated, static gradient on flag-failed devices. Detect via `gl.getParameter(gl.RENDERER)` + a 1s FPS probe, not `navigator.hardwareConcurrency`.
- **Cap DPR at 1.5, not 2**, for the canvas specifically (UI text can keep full DPR).
- **Slow the clock, not the resolution.** `u_time * 0.05` is already slow — good. Consider rendering at 30fps for the background (every other rAF) on low tier; UI stays 60fps.
- **`powerPreference: 'high-performance'`** on the context *and* document that users may need OS-level "high performance" browser assignment on dual-GPU laptops.
- **Pause on battery?** At minimum, throttle to 15–20fps when `document.hidden` or (if available) low-power.

**Warning signs:**
- Sustained FPS ≥ target for ~30s then steady decline (thermal throttle signature).
- Laptop body hot / fans audible on a page that "does nothing."
- Battery % drops visibly during a short demo session.
- `chrome://gpu` shows `GL_RENDERER` = `Intel ...` on a machine with an NVIDIA/AMD dGPU.

**Phase to address:**
"Performance & degradation strategy" phase (PROJECT.md Active item). Bake adaptive resolution + tiering in from the start; retrofitting resolution scaling into a working shader is invasive.

---

### Pitfall 3: `prefers-reduced-motion` ignored by the `requestAnimationFrame` loop (WCAG 2.2.2 Level A failure)

**What goes wrong:**
`liquid-demo.html`'s rAF loop runs unconditionally — no `matchMedia('(prefers-reduced-motion: reduce)')` check anywhere. A full-screen, continuously moving, domain-warping background is *exactly* the worst-offender category (parallax/looping-background class) for vestibular disorders (≈35% of adults 40+), migraine, and photosensitivity. WCAG 2.2.2 (Pause, Stop, Hide — **Level A**, not optional) requires motion >5s be pausable/stoppable. Shipping the demo as-is is a conformance failure and a real harm risk.

**Why it happens:**
Reduced-motion is treated as polish added "later." CSS `@media` overrides don't touch JS/canvas motion at all, so even a global CSS reset leaves the canvas animating. The loop has no exit condition.

**How to avoid:**
- **Gate the rAF loop on the media query, and listen for changes** (users toggle mid-session):
  ```js
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  function maybeRender(){ if (mq.matches) { /* render ONE static frame, then stop */ } else { startRAF(); } }
  mq.addEventListener('change', maybeRender);
  ```
  On `reduce`: render a single still frame (e.g. `u_time` frozen at a pleasing value) and **stop** the loop — do not keep calling rAF.
- **Opt-in pattern:** ship the static frame as the default; enable motion only under `(prefers-reduced-motion: no-preference)`. Safer because no flash of motion for users on browsers that don't support the query.
- **Also gate on `visibilitychange`** (Page Visibility API): pause rAF when tab hidden. Free battery/CPU win, independent of motion preference.
- Provide a visible pause control if the motion is ever deemed "essential" (it isn't, here — it's decorative).

**Warning signs:**
- No `prefers-reduced-motion` string anywhere in the codebase.
- Canvas keeps animating with macOS "Reduce Motion" enabled.
- Tab still pegs a CPU core when backgrounded.

**Phase to address:**
"Liquid shader component" phase — the loop is written here; bake the gate in at creation. Verify with Chrome DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" + backgrounding the tab.

---

### Pitfall 4: `precision highp float;` fails to compile on mobile / older GPUs → black screen

**What goes wrong:**
`liquid-demo.html` line 82 declares `precision highp float;` unconditionally. In WebGL1, **`highp` in the fragment shader is optional** — some mobile GPUs (and older devices) don't support it and the shader fails to *link* (note: compile can appear to succeed; only link reliably reports it). The fail path shows the `.fail` div ("当前环境不支持 WebGL"), which is misleading — WebGL *is* supported, the shader just demanded precision the GPU lacks. The user sees a broken page on exactly the devices least able to recover.

**Why it happens:**
Desktop GPUs run everything at highp, so devs never see the failure. iOS Safari additionally defaults `sampler2D` to `lowp` (fp16), causing visible jitter in sampled data unless explicitly declared `highp sampler2D` — a separate, sneaky variant of the same class. The WebGL spec leaves this loose on purpose.

**How to avoid:**
- **Detect, then branch shaders.** Don't rely on `getShaderPrecisionFormat` (Safari has a known bug here). Instead: attempt to compile+*link* a `highp` fragment shader; if `LINK_STATUS` fails, fall back to a `mediump` variant (and a simpler noise that survives 16-bit math — naive fbm domain-warp will *break* visibly at mediump, so the fallback shader should be a cheaper gradient, not the same shader at lower precision).
- **Provide a non-shader fallback too:** a static CSS radial/linear gradient approximation of the liquid for the no-WebGL / no-highp / compile-fail path. The current `.fail` text-only state is unacceptable for a product whose core value is the liquid.
- **Prefer WebGL2 where available** (`getContext('webgl2')` first) — WebGL2 mandates highp in fragment shaders, eliminating this whole class — but keep the WebGL1 path for iOS <15 and old Android.
- **Never ship a shader untested on a real iPhone.** "iOS Safari is the canary in your WebGL coal mine — if it works there, it works everywhere." The iOS Simulator is *not* a substitute (runs on Mac hardware).

**Warning signs:**
- Real iPhone (esp. older gen) shows the `.fail` div or a black canvas; desktop fine.
- `LINK_STATUS` false with a precision/overflow error in the info log.
- Visible banding/jitter in the liquid on iOS that isn't present on desktop (sampler lowp issue).

**Phase to address:**
"Cross-device QA / degradation" phase — but the *fallback architecture* (detect → branch → static CSS fallback) must be designed in the "Liquid shader component" phase so the hooks exist.

---

### Pitfall 5: Text contrast fails at bright liquid blobs (WCAG 1.4.3)

**What goes wrong:**
The shader mixes violet/blue/green/coral/pink over a `#0A0A0F` base with `inten` up to ~0.9. Bright color blobs (coral/pink/green at high intensity) are *light* — white text directly over them drops below the WCAG 1.4.3 **4.5:1** minimum (3:1 large text). Because the background *moves*, a text passage that passes contrast at one moment fails a second later as a bright blob drifts under it. The classic gradient trap applies doubly: "the average colour passes but the busiest area fails" — and here the busiest area relocates every frame.

**Why it happens:**
Contrast is checked against a static sample (or not at all). Designers verify readability in the glass panels (which have their own dark tint, so they're fine) and assume the same holds for any text placed nearer the canvas edge or in lower-opacity containers.

**How to avoid:**
- **Keep all body text inside opaque-enough containers.** The glass panel (`rgba(255,255,255,.06)` + blur) is borderline — verify the *combined* effective background behind text (canvas color × panel tint) at the worst-case (brightest) blob, not the average. If it fails, raise the panel's dark backing.
- **Reserve a "quiet zone."** Design the composition so text-bearing regions sit over the darker base + vignette, not where coral/pink blobs peak. The shader's `inten` and vignette already help; lean into it.
- **Text-shadow halo** for any text that must float over the canvas: `text-shadow: 0 1px 4px rgba(0,0,0,.8)` (a shadow color with ≥7:1 contrast vs the text) — cheap insurance.
- **Animated-background contrast test:** capture 5–10 frames across a full loop and run a contrast checker at the brightest pixel under each text block; pass = all frames ≥4.5:1.
- **Focus rings:** default browser focus rings disappear on a dark animated background — override `:focus-visible` with a 2–3px outline + offset at ≥3:1 against the busiest area.

**Warning signs:**
- White text "disappears" momentarily as a bright blob slides behind it.
- Automated contrast scan passes the static mockup but a screen recording shows failures.
- Focus ring invisible when a bright blob is behind the focused control.

**Phase to address:**
"Glassmorphism UI layer" phase (contrast for in-panel text) + "Accessibility pass" phase (floating text, focus rings). Needs the *animated* background running to test — not the static Ardot canvas (see Pitfall 6).

---

### Pitfall 6: Design-tool-vs-runtime divergence — static mockup can't represent (or even render) the liquid

**What goes wrong:**
*Already observed in this project.* The Ardot `capture_screenshot` rasterizer hits `ADAPTER_TIMEOUT` on SCREEN blend + multiple large radial gradients, forcing a retreat to a single NORMAL linear gradient that doesn't look like the real liquid. Separately, the static canvas *cannot represent animation at all* — a reviewer approving the static mockup is approving something that bears no relationship to the shipped motion (speed, blob behavior, contrast-over-time). Decisions made on the static artifact (contrast, layout balance, "is it too busy?") are unreliable for the runtime.

**Why it happens:**
Design tools rasterize a frozen frame with blend modes their screenshot backend handles poorly; motion is definitionally absent from a still. The tool's renderer is a *different* renderer than the browser's, so even "static" appearance diverges (rasterization jitter, already noted). Treating the mockup as source-of-truth guarantees the team optimizes for the wrong target.

**How to avoid:**
- **Make the live HTML the source of truth for the liquid**, not the Ardot canvas. The project already did this (`liquid-demo.html`) — keep it that way. Design reviews of the liquid must happen in a browser, against the running shader.
- **Stop fighting the screenshot backend with blend modes.** The single-NORMAL-linear-gradient compromise is correct *for the static canvas only*. Don't try to make the static canvas "look like" the runtime — annotate it as "static approximation; see liquid-demo.html for real motion."
- **Render review frames from the runtime.** For sign-off, capture a short screen recording or a few stills *from the running shader* (browser screenshot / `canvas.toDataURL`), not from Ardot. These are pixel-accurate to what users see.
- **Keep mockup and runtime in sync by contract, not by eyeball.** Define the palette, base color, and vignette as shared tokens; the shader and the Ardot file both consume them. When the palette changes, both update.
- **Document the divergence explicitly** in PROJECT.md Key Decisions (already partially done) so downstream phases don't re-litigate it.

**Warning signs:**
- Reviewers approve a static frame that looks nothing like the running demo.
- Time lost trying to make `capture_screenshot` reproduce SCREEN-blend glow.
- "It looked fine in the design" reports from QA that are actually runtime-only issues (jank, contrast-at-time-T, blob overlap).

**Phase to address:**
"Design handoff / liquid signature integration" phase — establish the HTML-as-truth workflow before components are built against the wrong reference.

---

## Moderate Pitfalls

### Pitfall 7: No graceful degradation when WebGL is unavailable (beyond a text error)

**What goes wrong:** The only fallback is a centered text string "当前环境不支持 WebGL." For a product whose core value is "会流动、会呼吸的液态视觉," a text-only failure is a brand collapse on every blocked device — and WebGL *is* blocked in some enterprise managed-browser policies, behind certain proxies, and on old hardware.

**Prevention:** Layered fallback chain: WebGL2 liquid → WebGL1 liquid (mediump-safe) → **static CSS multi-radial-gradient approximation of the palette + a subtle CSS keyframe drift** (cheap, motion-respecting, on-brand) → solid dark base. The CSS-gradient tier should look intentional, not broken. Gate each tier; never show raw error text to end users.

**Warning signs:** QA on a locked-down corporate browser shows the error div; no one has seen the CSS tier because it doesn't exist yet.
**Phase to address:** "Cross-device QA / degradation" phase (design the chain in the component phase).

---

### Pitfall 8: Shader compile/link failures on older GPUs (loop-bound & GLSL-version rules)

**What goes wrong:** WebGL1 (GLSL ES 1.00) requires `for`-loop bounds to be *constant expressions* — comparing a loop index against a `uniform` fails to compile on strict drivers (e.g. some Mali/Adreno). `liquid-demo.html`'s `for(int i=0;i<5;i++)` is safe (constant 5), but the moment someone parameterizes octave count via a uniform, it breaks. Separately, if the project later migrates to WebGL2, `gl_FragColor`/`texture2D`/`attribute`/`varying` are deprecated and must become `out vec4`/`texture`/`in`/`out` — a copy-paste migration silently fails to compile.

**Prevention:** Keep loop bounds as `const`; never drive them from uniforms in WebGL1. If migrating to WebGL2, do it as a deliberate port with a WebGL1 fallback, not an in-place edit. Always check both `COMPILE_STATUS` *and* `LINK_STATUS` (compile alone is unreliable per spec).
**Warning signs:** "Loop index cannot be compared with non-constant expression" in the info log; works on desktop, fails on specific Android.
**Phase to address:** "Liquid shader component" phase (write it right once).

---

### Pitfall 9: Background tab keeps rendering (Page Visibility) — silent battery/CPU drain

**What goes wrong:** rAF throttles in background tabs (usually to ~1fps) but the shader *compile/link/resize* state and GPU context stay live; on some platforms the canvas still composites. Users with many tabs accumulate GPU contexts. Not a crash, but a measurable battery/CPU tax for zero user value.

**Prevention:** `document.addEventListener('visibilitychange', …)` — on `hidden`, cancel the rAF and (optionally) `gl.flush()`; on `visible`, resume. Pair with the reduced-motion gate (Pitfall 3) since both touch the same loop.
**Warning signs:** Background tab still warm in Task Manager; laptop drains with the app in a background tab.
**Phase to address:** "Liquid shader component" phase (loop lifecycle).

---

### Pitfall 10: Multiple simultaneous `backdrop-filter` panels compound the per-frame cost

**What goes wrong:** Pitfall 1 is per-panel. A dashboard with a sticky glass header + a glass sidebar + glass cards + a glass modal open at once = N× the re-blur work, all over the same animated canvas. The dashboard/list-detail/settings screens (per PROJECT.md) are exactly the multi-panel case.

**Prevention:** Budget the number of live `backdrop-filter` surfaces per screen (suggest ≤2). Convert secondary glass to solid translucent `background`. For the dashboard, consider blurring a *snapshot* texture shared by all panels rather than N independent live backdrops.
**Warning signs:** Dashboard janks; login (single panel) doesn't. Frame time scales with panel count.
**Phase to address:** "Glassmorphism UI layer" phase — set the panel budget before building the multi-panel screens.

---

## Minor Pitfalls

### Pitfall 11: `will-change: backdrop-filter` / layer-promotion overuse → GPU memory blowup

**What goes wrong:** Sprinkling `will-change` or `transform: translateZ(0)` on every glass element to "fix" jank allocates a persistent GPU texture per element; on integrated GPUs with shared memory this causes memory pressure and *worse* performance.
**Prevention:** Apply `will-change` only transiently (add on interaction, remove after). Never leave it on idle decorative glass. `contain: layout paint` is the cheaper first lever.
**Phase to address:** "Glassmorphism UI layer" phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Ship `liquid-demo.html` loop with no reduced-motion/visibility gating | Fast demo | WCAG 2.2.2 Level A failure + real vestibular harm; retrofit requires reworking the loop | **Never** in production; OK for a throwaway local demo only |
| `precision highp float;` unconditional | Works on all dev machines | Black screen on a slice of mobile/old GPUs | Never — always detect+branch |
| `backdrop-filter: blur(26px)` directly over live canvas | Pixel-perfect glass in the mockup | Per-frame re-blur storm on integrated GPUs | Only with the snapshot-texture decoupling (Pitfall 1) |
| Single-NORMAL-gradient static canvas as "the liquid" | Screenshot stops timing out | Reviewers validate the wrong artifact | Acceptable *only* as an annotated approximation; never as source of truth |
| Full 8-fbm shader on every device, no tiering | One code path | Thermal throttle + battery drain on laptops/phones | Never for a system-level motif seen on every screen |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| fbm-in-fbm domain warp at full DPR | High FPS 30s then decline; hot laptop | Adaptive res (0.5–0.75×), cap DPR 1.5, tier octaves | Integrated GPU + battery, or any 4K display |
| `backdrop-filter` over animated canvas | Composite/Paint spikes every frame; jank on scroll | Snapshot texture blur; reduce radius; limit panel count | >1 glass surface, or radius ≥20px |
| rAF never paused | Background tab warm; battery drain | `visibilitychange` + reduced-motion gate | User leaves tab open; user enables Reduce Motion |
| Static mockup used for perf/contrast sign-off | "Fine in design, bad in prod" | Review against running shader; capture runtime stills | Anytime motion or time-varying contrast matters |

## UX / Accessibility Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No reduced-motion respect | Vestibular distress, nausea, migraine; WCAG 2.2.2 fail | Gate rAF on the media query; render one static frame; listen for changes |
| Text over bright drifting blobs | Intermittently unreadable text; WCAG 1.4.3 fail | Keep text in opaque-enough panels; quiet zones; text-shadow halo; test against brightest frame |
| Default focus ring on animated dark bg | Keyboard users lose focus indicator | `:focus-visible` override at ≥3:1 + offset |
| Text-only "WebGL unsupported" screen | Brand collapse on blocked/old devices | Layered fallback: WebGL2 → WebGL1 → CSS gradient drift → solid |

## "Looks Done But Isn't" Checklist

- [ ] **Liquid background:** rAF loop has reduced-motion gate + visibilitychange pause? (verify: DevTools emulate reduce-motion → canvas freezes to one frame; background tab → rAF cancelled)
- [ ] **Liquid background:** degrades to a CSS gradient (not error text) when WebGL/`highp` unavailable? (verify: disable WebGL in browser → on-brand static gradient shows)
- [ ] **Liquid background:** adaptive resolution / DPR cap on integrated GPUs? (verify: `chrome://gpu` shows Intel → canvas backing store < device pixels, FPS stable 60s+)
- [ ] **Glass panels:** ≤2 live `backdrop-filter` surfaces per screen, radius audited, `@supports` fallback? (verify: disable backdrop-filter → panels still legible)
- [ ] **Contrast:** tested against the *brightest* runtime frame under each text block, all ≥4.5:1? (verify: capture 10 frames, run checker)
- [ ] **Shader:** loop bounds are `const`, both COMPILE_STATUS and LINK_STATUS checked, tested on a real iPhone? (verify: iPhone shows liquid, not `.fail`)
- [ ] **Design handoff:** sign-off used the running shader (browser/recording), not the Ardot screenshot? (verify: review artifact is a runtime capture)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| backdrop-filter storm (Pitfall 1) | MEDIUM | Introduce snapshot texture at low FPS; re-point glass backdrop to it; reduce radius; convert excess panels to solid |
| Thermal/battery drain (Pitfall 2) | MEDIUM | Add adaptive resolution + octave tiering + FPS probe; gate on renderer string |
| No reduced-motion gate (Pitfall 3) | LOW | Wrap existing loop in matchMedia check; render one static frame on reduce; one commit |
| highp black screen (Pitfall 4) | MEDIUM | Add link-status detection + mediump fallback shader + CSS gradient tier; requires a second, simpler shader |
| Contrast fails at blobs (Pitfall 5) | LOW–MEDIUM | Raise panel dark backing / add text-shadow halo / relocate text to quiet zones |
| Mockup-vs-runtime divergence (Pitfall 6) | LOW (process) | Switch review artifact to runtime capture; annotate static canvas as approximation |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. backdrop-filter over animated canvas | Liquid + glass integration | 60s profile on integrated-GPU laptop; <1 long Paint/Composite per frame |
| 2. fbm domain-warp GPU/battery drain | Performance & degradation strategy | Sustained FPS 60s+ on Intel Iris/UHD unplugged; battery drain within budget |
| 3. prefers-reduced-motion ignored | Liquid shader component | DevTools emulate reduce-motion → one static frame; background tab → rAF cancelled |
| 4. highp compile/link failure | Liquid shader component (detect) + Cross-device QA (fallback) | Real iPhone renders liquid; WebGL-disabled → CSS gradient tier |
| 5. Contrast over dynamic bg | Glassmorphism UI layer + Accessibility pass | 10-frame brightest-pixel contrast check ≥4.5:1; focus ring ≥3:1 |
| 6. Design-tool vs runtime divergence | Design handoff / liquid signature integration | Sign-off artifact is a runtime capture, not Ardot screenshot |
| 7. No graceful degradation | Cross-device QA / degradation | Layered fallback chain exercised on each tier |
| 8. Shader compile on older GPUs | Liquid shader component | const loop bounds; LINK_STATUS checked; Mali/Adreno smoke test |
| 9. Background tab keeps rendering | Liquid shader component | visibilitychange cancels rAF; Task Manager shows idle background |
| 10. Multiple backdrop-filter panels | Glassmorphism UI layer | Panel budget ≤2 live surfaces; dashboard frame time scales acceptably |

## Sources

- colorfyi.com — Web Color Performance: Gradients, Shadows, and Filters (backdrop-filter cost, contain/@supports) — HIGH
- maviklabs.com — CSS Backdrop-Filter Performance (per-frame re-blur on animation, radius/size/layer guidance) — MEDIUM
- tsight.io — 高阶渲染博弈 / 高斯模糊性能博弈论 (offscreen buffer + Gaussian kernel per change, downsampling strategy) — MEDIUM
- webglfundamentals.org — WebGL Precision Issues (highp optional in frag shaders, Safari getShaderPrecisionFormat bug, must check LINK_STATUS) — HIGH
- enmlounge.com — Precision highp/mediump/lowp in WebGL shaders (mobile-only effect, highp-in-frag optional) — MEDIUM
- three.js issue #13288 / #16687 (iOS sampler2D defaults to lowp → jitter; declare highp sampler) — HIGH
- bugnet.io — Fix Unity WebGL Build Crashing on Safari iOS (iOS WebGL2 quirks, "iOS is the canary," real-device testing) — MEDIUM
- ask.csdn.net — Shader 编译兼容性 / GLSL 编译失败 (loop-bound const requirement, precision on mobile, gl_FragColor deprecation) — MEDIUM
- techbrood.com — "Loop index cannot be compared with non-constant expression" (WebGL1 loop bound rule) — HIGH
- specification.website / accessibilitytips.netlify.app / cssshowcase.com — prefers-reduced-motion (WCAG 2.2.2 Level A, opt-in pattern, matchMedia change listener, JS/canvas motion not covered by CSS) — HIGH
- bestbackgrounds.com — Backgrounds and accessibility (test at worst pixel not average, quiet zones, overlay, focus rings on dark bg) — HIGH
- instantgradient.com / docs.acquia.com — gradient/image contrast WCAG 1.4.3 (4.5:1, test at lightest point, overlay behind text) — HIGH
- zonotools.com / volume-shader.org / volumeshadertest.com — GPU stress test methodology (integrated GPU thermal throttle, dual-GPU power saving, battery mode) — MEDIUM
- freefrontend.com — WebGL Fluid Smoke Button (domain warping fbm; "avoid on list/grid items, drains battery"; cleanup listeners on unmount) — MEDIUM
- Project files: `.planning/PROJECT.md` (ADAPTER_TIMEOUT on SCREEN blend, static-cannot-represent-animation, perf/degradation as Active item) and `liquid-demo.html` (precision highp line 82, blur(26px), ungated rAF, 8×fbm) — HIGH (primary)

---
*Pitfalls research for: WebGL liquid-gradient + glassmorphism UI (灵犀 Nexus)*
*Researched: 2026-07-30*
