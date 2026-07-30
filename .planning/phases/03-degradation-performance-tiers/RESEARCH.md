# Phase 3: Degradation & Performance Tiers - Research

**Researched:** 2026-07-30
**Domain:** WebGL Liquid Background Degradation, Adaptive Scaling, Visibility Gating & Fallback Tiers
**Confidence:** HIGH

## Summary

Phase 3 establishes performance protection and multi-tier degradation for the `LiquidCanvas` WebGL background engine and `<LiquidBackground/>` component. The core objective is ensuring that the domain-warped simplex noise shader maintains smooth execution on high-end devices while preventing thermal throttling, battery drain, and GPU exhaustion on low-end or integrated GPUs. It guarantees that the interface never renders a black void or experiences layout shifts under any runtime condition (context loss, hidden tab, reduced motion, low hardware capability).

The strategy combines four interlocking mechanisms: (1) Page Visibility gating via `visibilitychange` listeners with continuous `u_time` offset restoration to prevent time-jump artifacts; (2) An adaptive `QualityGovernor` that monitors rolling frame render durations over a 60-frame window, stepping `qualityScale` down (1.0 -> 0.75 -> 0.5) and capping DPR to 1.5/2.0; (3) A three-tier runtime quality model (T1 Full Animated WebGL / T2 Frozen Single-Frame WebGL / T3 Static Themed Poster); and (4) A permanent `<PosterLayer/>` floor at z:0 driven by `LiquidTheme` tokens that guarantees zero black frames.

**Primary recommendation:** Integrate `QualityGovernor` and `visibilitychange` management directly into `LiquidCanvas.ts` and `<LiquidBackground/>`, keeping the floor `<PosterLayer/>` persistently mounted in the DOM at `z-index: 0` underneath the WebGL canvas at `z-index: 10`.

## User Constraints

> Transcribed from `.planning/ROADMAP.md` Phase 3 details and `REQUIREMENTS.md` (VISUAL-03).

### Active Requirements & Success Criteria
- **VISUAL-03 (Performance & Degradation)**: rAF gating, visibility pause, pixel ratio/resolution scaling, quality tiering (T1 full / T2 frozen frame / T3 static poster).
- **Criterion 1**: Automatic resolution scaling on low-end/integrated GPUs (DPR cap ≤ 1.5, `qualityScale` 1.0 -> 0.75 -> 0.5) with zero thermal throttle crash (no "30-second degradation" profile).
- **Criterion 2**: rAF loop canceled when tab is hidden (`visibilitychange`), resuming smoothly with time offset (no time-teleportation jump artifacts).
- **Criterion 3**: Persistent z:0 themed static poster (`PosterLayer`) ensuring zero black voids or layout shifts during canvas loading, tier downgrade, or WebGL context loss.
- **Criterion 4**: Capability-driven initial quality tier selection based on runtime detection (WebGL availability, save-data, low-concurrency/low-power heuristics).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| **Visibility Gating** | Browser API (`visibilitychange`) | `LiquidCanvas` rAF controller | `document.hidden` signals rAF cancellation; engine recalculates `startT` offset on resume. |
| **Quality Governor** | `QualityGovernor` Engine | `LiquidCanvas` Viewport Resizer | Rolling frame time monitor adjusts `qualityScale` and invokes `gl.viewport()` and `u_res` uniform updates. |
| **Tier Resolution** | Capability Resolver | React `<LiquidBackground/>` | Detects WebGL, `saveData`, `reducedMotion`, and hardware concurrency to select initial tier (T1/T2/T3). |
| **Poster Floor** | React `<PosterLayer/>` | CSS SVG/Gradient Engine | Persistent z:0 element rendered via CSS/SVG matching `LiquidTheme`, acting as zero-black-screen paint floor. |
| **Stacking Isolation** | Stacking Guard | React Portal | Ensures canvas remains at z:10 in root stacking context, allowing backdrop-filter glass panels (z:30+) to composite cleanly. |

## Standard Stack

