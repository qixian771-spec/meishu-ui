import type { LiquidTheme } from './types';
import { defaultTheme } from './defaultTheme';

export interface PosterLayerProps {
  theme?: LiquidTheme;
  className?: string;
}

/**
 * Persistent theme-driven poster layer at z-index: 0.
 * Guarantees zero black voids or layout shifts during WebGL loading,
 * tier downgrades (T3 poster fallback), or WebGL context loss.
 */
export function PosterLayer({ theme = defaultTheme, className }: PosterLayerProps) {
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

  return <div className={cls} style={style} data-testid="poster-layer" aria-hidden="true" />;
}
