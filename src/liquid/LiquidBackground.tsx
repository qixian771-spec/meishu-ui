import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LiquidCanvas } from './LiquidCanvas';
import { defaultTheme } from './defaultTheme';
import { checkStackingContext } from './stackingGuard';
import type { LiquidTheme } from './types';

export interface LiquidBackgroundProps {
  theme?: LiquidTheme;
  className?: string;
  dprCap?: number;
  onError?: (e: Error) => void;
}

/**
 * Thin React wrapper. Renders a fixed full-screen canvas (z:10, pointer-events:none)
 * as a DIRECT child of document.body via portal, so it sits in the root stacking
 * context regardless of where <LiquidBackground/> appears in the React tree.
 */
export function LiquidBackground({ theme = defaultTheme, className, dprCap, onError }: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LiquidCanvas | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new LiquidCanvas({ canvas, theme, dprCap, onError });
    engineRef.current = engine;
    engine.start();
    if (import.meta.env.DEV) checkStackingContext(canvas);
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  const cls = ['liquid-canvas', className].filter(Boolean).join(' ');
  return createPortal(
    <canvas
      ref={canvasRef}
      className={cls}
      aria-hidden="true"
      style={{ position: 'fixed', inset: '0', zIndex: 10, pointerEvents: 'none', display: 'block' }}
    />,
    document.body,
  );
}