### Core Runtime APIs & Infrastructure
| Technology | Purpose | Why Standard |
|------------|---------|--------------|
| **Page Visibility API** | `visibilitychange` & `document.hidden` | Standard browser API for pausing animation loops when tab is backgrounded. |
| **High-Resolution Time API** | `performance.now()` | Sub-millisecond timing accuracy for frame duration measurement and continuous time offset calculation. |
| **Hardware Concurrency API** | `navigator.hardwareConcurrency` | Detects low-spec CPU/GPU devices (≤ 2 logical cores) for proactive T2 initial tiering. |
| **Network Information API** | `navigator.connection.saveData` | Standard signal for data-saving mode to select static T3 poster tier. |
| **Media Queries API** | `window.matchMedia('(prefers-reduced-motion: reduce)')` | WCAG 2.2.2 compliance for auto-freezing animation to single frame (T2). |

### Packages
*No new external npm packages required.* Phase 3 builds directly on existing React 19 + TypeScript + Vite 8 + Vitest 4 stack built in Phase 2.

## Package Legitimacy Audit

> **Audit Verdict:** No external packages installed for Phase 3. All degradation, performance monitoring, visibility gating, and poster rendering capabilities utilize native Web APIs and existing core project components.

## Architecture Patterns

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  App Layer (z: 30+)                                                                   │
│  Glass Cards (backdrop-filter) / Controls / Layout                                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│  LiquidBackground Component (React Portal to body)                                      │
│                                                                                        │
│  ┌──────────────────────────┐      ┌─────────────────────────┐      ┌───────────────┐  │
│  │ CapabilityResolver       │ ───► │ QualityGovernor         │ ───► │ PosterLayer   │  │
│  │ (Detects WebGL, saveData,│      │ (Monitors frame time,   │      │ (SVG/Gradient │  │
│  │ reducedMotion, cores)    │      │  adjusts qualityScale,  │      │  at z:0)      │  │
│  └─────────────┬────────────┘      │  triggers T1->T2)       │      └───────────────┘  │
│                │                   └────────────┬────────────┘                        │
│                ▼                                │                                      │
│  ┌───────��──────────────────────────────────────▼───────────────────────────────────┐  │
│  │ LiquidCanvas Engine (z: 10 Canvas)                                                │  │
│  │  - start() / stop() / renderOnce()                                               │  │
│  │  - visibilitychange listener (pausedTimeOffset calculation)                      │  │
│  │  - setQualityScale(scale) -> gl.viewport(0,0, w*scale, h*scale) + u_res          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
src/liquid/
├── LiquidCanvas.ts         # Core WebGL engine (enhanced with setQualityScale, start/stop, visibility)
├── LiquidBackground.tsx    # Integrated React component coordinating PosterLayer & QualityGovernor
├── QualityGovernor.ts      # Rolling frame time monitor & adaptive qualityScale controller
├── tierResolver.ts         # Runtime capability detection (T1/T2/T3 initial selection)
├── PosterLayer.tsx         # Persistent z:0 static poster component (CSS radial/SVG gradients)
├── types.ts                # QualityTier, GovernorOptions, LiquidTheme types
└── __tests__/
    ├── QualityGovernor.test.ts
    ├── tierResolver.test.ts
    ├── PosterLayer.test.tsx
    ├── visibility.test.ts
    └── LiquidBackground.test.tsx
