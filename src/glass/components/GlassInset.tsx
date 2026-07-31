import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { WashRole } from '../tokens';
import { resolveBlurForDepth } from '../blurBudget';
import { GlassDepthContext, useGlassDepth } from './GlassDepthContext';
import { assertNoFilteredAncestor } from '../web/assertNoFilteredAncestor';
import { useGlassPointer } from '../web/useGlassPointer';

export type GlassInsetProps = {
  as?: 'pane' | 'row';
  wash?: WashRole | 'none';
  tintOnly?: boolean;
  /** Pointer specular + tilt + press. Default on. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'style' | 'className'>;

export function GlassInset({
  as = 'pane',
  wash = 'none',
  tintOnly: tintOnlyProp,
  interactive = true,
  className = '',
  style,
  children,
  onClick,
  ...rest
}: GlassInsetProps) {
  const parentDepth = useGlassDepth();
  const depth = parentDepth > 0 ? parentDepth + 1 : 2;
  const { blur, tintOnly: budgetTint } = resolveBlurForDepth(depth);
  const tintOnly = tintOnlyProp ?? budgetTint;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    assertNoFilteredAncestor(ref.current);
  }, []);

  useGlassPointer(ref, { enabled: interactive, intensity: 'inset' });

  const washClass = wash !== 'none' ? `glass-inset--wash-${wash}` : '';

  return (
    <GlassDepthContext.Provider value={depth}>
      <div
        ref={ref}
        className={[
          'glass-inset',
          as === 'row' ? 'glass-inset--row' : 'glass-inset--pane',
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
        {...rest}
      >
        {children}
      </div>
    </GlassDepthContext.Provider>
  );
}
