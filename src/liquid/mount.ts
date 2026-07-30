import { LiquidCanvas } from './LiquidCanvas';
import { defaultTheme } from './defaultTheme';
import type { LiquidTheme } from './types';

export interface MountResult {
  unmount: () => void;
}

/** Vanilla mount helper for non-React contexts. Append a canvas to `container` (document.body). */
export function mountLiquidBackground(
  container: HTMLElement,
  theme: LiquidTheme = defaultTheme,
  opts?: { dprCap?: number; onError?: (e: Error) => void },
): MountResult {
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  const engine = new LiquidCanvas({ canvas, theme, dprCap: opts?.dprCap, onError: opts?.onError });
  engine.start();
  const onResize = () => engine.resize();
  window.addEventListener('resize', onResize);
  return {
    unmount() {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      container.removeChild(canvas);
    },
  };
}
