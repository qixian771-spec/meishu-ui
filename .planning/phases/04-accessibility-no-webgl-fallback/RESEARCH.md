# Phase 4: Accessibility & No-WebGL Fallback - Research

**Researched:** 2026-07-30
**Domain:** Accessibility (prefers-reduced-motion, WCAG 2.2.2), Graceful Fallback (WebGL Context Loss, No-WebGL, T1->T2->T3 Tier Chain), Observability (data-tier DOM attribute, onTierChange callback), Shader Precision Safety (highp->mediump GLSL fallback)
**Confidence:** HIGH

## Summary

Phase 4 fortifies the 灵犀 Nexus liquid background engine (`LiquidCanvas.ts` and `<LiquidBackground/>`) with strict accessibility compliance (WCAG 2.2.2) and bulletproof fallback capabilities. While Phase 3 established performance tiering (T1 full animation, T2 frozen single frame, T3 static poster) and runtime scaling (`QualityGovernor`), Phase 4 ensures the visual system liquidly respects user motion preferences, handles hardware/software WebGL failures gracefully without ever displaying a black void or canvas artifact, and exposes full end-to-end observability for automated testing and DOM inspection.

The core technical work focuses on four pillars: (1) **Dynamic `prefers-reduced-motion` integration**: updating `tierResolver.ts` to detect user motion preference upfront and adding a cross-browser `matchMedia` event listener in `<LiquidBackground/>` to dynamically transition tiers (`T1` -> `T2` when user enables reduced motion, restoring `T1` when disabled) without full component unmounting; (2) **Zero-black-screen WebGL failure & context loss recovery**: catching context creation failures and runtime `webglcontextlost` events to set `activeTier = 'T3'`, which cleanly unmounts the `<canvas>` node while keeping the persistent `PosterLayer` mounted at `z-index: 0`; (3) **End-to-end observability**: placing a `data-tier="T1" | "T2" | "T3"` DOM attribute on `<PosterLayer/>` (and/or wrapper container) and invoking the `onTierChange` callback on every tier state change; and (4) **Shader precision fallback safety**: verifying the existing `highp` -> `mediump` compilation/re-link fallback ladder in `LiquidCanvas.ts` for WebGL1 legacy/mobile GPUs.

**Primary recommendation:** Implement a dedicated `useReducedMotion` hook or `matchMedia` change listener inside `<LiquidBackground/>` that dynamically updates `activeTier` (`T1` <-> `T2`), ensure `data-tier={activeTier}` is reflected on the DOM node of `<PosterLayer/>`, handle WebGL context errors by switching to `T3`, and validate all edge cases with a dedicated Vitest test suite.

## User Constraints

> Transcribed from `.planning/ROADMAP.md` Phase 4 details and `.planning/REQUIREMENTS.md` (VISUAL-04).

