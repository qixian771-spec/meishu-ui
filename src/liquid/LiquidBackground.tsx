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
  /** Explicit QualityTier override (if omitted, auto-detects via resolveInitialTier()). */
  tier?: QualityTier;
  onTierChange?: (tier: QualityTier) => void;
  onQualityScaleChange?: (scale: number) => void;
  onError?: (e: Error) => void;
}

/**
 * Integrated Production Liquid Component.
 * - Always renders persistent <PosterLayer/> at z:0 with data-tier attribute (zero layout shift, zero black screen).
 * - Manages WebGL canvas at z:10 with Tier Controller:
 *   - T1: Full WebGL animation (rAF loop)
 *   - T2: Frozen single-frame WebGL render (0% ongoing CPU/GPU, WCAG 2.2.2 compliance)
 *   - T3: WebGL canvas unmounted, PosterLayer floor fallback
 * - Dynamic prefers-reduced-motion media query listener for real-time T1 <-> T2 switching.
 * - Integrates QualityGovernor for dynamic resolution downscaling.
 */
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

  // Listen to dynamic prefers-reduced-motion changes when tierProp is not explicitly controlling
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (tierProp !== undefined) return;

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          setActiveTier('T2');
        } else {
          setActiveTier(resolveInitialTier());
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMotionChange);
      } else if ('addListener' in mediaQuery) {
        (mediaQuery as unknown as { addListener: (fn: typeof handleMotionChange) => void }).addListener(handleMotionChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMotionChange);
        } else if ('removeListener' in mediaQuery) {
          (mediaQuery as unknown as { removeListener: (fn: typeof handleMotionChange) => void }).removeListener(handleMotionChange);
        }
      };
    } catch {
      // ignore media query listener errors
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTier]);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  const cls = ['liquid-canvas', className].filter(Boolean).join(' ');

  return (
    <>
      <PosterLayer theme={theme} tier={activeTier} className={className} />
      {activeTier !== 'T3' &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={cls}
            data-tier={activeTier}
            aria-hidden="true"
            style={{ position: 'fixed', inset: '0', zIndex: 10, pointerEvents: 'none', display: 'block' }}
          />,
          document.body,
        )}
    </>
  );
}
