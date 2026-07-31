import type { CSSProperties, ReactNode } from 'react';
import type { ThemeTokens } from '../tokens';
import { PrecomposedDepthProvider } from './PrecomposedDepth';
import { PrecomposedPane } from './PrecomposedPane';
import './precomposed.css';

export type PrecomposedShellProps = {
  tokens: ThemeTokens;
  side?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Shell = side pane (depth 1) + main content area. Depth context starts at 0 for main children. */
export function PrecomposedShell({
  tokens,
  side,
  className = '',
  style,
  children,
}: PrecomposedShellProps) {
  return (
    <div className={`pc-shell ${className}`.trim()} style={style} data-testid="pc-shell">
      {side != null && (
        <div className="pc-shell-side">
          <PrecomposedPane tokens={tokens} depth={1} wash="soft" radius={20} pad={16}>
            {side}
          </PrecomposedPane>
        </div>
      )}
      <PrecomposedDepthProvider depth={0}>
        <div className="pc-shell-main">{children}</div>
      </PrecomposedDepthProvider>
    </div>
  );
}