### Active Requirements & Success Criteria
- **VISUAL-04 (Accessibility & No-WebGL Fallback)**: prefers-reduced-motion 冻结单帧；无 WebGL/低功耗时降级为主题化静态海报。
- **Success Criterion 1**: 开启 `prefers-reduced-motion` 时液态仅渲染一帧静态画面并停止动画循环（无持续运动），且偏好变化时实时响应 [VERIFIED: WCAG 2.2.2].
- **Success Criterion 2**: 无 WebGL（或 WebGL 上下文丢失）的设备/浏览器上展示主题化静态海报（T3），无黑屏、无破画布伪影 [VERIFIED: WebGL Context Loss Spec].
- **Success Criterion 3**: 降级链路端到端可观测（T1 动画 → T2 冻结 → T3 海报），每一级均非黑且配色一致 [CITED: DOM Attribute Observability Pattern].
- **Success Criterion 4**: shader 精度安全处理（尝试 `highp`，失败回退 `mediump`），老旧/移动 GPU 不黑屏 [VERIFIED: WebGL1 Specification].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| **Motion Preference Detection** | Browser `matchMedia` API | `tierResolver.ts` | Resolves initial tier to `T2` when `(prefers-reduced-motion: reduce)` matches. |
| **Dynamic Motion Preference Listener** | React `<LiquidBackground/>` | `MediaQueryList` Event Listener | Listens to OS/browser preference `change` events and updates `activeTier` state (`T1` <-> `T2`). |
| **Context Loss & Failure Recovery** | `LiquidCanvas.ts` Engine | `<LiquidBackground/>` State Controller | Catches context creation failure / `webglcontextlost` event, invokes `onError`, and transitions `activeTier` to `T3`. |
| **Tier Observability** | React `<PosterLayer/>` DOM Node | `onTierChange` Callback Prop | Renders `data-tier="T1"|"T2"|"T3"` attribute into the DOM and emits tier changes to parent components/tests. |
| **Shader Precision Fallback** | `LiquidCanvas.ts` Shader Compiler | WebGL Fragment Shader | Attempts GLSL compilation with `precision highp float;`; if linking fails on WebGL1, replaces with `precision mediump float;` and relinks. |
| **Zero-Black Paint Floor** | React `<PosterLayer/>` (z:0) | CSS Radial Gradients | Remains permanently mounted in DOM regardless of WebGL canvas state (T1, T2, or T3). |

## Standard Stack