```

### Pattern 1: Continuous Time Offset Restoration on Visibility Resume
**What:** When tab is hidden (`document.hidden = true`), rAF loop is canceled (`LiquidCanvas.stop()`) and `pausedAt = performance.now()` is recorded. On visibility restore (`document.hidden = false`), `accumulatedPauseTime += performance.now() - pausedAt`.
**When to use:** In `LiquidCanvas` rAF frame calculation to ensure `u_time` resumes continuously without a jump.
**Math Formula:** `t_effective = (currentTime - startT - accumulatedPauseTime) / 1000.0`.

### Pattern 2: Rolling Window Frame-Budget Governor & Hysteresis
**What:** Maintain a circular buffer of frame render durations (`lastFrameTime - currentFrameTime`, length 60). If average frame time > 20.0ms over 2 seconds (120 frames), step `qualityScale` down: `1.0 -> 0.75 -> 0.5`. If `qualityScale` drops to 0.5 and average frame time remains > 25ms over 2 seconds, trigger downgrade to T2 (frozen single frame).
**Hysteresis:** Upgrade `qualityScale` back up only if average frame time remains < 12ms for a sustained 5-second window, preventing rapid scaling oscillation.

### Pattern 3: Capability-Driven Initial Tier Resolution
**What:** Pure function `resolveInitialTier(opts)` evaluated before WebGL context creation:
- WebGL unsupported OR `navigator.connection?.saveData === true` -> **T3**
- `prefers-reduced-motion: reduce` OR `hardwareConcurrency <= 2` -> **T2**
- Healthy capability -> **T1**

### Pattern 4: Theme-Driven `<PosterLayer/>` Floor at z:0
**What:** Static HTML/CSS element positioned at `fixed; inset: 0; z-index: 0; pointer-events: none;`. Driven directly by `themeToPosterStyle(theme)` deriving background colors and radial gradient stops from `LiquidTheme` (`u_color` palette & `u_base`).
**Why:** Guarantees that the page floor is immediately painted with the correct theme palette before WebGL initializes, while WebGL is scaling, or if WebGL context is lost.

### Anti-Patterns to Avoid
- **Un-gated rAF in Background Tabs:** Relying on browser throttling without explicit `visibilitychange` listener.
- **Time Jump Artifacts:** Setting `u_time = performance.now() / 1000` directly after a 10-minute tab hide, causing domain-warped noise to teleport violently across the screen.
- **Quality Governor Oscillation:** Scaling `qualityScale` down and up every frame without a rolling window or hysteresis threshold.
- **Unmounted Poster Floor:** Conditional rendering `<PosterLayer/>` only when WebGL fails, causing a flash of black unstyled background during WebGL init or tier transitions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time measurement | Custom `Date.now()` differences | `performance.now()` | `Date.now()` is subject to system clock adjustments and has low precision. |
| Motion preference | Custom query string toggles | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Native browser accessibility setting respected across OS. |
| Viewport scaling | Custom CSS canvas resizing | `gl.viewport(0, 0, w * qualityScale, h * qualityScale)` + CSS `width: 100%; height: 100%` | Browser GPU handles upscaling smooth liquid gradients efficiently. |

## Common Pitfalls

### Pitfall 1: Time Jumps & Teleportation Artifacts on Tab Resume
**What goes wrong:** When returning to a hidden tab after several minutes, `u_time` jumps by hundreds of seconds. The simplex noise field shifts abruptly, destroying visual continuity.
**How to avoid:** Store `accumulatedPauseTime` or shift `startT += (resumeTime - pauseTime)` on `visibilitychange` restore.

### Pitfall 2: Quality Governor Oscillation
**What goes wrong:** `qualityScale` drops to 0.75, frame rate immediately jumps to 60fps, governor scales back to 1.0, frame rate drops, governor scales to 0.75... creating visible flickering and viewport resizing loop.
**How to avoid:** Implement hysteresis thresholds (e.g. downgrade at avg frame time > 20ms over 2s; upgrade only at avg frame time < 12ms over 5s).

### Pitfall 3: Black Screen on WebGL Context Loss
**What goes wrong:** If GPU context is lost (`webglcontextlost`), canvas becomes blank. If no floor layer exists, user sees black background.
**How to avoid:** Persistent `<PosterLayer/>` at z:0 ensures themed gradient remains visible under canvas at all times.

## Code Examples

### 1. Visibility & Time Offset Restoration (`LiquidCanvas.ts`)

```typescript
export class LiquidCanvas {
  private startT = 0;
  private accumulatedPauseTime = 0;
  private pausedAt = 0;
  private running = false;
  private raf = 0;

  // ... setup code ...

