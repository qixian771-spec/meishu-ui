import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { WashRole } from '../tokens';
import { resolveBlurForDepth } from '../blurBudget';
import { GlassDepthContext, useGlassDepth } from './GlassDepthContext';
import { assertNoFilteredAncestor } from '../web/assertNoFilteredAncestor';
import { useGlassPointer } from '../web/useGlassPointer';

export type GlassPaneProps = {
  wash?: WashRole | 'none';
  variant?: 'default' | 'quiet' | 'hero';
  /** Force tint-only (no backdrop-filter) */
  tintOnly?: boolean;
  /** Pointer specular + tilt + press. Default on. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
};

export function GlassPane({
  wash = 'none',
  variant = 'default',
  tintOnly: tintOnlyProp,
  interactive = true,
  className = '',
  style,
  children,
  onClick,
}: GlassPaneProps) {
  const parentDepth = useGlassDepth();
  const depth = parentDepth > 0 ? parentDepth + 1 : 1;
  const { blur, tintOnly: budgetTint } = resolveBlurForDepth(depth);
  const tintOnly = tintOnlyProp ?? budgetTint;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    assertNoFilteredAncestor(ref.current);
  }, []);

  useGlassPointer(ref, { enabled: interactive, intensity: 'pane' });

  const variantClass =
    variant === 'hero'
      ? 'glass-container--hero'
      : variant === 'quiet'
        ? 'glass-container--quiet'
        : '';
  const washClass = wash !== 'none' ? `glass-container--wash-${wash}` : '';

  return (
    <GlassDepthContext.Provider value={depth}>
      <div
        ref={ref}
        className={[
          'glass-container',
          'glass-pane',
          variantClass,
          washClass,
          tintOnly ? 'is-tint-only' : '',
          interactive ? 'is-interactive' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...style,
          ['--glass-blur' as string]: tintOnly ? '0px' : `${blur}px`,
        }}
        onClick={onClick}
      >
        {children}
      </div>
    </GlassDepthContext.Provider>
  );
}