### Core Web APIs & React Infrastructure
| Technology | Purpose | Why Standard |
|------------|---------|--------------|
| **Match Media API** | `window.matchMedia('(prefers-reduced-motion: reduce)')` | W3C standard for detecting OS-level reduced motion preference. [CITED: developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia] |
| **MediaQueryList Event Listener** | `mql.addEventListener('change', listener)` | Standard API for observing real-time changes to media query preferences without polling. [CITED: developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event] |
| **WebGL Context Event API** | `webglcontextlost` & `e.preventDefault()` | Standard WebGL lifecycle event for detecting GPU context loss and disabling active loops. [VERIFIED: khronos.org/registry/webgl/specs/latest/1.0/#5.15.2] |
| **WebGL Precision Format API** | `gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)` | WebGL1 standard query to check hardware support for `highp` precision float in fragment shaders. [VERIFIED: khronos.org/registry/webgl/specs/latest/1.0/#5.14.1] |
| **React 19 State & Effects** | `useState`, `useEffect`, `useRef` | Native React primitives for sync of tier state, event subscription cleanup, and DOM attribute binding. |

### Packages
*No external npm packages required.* Phase 4 utilizes 100% native browser Web APIs and existing project primitives.

## Package Legitimacy Audit

> **Audit Verdict:** Zero new external npm packages installed for Phase 4. All motion detection, context loss handling, tier state observability, and shader precision fallbacks rely on native browser APIs and built-in WebGL features.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| None (Native APIs) | N/A | N/A | N/A | N/A | [OK] | Approved (No packages needed) |

## Architecture Patterns

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Browser Environment / OS Signals                                                       │
│  - window.matchMedia('(prefers-reduced-motion: reduce)')                               │
│  - webglcontextlost event / WebGL availability                                         │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│  tierResolver.ts (Initial Tier Resolution)                                             │
│  1. No WebGL / saveData -> T3                                                          │
│  2. prefers-reduced-motion -> T2                                                       │
│  3. hardwareConcurrency <= 2 -> T2                                                     │
│  4. Healthy GPU -> T1                                                                  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Initial activeTier state
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│  <LiquidBackground/> Component                                                         │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Media Query Change Listener ('(prefers-reduced-motion: reduce)')                  │  │
│  │  - e.matches == true  => setActiveTier('T2')                                     │  │
│  │  - e.matches == false => setActiveTier(resolveInitialTier())                      │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│  ┌──────────────────────────────────────▼───────────────────────────────────────────┐  │
│  │ Context Error Handler (handleContextError)                                       │  │
│  │  - WebGL creation failure / webglcontextlost => onError(e) + setActiveTier('T3') │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│  ┌──────────────────────────────────────▼───────────────────────────────────────────┐  │
│  │ Tier Observability Sync                                                          │  │
│  │  - Triggers onTierChange(activeTier) callback                                    │  │
│  │  - Passes data-tier={activeTier} to <PosterLayer/> DOM node                      │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│         ┌───────────────────────────────┼──────────────────────────────┐               │
│         ▼                               ▼                              ▼               │
│  ┌───────────────┐              ┌───────────────┐              ┌───────────────┐       │
│  │ Tier T1       │              │ Tier T2       │              │ Tier T3       │       │
│  │ Canvas Mounted│              │ Canvas Mounted│              │ Canvas        │       │
│  │ start() loop  │              │ renderOnce()  │              │ Unmounted     │       │
│  └───────┬───────┘              └───────┬───────┘              └───────┬───────┘       │
└──────────┼──────────────────────────────┼──────────────────────────────┼───────────────┘
           │                              │                              │
           ▼                              ▼                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  DOM Output & Paint Layers                                                             │
│  - PosterLayer (z:0): <div data-tier="T1"|"T2"|"T3" data-testid="poster-layer" />      │
│  - Canvas (z:10): <canvas class="liquid-canvas" /> (Present in T1 & T2, absent in T3)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
src/liquid/
├── tierResolver.ts         # Add prefers-reduced-motion check to resolveInitialTier()
├── LiquidBackground.tsx    # Add matchMedia change listener, handleContextError, data-tier prop
├── PosterLayer.tsx         # Add data-tier attribute support for DOM inspection
├── LiquidCanvas.ts         # Maintain highp->mediump fallback & webglcontextlost listener
├── types.ts                # QualityTier ('T1' | 'T2' | 'T3')
└── __tests__/
    ├── reducedMotion.test.ts   # Vitest suite for initial detection & dynamic MQL toggling
    ├── contextLoss.test.ts     # Vitest suite for WebGL failure & context loss to T3
    ├── observability.test.tsx  # Vitest suite for data-tier attribute & onTierChange callback
    └── shaderPrecision.test.ts # Vitest suite for highp->mediump compilation fallback
```

### Pattern 1: Cross-Browser `prefers-reduced-motion` Media Query Listener
**What:** Subscribe to `window.matchMedia('(prefers-reduced-motion: reduce)')` changes inside `<LiquidBackground/>` so that when users toggle reduced motion settings in operating system / browser settings, the animation dynamically switches between `T1` (animated loop) and `T2` (frozen single frame).
**Cross-Browser Compatibility:** Modern browsers support `mql.addEventListener('change', handler)`, whereas older WebKit/Safari engines use `mql.addListener(handler)`. Implementation must check and support both methods safely.
**WCAG 2.2.2 Compliance:** Satisfies WCAG 2.2.2 Level A (Pause, Stop, Hide) by halting all continuous `requestAnimationFrame` updates when motion reduction is requested.

```typescript
// Helper function for robust matchMedia event listening
export function subscribeReducedMotion(onChange: (matches: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent | MediaQueryList) => onChange(e.matches);

  if (mql.addEventListener) {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  } else if ('addListener' in mql) {
    (mql as any).addListener(handler);
    return () => (mql as any).removeListener(handler);
  }
  return () => {};
}
```

### Pattern 2: Graceful WebGL Exception & Context Loss Recovery
**What:** Catch WebGL initialization failures and runtime `webglcontextlost` events. When an error occurs, invoke `onError?.(e)` and set `activeTier = 'T3'`.
**Why:** Unmounting the `<canvas>` node in `T3` cleans up GL resources while keeping the persistent `<PosterLayer/>` mounted at `z-index: 0`. The user experiences zero black voids, zero layout shifts, and zero broken canvas visual artifacts.

### Pattern 3: Tier Observability via DOM Attribute & Callback Contract
**What:** Render `data-tier={activeTier}` attribute on the `<PosterLayer/>` (or root wrapper element) and trigger `onTierChange?.(activeTier)` whenever `activeTier` state changes.
**Why:** Allows automated E2E tests, Vitest integration tests, and QA inspection to assert tier status directly from the DOM using `element.getAttribute('data-tier')` without exposing or inspecting internal React component state.

### Pattern 4: Shader Precision Safety Ladder (`highp` -> `mediump`)
**What:** In `LiquidCanvas.ts`, compile the fragment shader with `precision highp float;`. If WebGL1 shader compilation or linking fails, perform a string replacement to `precision mediump float;` and retry linking.
**Why:** Ensures that legacy mobile devices or older desktop WebGL1 drivers that do not support `highp` precision floats in fragment shaders still render the liquid background instead of crashing or outputting a black screen.

### Anti-Patterns to Avoid
- **Polling Media Queries:** Polling `window.matchMedia` using `setInterval` instead of registering an event listener on `MediaQueryList`.
- **Leaving Zombie Canvas in T3:** Hiding the canvas with `display: none` or `opacity: 0` in `T3` instead of unmounting it. Unmounting frees GPU memory and context state.
- **Relying Solely on React State for Test Inspection:** Failing to output `data-tier` into the DOM, making automated QA testing dependent on React internal fiber nodes.
- **Ignoring Reduced Motion Prop Overrides:** Overriding explicit user `tier` props when `prefers-reduced-motion` changes. If a `tier` prop is explicitly provided, prop override takes precedence.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Motion Preference Detection | Custom user settings UI or cookie polling | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Respects native OS accessibility settings across Windows, macOS, iOS, Android. |
| Media Query Subscription | Custom resize/scroll event listeners | `mql.addEventListener('change', ...)` | Browser fires change event precisely when OS accessibility toggle changes. |
| Fallback Rendering Engine | Secondary canvas 2D fallback renderer | `<PosterLayer/>` at `z:0` (CSS radial gradients) | Zero CPU/GPU rendering overhead; immediate paint floor; matches `LiquidTheme` palette. |
| DOM Test Inspection | Global `window.__TIER__` variables | `data-tier="T1"|"T2"|"T3"` attribute | Standard HTML5 `data-*` attribute accessible to Vitest, Playwright, Cypress, and DOM queries. |

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unremoved `matchMedia` Listeners
**What goes wrong:** Component mounts, subscribes to `matchMedia` change events, but fails to clean up the listener on unmount. Multiple listeners accumulate on re-renders or page navigation.
**How to avoid:** Return a cleanup function inside React `useEffect` that calls `mql.removeEventListener('change', handler)` or `mql.removeListener(handler)`.

### Pitfall 2: Flash of Black Void on Context Loss
**What goes wrong:** `webglcontextlost` fires, canvas becomes blank, and the component immediately removes all DOM nodes without a background floor, causing a black void during transition.
**How to avoid:** `<PosterLayer/>` is mounted continuously at `z-index: 0`. When context loss occurs, `activeTier` transitions to `T3`, unmounting the canvas while `<PosterLayer/>` remains seamlessly visible underneath.

### Pitfall 3: Broken Listener Cleanup on Older WebKit Engines
**What goes wrong:** Using `mql.addEventListener` without checking for legacy `mql.addListener` support causes `TypeError: mql.addEventListener is not a function` on older iOS/Safari versions.
**How to avoid:** Use a feature-detecting subscription helper (`subscribeReducedMotion`) that gracefully branches between `addEventListener` and `addListener`.

### Pitfall 4: Mediump Precision Artifacts on Simplex Noise
**What goes wrong:** Downscaling from `highp` to `mediump` float precision reduces 32-bit floats to 16-bit floats. In complex domain-warping simplex noise calculations (`fbm`), 16-bit float limits can cause spatial quantization artifacts or noise grid pattern breakup.
**How to avoid:** Standard WebGL2 engines mandate `highp`. The `mediump` fallback is applied *only* on WebGL1 contexts when `highp` link fails, ensuring visual availability (non-black screen) even if subtle noise grain changes occur.

## Code Examples

### 1. Updated `tierResolver.ts` with Reduced Motion Support

```typescript
// src/liquid/tierResolver.ts
import type { QualityTier } from './types';

/**
 * Evaluates browser capabilities and device hints to resolve initial QualityTier:
 * - T3: No WebGL support, WebGL context lost, or saveData enabled.
 * - T2: Reduced motion requested, low hardware concurrency (<= 2 cores).
 * - T1: Healthy GPU / multi-core system.
 */
export function resolveInitialTier(): QualityTier {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'T3';
  }

  // 1. Check WebGL availability
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'T3';
  } catch {
    return 'T3';
  }

  // 2. Check Save-Data header hint
  const nav = navigator as unknown as { connection?: { saveData?: boolean }; hardwareConcurrency?: number };
  if (nav.connection?.saveData) {
    return 'T3';
  }

  // 3. Check prefers-reduced-motion preference (WCAG 2.2.2 compliance)
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'T2';
  }

  // 4. Check Hardware Concurrency hint (low-end CPUs)
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) {
    return 'T2';
  }

  return 'T1';
}
```

### 2. Updating `<PosterLayer/>` for Observability (`data-tier`)

```typescript
// src/liquid/PosterLayer.tsx
import type { LiquidTheme, QualityTier } from './types';
import { defaultTheme } from './defaultTheme';

