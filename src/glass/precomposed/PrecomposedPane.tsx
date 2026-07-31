import type { CSSProperties, ReactNode } from 'react';
import type { ThemeTokens, WashRole } from '../tokens';
import { buildPaneSpec } from './buildLayers';
import { PrecomposedDepthProvider, usePrecomposedDepth } from './PrecomposedDepth';
import './precomposed.css';

export type PrecomposedPaneProps = {
  tokens: ThemeTokens;
  wash?: WashRole | 'none';
  /** Override nest depth (default: parent+1 or 1). */
  depth?: number;
  radius?: number;
  pad?: number;
  backdrop?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: 'pane' | 'inset';
};

export function PrecomposedPane({
  tokens,
  wash = 'none',
  depth: depthProp,
  radius,
  pad,
  backdrop,
  className = '',
  style,
  children,
  as = 'pane',
}: PrecomposedPaneProps) {
  const parent = usePrecomposedDepth();
  const depth = depthProp ?? (parent > 0 ? parent + 1 : 1);
  const spec = buildPaneSpec(tokens, depth, wash, backdrop);
  const cls = as === 'inset' ? 'pc-inset' : 'pc-pane';
  const defaultRadius = as === 'inset' ? Math.max(8, 28 - depth * 6) : 24;

  return (
    <PrecomposedDepthProvider depth={depth}>
      <div
        className={`${cls} ${className}`.trim()}
        data-testid={as === 'inset' ? 'pc-inset' : 'pc-pane'}
        data-pc-depth={depth}
        data-pc-tint-only={spec.tintOnly ? 'true' : 'false'}
        style={
          {
            ...style,
            ['--pc-radius' as string]: `${radius ?? defaultRadius}px`,
            ['--pc-pad' as string]: `${pad ?? (as === 'inset' ? 14 : 22)}px`,
            ['--pc-blur' as string]: `${spec.blurPx}px`,
            ['--pc-fill' as string]: spec.fill,
            ['--pc-rim-border' as string]: spec.rimBorder,
            ['--pc-rim-highlight' as string]: spec.rimHighlight,
            ['--pc-sheen' as string]: spec.sheen,
            ['--pc-text' as string]: spec.textPrimary,
            ['--pc-backdrop' as string]: spec.backdrop,
          } as CSSProperties
        }
      >
        <div className={`pc-blur-copy ${spec.tintOnly ? 'is-tint-only' : ''}`} aria-hidden />
        <div className="pc-fill" aria-hidden />
        <div className="pc-content">{children}</div>
      </div>
    </PrecomposedDepthProvider>
  );
}

export function PrecomposedInset(props: Omit<PrecomposedPaneProps, 'as'>) {
  return <PrecomposedPane {...props} as="inset" />;
}