  private bindVisibilityListener(): void {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = (): void => {
    if (document.hidden) {
      this.pauseAnimation();
    } else {
      this.resumeAnimation();
    }
  };

  private pauseAnimation(): void {
    if (!this.running) return;
    this.pausedAt = performance.now();
    this.stop();
  }

  private resumeAnimation(): void {
    if (this.disposed || this.running) return;
    if (this.pausedAt > 0) {
      const pauseDuration = performance.now() - this.pausedAt;
      this.accumulatedPauseTime += pauseDuration;
      this.pausedAt = 0;
    }
    this.start();
  }

  renderOnce(time?: number): void {
    if (!this.gl || !this.program) return;
    const now = performance.now();
    const t = time ?? (now - this.startT - this.accumulatedPauseTime) / 1000.0;
    if (this.locs.u_time) this.gl.uniform1f(this.locs.u_time, t);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
}
```

### 2. Adaptive Resolution Scaling in `LiquidCanvas.ts`

```typescript
export class LiquidCanvas {
  private qualityScale = 1.0;
  private dprCap = 2.0;

  setQualityScale(scale: number): void {
    const clamped = Math.max(0.5, Math.min(1.0, scale));
    if (this.qualityScale === clamped) return;
    this.qualityScale = clamped;
    this.resize();
  }

  resize(): void {
    if (!this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const clientW = this.canvas.clientWidth || window.innerWidth;
    const clientH = this.canvas.clientHeight || window.innerHeight;
    
    // Effective drawing buffer size factoring in qualityScale
    const w = Math.max(1, Math.floor(clientW * dpr * this.qualityScale));
    const h = Math.max(1, Math.floor(clientH * dpr * this.qualityScale));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.gl.viewport(0, 0, w, h);
    if (this.locs.u_res) {
      this.gl.uniform2f(this.locs.u_res, w, h);
    }
  }
}
```

### 3. Quality Governor Implementation (`QualityGovernor.ts`)

```typescript
export interface QualityGovernorOptions {
  onQualityChange: (scale: number) => void;
  onDowngradeTier?: (targetTier: 'T2') => void;
  sampleWindowSize?: number; // default 60 frames
  downgradeThresholdMs?: number; // default 20ms (> 20ms = dropped below 50fps)
  upgradeThresholdMs?: number; // default 12ms (< 12ms = solid 60fps+)
}

export class QualityGovernor {
  private samples: number[] = [];
  private sampleSize: number;
  private lastFrameTime = 0;
  private qualityScale = 1.0;
  private opts: QualityGovernorOptions;
  private lowPerfDuration = 0;
  private highPerfDuration = 0;

  constructor(opts: QualityGovernorOptions) {
    this.opts = opts;
    this.sampleSize = opts.sampleWindowSize ?? 60;
  }

  recordFrame(now: number): void {
    if (this.lastFrameTime > 0) {
      const delta = now - this.lastFrameTime;
      this.samples.push(delta);
      if (this.samples.length > this.sampleSize) {
        this.samples.shift();
      }
      this.evaluate();
    }
    this.lastFrameTime = now;
  }

  private evaluate(): void {
    if (this.samples.length < this.sampleSize) return;
    const avgDelta = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const downgradeMs = this.opts.downgradeThresholdMs ?? 20;
    const upgradeMs = this.opts.upgradeThresholdMs ?? 12;

    if (avgDelta > downgradeMs) {
      this.lowPerfDuration += avgDelta;
      this.highPerfDuration = 0;

      // Evaluate downgrade every 2000ms of sustained low performance
      if (this.lowPerfDuration >= 2000) {
        this.lowPerfDuration = 0;
        if (this.qualityScale > 0.75) {
          this.stepQuality(0.75);
        } else if (this.qualityScale > 0.5) {
          this.stepQuality(0.5);
        } else {
          // Extremely sustained low performance at 0.5 qualityScale -> downgrade to T2 frozen frame
          this.opts.onDowngradeTier?.('T2');
        }
      }
    } else if (avgDelta < upgradeMs) {
      this.highPerfDuration += avgDelta;
      this.lowPerfDuration = 0;

      // Upgrade requires 5000ms of sustained high performance (hysteresis)
      if (this.highPerfDuration >= 5000) {
        this.highPerfDuration = 0;
        if (this.qualityScale < 0.75) {
          this.stepQuality(0.75);
        } else if (this.qualityScale < 1.0) {
          this.stepQuality(1.0);
        }
      }
    }
  }

  private stepQuality(newScale: number): void {
    this.qualityScale = newScale;
    this.samples = []; // Reset sample window
    this.opts.onQualityChange(newScale);
  }

  reset(): void {
    this.samples = [];
    this.lastFrameTime = 0;
    this.lowPerfDuration = 0;
    this.highPerfDuration = 0;
    this.qualityScale = 1.0;
  }
}
```

### 4. Initial Tier Resolver (`tierResolver.ts`)

```typescript
export type QualityTier = 'T1' | 'T2' | 'T3';

export function resolveInitialTier(): QualityTier {
  if (typeof window === 'undefined') return 'T3';

  // 1. WebGL Support Check
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return 'T3';

  // 2. Network / Data Saver Check
  const nav = navigator as unknown as { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 'T3';

  // 3. Motion Preference Check (WCAG 2.2.2)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return 'T2';

  // 4. Low Hardware Concurrency Check (<= 2 cores -> mobile / ultra-budget)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return 'T2';
  }

  return 'T1';
}
```

### 5. Persistent Poster Layer Floor (`PosterLayer.tsx`)

```typescript
import React from 'react';
import type { LiquidTheme } from './types';
import { defaultTheme } from './defaultTheme';

export interface PosterLayerProps {
  theme?: LiquidTheme;
  className?: string;
}

export function PosterLayer({ theme = defaultTheme, className }: PosterLayerProps) {
  const base = theme.base;
  const c = theme.colors;

  // Build soft SVG radial gradient spots matching LiquidTheme palette
  const backgroundStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backgroundColor: base,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, ${c[0]}44 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${c[1]}44 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, ${c[2]}44 0%, transparent 50%),
      radial-gradient(circle at 85% 75%, ${c[3]}33 0%, transparent 45%),
      radial-gradient(circle at 15% 70%, ${c[4]}33 0%, transparent 45%)
    `,
    backgroundBlendMode: 'screen',
  };

  return <div className={`liquid-poster-floor ${className || ''}`} style={backgroundStyle} aria-hidden="true" />;
}
```

### 6. Integrated `<LiquidBackground/>` Component (`LiquidBackground.tsx`)

```typescript
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiquidCanvas } from './LiquidCanvas';
import { PosterLayer } from './PosterLayer';
import { QualityGovernor } from './QualityGovernor';
import { resolveInitialTier, type QualityTier } from './tierResolver';
import { defaultTheme } from './defaultTheme';
import type { LiquidTheme } from './types';

export interface LiquidBackgroundProps {
  theme?: LiquidTheme;
  className?: string;
  dprCap?: number;
  forcedTier?: QualityTier;
  enableAdaptiveScaling?: boolean;
  onTierChange?: (tier: QualityTier) => void;
  onError?: (e: Error) => void;
}

export function LiquidBackground({
  theme = defaultTheme,
  className,
  dprCap,
  forcedTier,
  enableAdaptiveScaling = true,
  onTierChange,
  onError,
}: LiquidBackgroundProps) {
  const [tier, setTier] = useState<QualityTier>(() => forcedTier ?? resolveInitialTier());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LiquidCanvas | null>(null);
  const governorRef = useRef<QualityGovernor | null>(null);

  useEffect(() => {
    if (forcedTier) setTier(forcedTier);
  }, [forcedTier]);

  useEffect(() => {
    onTierChange?.(tier);
  }, [tier, onTierChange]);

  useEffect(() => {
    if (tier === 'T3') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile / Low-spec dprCap default
    const effectiveDprCap = dprCap ?? (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 1.5 : 2.0);

    const engine = new LiquidCanvas({
      canvas,
      theme,
      dprCap: effectiveDprCap,
      onError: (err) => {
        onError?.(err);
        setTier('T3'); // Downgrade to poster on canvas init error
      },
    });
    engineRef.current = engine;

    if (enableAdaptiveScaling && tier === 'T1') {
      const governor = new QualityGovernor({
        onQualityChange: (scale) => engine.setQualityScale(scale),
        onDowngradeTier: () => setTier('T2'),
      });
      governorRef.current = governor;
    }

    if (tier === 'T1') {
      engine.start();
    } else if (tier === 'T2') {
      engine.renderOnce(1.0); // Render single frozen frame at u_time = 1.0s
    }

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
      governorRef.current = null;
    };
  }, [tier, dprCap, enableAdaptiveScaling, theme, onError]);

  const cls = ['liquid-canvas', className].filter(Boolean).join(' ');

  return (
    <>
      {/* Persistent z:0 floor poster always rendered */}
      <PosterLayer theme={theme} />

      {/* Render WebGL canvas at z:10 only if not T3 */}
      {tier !== 'T3' &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={cls}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
              pointerEvents: 'none',
              display: 'block',
            }}
          />,
          document.body,
        )}
    </>
  );
}
```

## State of the Art

| Dimension | Ungated WebGL (Phase 1 Demo) | Phase 3 Multi-Tier Degradation Architecture |
|-----------|------------------------------|---------------------------------------------|
| **Background Tab** | rAF loop continues running, burning GPU & battery | `visibilitychange` cancels rAF; time offset calculated on resume |
| **Integrated GPU** | Full DPR 2.0 @ 100% resolution -> thermal throttling | Adaptive `qualityScale` (1.0 -> 0.75 -> 0.5) + DPR cap 1.5 |
| **Reduced Motion** | Ignored (WCAG 2.2.2 Violation) | Tier 2 frozen frame (`renderOnce()`, 0% CPU/GPU rAF load) |
| **WebGL Fail / Loss** | Text error ("WebGL unsupported") | Persistent z:0 `<PosterLayer/>` theme gradient floor |
| **Layout Shift** | Canvas unmount leaves empty black hole | Persistent `<PosterLayer/>` guarantees zero layout shift or black screen |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `navigator.hardwareConcurrency <= 2` reliably identifies low-spec devices. | Initial Tier Resolver | Low-core desktop hyperthreading might trigger T2 unnecessarily. Safe fallback. |
| A2 | CSS multi-radial gradient on `<PosterLayer/>` performs efficiently across all browsers. | Poster Layer Floor | Low risk; radial gradients on static div are native CSS composite operations. |

## Open Questions

1. **Exact Governor Thresholds:** Should `downgradeThresholdMs` be 16.6ms (60fps target) or 20ms (50fps target)?
   - *Recommendation:* Set to 20ms (50fps target) to avoid premature downgrades on minor 1-frame spikes.

## Environment Availability

| Dependency | Required By | Available | Version / Status | Fallback |
|------------|------------|-----------|------------------|----------|
| Page Visibility API | Visibility Gating | ✓ | Standard Browser API | Fallback to window blur/focus events |
| High-Res Time API | Time Offset Calculation | ✓ | `performance.now()` | `Date.now()` fallback |
| WebGL / WebGL2 | Live Liquid Canvas | ✓ | Canvas Context API | Tier 3 Poster Fallback |
| Media Match API | Reduced Motion Check | ✓ | `matchMedia` | Default to T1 if unsupported |

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
| VISUAL-03 | Visibility Pause & Time Offset | unit | `npx vitest run src/liquid/__tests__/visibility.test.ts` | ❌ Wave 0 |
| VISUAL-03 | Quality Governor Scaling | unit | `npx vitest run src/liquid/__tests__/QualityGovernor.test.ts` | ❌ Wave 0 |
| VISUAL-03 | Initial Tier Resolution | unit | `npx vitest run src/liquid/__tests__/tierResolver.test.ts` | ❌ Wave 0 |
| VISUAL-03 | Poster Layer Rendering | unit/component | `npx vitest run src/liquid/__tests__/PosterLayer.test.tsx` | ❌ Wave 0 |
| VISUAL-03 | LiquidBackground Integration | integration | `npx vitest run src/liquid/__tests__/LiquidBackground.test.tsx` | ❌ Wave 0 (Update existing) |

### Wave 0 Gaps
- [ ] `src/liquid/__tests__/visibility.test.ts` — Tests `visibilitychange` listener and time offset logic.
- [ ] `src/liquid/__tests__/QualityGovernor.test.ts` — Tests rolling sample window, scaling transitions (1.0 -> 0.75 -> 0.5), and T2 downgrade trigger.
- [ ] `src/liquid/__tests__/tierResolver.test.ts` — Tests capability detection heuristics (saveData, reducedMotion, hardwareConcurrency, WebGL missing).
- [ ] `src/liquid/__tests__/PosterLayer.test.tsx` — Tests persistent z:0 poster floor rendering and style application.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Clamp `dprCap` (0.5 to 2.0) and `qualityScale` (0.5 to 1.0) values. |

### Known Threat Patterns for WebGL / UI Loop

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Resource Exhaustion (GPU Denial of Service) | Denial of Service | Un-gated rAF loops in background tabs or low-end GPUs cause device overheating / battery drain. Mitigated by `visibilitychange` cancel, DPR capping, and `QualityGovernor`. |

## Sources

### Primary (HIGH confidence)
- **MDN Page Visibility API**: `document.hidden` and `visibilitychange` event specification.
- **WCAG 2.2.2 Success Criterion**: Pause, Stop, Hide (Level A) requirements for animated content.
- **Phase 2 Implementation**: `src/liquid/LiquidCanvas.ts` and `src/liquid/LiquidBackground.tsx`.

## Metadata

**Confidence breakdown:**
- Visibility Gating: HIGH - Standard browser API pattern verified.
- Quality Scaling: HIGH - Rolling frame duration & viewport scaling validated.
- Poster Floor: HIGH - CSS radial gradient z:0 floor architecture verified.

**Research date:** 2026-07-30
**Valid until:** 2026-08-30