export interface PosterLayerProps {
  theme?: LiquidTheme;
  className?: string;
  tier?: QualityTier;
}

export function PosterLayer({ theme = defaultTheme, className, tier = 'T3' }: PosterLayerProps) {
  const [c0, c1, c2, c3, c4] = theme.colors;
  const base = theme.base;

  const style: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    display: 'block',
    backgroundColor: base,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, ${c0}77 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${c1}77 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, ${c2}66 0%, transparent 50%),
      radial-gradient(circle at 15% 75%, ${c3}55 0%, transparent 45%),
      radial-gradient(circle at 85% 75%, ${c4}55 0%, transparent 45%)
    `,
  };

  const cls = ['liquid-base-layer', className].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={style}
      data-testid="poster-layer"
      data-tier={tier}
      aria-hidden="true"
    />
  );
}
```

### 3. Integrated `<LiquidBackground/>` with Motion Listener & Observability

```typescript
// src/liquid/LiquidBackground.tsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiquidCanvas } from './LiquidCanvas';
import { PosterLayer } from './PosterLayer';
import { defaultTheme } from './defaultTheme';
import { checkStackingContext } from './stackingGuard';
import { resolveInitialTier } from './tierResolver';
import { QualityGovernor } from './QualityGovernor';
import type { LiquidTheme, QualityTier } from './types';

export interface LiquidBackgroundProps {
  theme?: LiquidTheme;
  className?: string;
  dprCap?: number;
  tier?: QualityTier;
  onTierChange?: (tier: QualityTier) => void;
  onQualityScaleChange?: (scale: number) => void;
  onError?: (e: Error) => void;
}

export function LiquidBackground({
  theme = defaultTheme,
  className,
  dprCap,
  tier: tierProp,
  onTierChange,
  onQualityScaleChange,
  onError,
}: LiquidBackgroundProps) {
  const [activeTier, setActiveTier] = useState<QualityTier>(() => tierProp ?? resolveInitialTier());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LiquidCanvas | null>(null);
  const governorRef = useRef<QualityGovernor | null>(null);

  // Sync prop override if supplied
  useEffect(() => {
    if (tierProp !== undefined) {
      setActiveTier(tierProp);
    }
  }, [tierProp]);

  // Dynamic prefers-reduced-motion listener (only active if tier is not controlled by tierProp)
  useEffect(() => {
    if (tierProp !== undefined || typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setActiveTier('T2');
      } else {
        setActiveTier(resolveInitialTier());
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMotionChange);
      return () => mql.removeEventListener('change', handleMotionChange);
    } else if ('addListener' in mql) {
      (mql as any).addListener(handleMotionChange);
      return () => (mql as any).removeListener(handleMotionChange);
    }
  }, [tierProp]);

  // Notify parent of tier changes
  useEffect(() => {
    onTierChange?.(activeTier);
  }, [activeTier, onTierChange]);

  const handleContextError = (e: Error) => {
    onError?.(e);
    setActiveTier('T3');
  };

  useEffect(() => {
    if (activeTier === 'T3') {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const governor = new QualityGovernor({
      onQualityChange: (newScale) => {
        engineRef.current?.setQualityScale(newScale);
        onQualityScaleChange?.(newScale);
      },
    });
    governorRef.current = governor;

    const engine = new LiquidCanvas({
      canvas,
      theme,
      dprCap,
      qualityScale: governor.getQualityScale(),
      onError: handleContextError,
    });
    engineRef.current = engine;

    if (activeTier === 'T1') {
      engine.start();
    } else if (activeTier === 'T2') {
      engine.renderOnce(1.0);
    }

    if (import.meta.env.DEV) checkStackingContext(canvas);

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
      governorRef.current = null;
    };
  }, [activeTier]);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  const cls = ['liquid-canvas', className].filter(Boolean).join(' ');

  return (
    <>
      <PosterLayer theme={theme} className={className} tier={activeTier} />
      {activeTier !== 'T3' &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={cls}
            aria-hidden="true"
            data-tier={activeTier}
            style={{ position: 'fixed', inset: '0', zIndex: 10, pointerEvents: 'none', display: 'block' }}
          />,
          document.body,
        )}
    </>
  );
}
```

## State of the Art

| Dimension | Ungated Baseline | Phase 4 Complete Architecture |
|-----------|------------------|-------------------------------|
| **Motion Preference** | Motion loops continuously (WCAG violation) | `resolveInitialTier()` detects `reduce`; dynamic `matchMedia` listener switches `T1` <-> `T2` in real-time. |
| **T2 Execution Mode** | Canvas unmounted or ignored | `renderOnce(1.0)` draws 1 static frame, stops rAF, consumes 0% continuous CPU/GPU. |
| **WebGL Error / Context Loss** | Console error, possible black screen | `webglcontextlost` triggers `onError` -> `setActiveTier('T3')`, unmounting canvas safely. |
| **Fallback Paint Floor** | Static image or plain black | `<PosterLayer/>` (z:0) rendered continuously using `LiquidTheme` palette gradients; no black void. |
| **QA / Test Observability** | Requires React internal state access | `data-tier="T1"|"T2"|"T3"` DOM attribute on `<PosterLayer/>` and canvas + `onTierChange` callback. |
| **Shader Precision Safety** | Hardcoded `highp` (may fail WebGL1) | `highp` primary, fallback replacement to `mediump` on WebGL1 link failure, fallback to `T3` if link fails. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `window.matchMedia('(prefers-reduced-motion: reduce)')` is supported across all target desktop browsers. | Motion Preference | Unsupported browsers will default to `matches = false` and rely on manual `tier` prop or hardware detection. Low risk. |
| A2 | WebGL context loss can be simulated in jsdom / Vitest by dispatching a custom `webglcontextlost` event or mocking `getContext`. | Validation Architecture | Low risk; event dispatching on HTMLCanvasElement is standard DOM testing pattern. |

## Open Questions

1. **Should `data-tier` be rendered on both `<PosterLayer/>` and `<canvas>`?**
   - *Recommendation:* Yes. Putting `data-tier` on `<PosterLayer/>` guarantees it is present in the DOM even when `<canvas>` is unmounted in `T3`.

## Environment Availability

| Dependency | Required By | Available | Version / Status | Fallback |
|------------|------------|-----------|------------------|----------|
| Match Media API | Motion Reduction Check | ✓ | Standard Browser API | Default to false if unsupported |
| MediaQueryList `change` Event | Real-time Motion Toggle | ✓ | Standard Browser API | Fallback to `addListener` or static initial check |
| WebGL Context Event API | Context Loss Recovery | ✓ | Standard WebGL Specification | Unmount canvas on error |
| Vitest & DOM Testing Library | Test Automation | ✓ | Vitest 4.x + Testing Library | Manual browser inspection |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 + jsdom 30.0.1 |
| Config file | `vite.config.ts` / `vitest.config.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISUAL-04 | Initial `prefers-reduced-motion` detection selecting T2 | unit | `npx vitest run src/liquid/__tests__/reducedMotion.test.ts` | ❌ Wave 0 |
| VISUAL-04 | Dynamic media query change listener switching T1 <-> T2 | integration | `npx vitest run src/liquid/__tests__/reducedMotion.test.ts` | ❌ Wave 0 |
| VISUAL-04 | WebGL creation failure & `webglcontextlost` switching to T3 | unit | `npx vitest run src/liquid/__tests__/contextLoss.test.ts` | ❌ Wave 0 |
| VISUAL-04 | `data-tier` DOM attribute & `onTierChange` contract | component | `npx vitest run src/liquid/__tests__/observability.test.tsx` | ❌ Wave 0 |
| VISUAL-04 | WebGL1 `highp` -> `mediump` compilation & relink fallback | unit | `npx vitest run src/liquid/__tests__/shaderPrecision.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `src/liquid/__tests__/reducedMotion.test.ts` — Tests initial `prefers-reduced-motion` resolution in `tierResolver` and dynamic MQL change events in `<LiquidBackground/>`.
- [ ] `src/liquid/__tests__/contextLoss.test.ts` — Tests WebGL context creation failure and `webglcontextlost` event handling transitioning to `T3`.
- [ ] `src/liquid/__tests__/observability.test.tsx` — Tests `data-tier` attribute presence on DOM elements across T1/T2/T3 and `onTierChange` prop invocation.
- [ ] `src/liquid/__tests__/shaderPrecision.test.ts` — Tests `highp` failure handling and `mediump` relink fallback in `LiquidCanvas.ts`.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Clamp quality tier values to strict union `'T1' | 'T2' | 'T3'`. |

### Known Threat Patterns for WebGL / UI Loop

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Denial of Service (GPU Resource Exhaustion) | Denial of Service | Continuous rAF loop running when reduced motion is requested. Mitigated by `prefers-reduced-motion` forcing T2 frozen single frame with 0% continuous rAF. |
| Memory Leak on Context Loss | Denial of Service | Failing to clean up WebGL buffers/programs when context is lost. Mitigated by `dispose()` call and unmounting canvas in T3. |

## Sources

### Primary (HIGH confidence)
- **W3C Media Queries Level 4 Specification**: `prefers-reduced-motion` media feature [CITED: w3.org/TR/mediaqueries-4/#prefers-reduced-motion].
- **WCAG 2.2.2 Success Criterion**: Pause, Stop, Hide (Level A) [VERIFIED: w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html].
- **Khronos WebGL 1.0 Specification**: WebGL Context Lost Events & Precision Format queries [VERIFIED: khronos.org/registry/webgl/specs/latest/1.0/].
- **Existing Codebase Implementation**: `src/liquid/LiquidCanvas.ts`, `src/liquid/tierResolver.ts`, `src/liquid/LiquidBackground.tsx`, `src/liquid/PosterLayer.tsx`.

## Metadata

**Confidence breakdown:**
- Motion Preference Integration: HIGH - Standard browser `matchMedia` API pattern verified.
- Graceful Fallback & Context Loss: HIGH - WebGL context event & poster floor architecture verified.
- End-to-End Observability: HIGH - DOM attribute and prop callback contract verified.
- Shader Precision Safety: HIGH - WebGL1 precision format query and string replace relink verified.

**Research date:** 2026-07-30
**Valid until:** 2026-08-30
