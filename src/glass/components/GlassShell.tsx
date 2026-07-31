import { useEffect, useRef, type ReactNode } from 'react';
import { GlassDepthContext } from './GlassDepthContext';
import { assertNoFilteredAncestor } from '../web/assertNoFilteredAncestor';

export type GlassShellProps = {
  side?: ReactNode;
  children: ReactNode;
  /** Default translucent glass; `solid` only when opacity is required */
  variant?: 'glass' | 'solid';
  className?: string;
  mainClassName?: string;
  sideClassName?: string;
};

export function GlassShell({
  side,
  children,
  variant = 'glass',
  className = '',
  mainClassName = '',
  sideClassName = '',
}: GlassShellProps) {
  const sideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    assertNoFilteredAncestor(sideRef.current);
  }, []);

  return (
    // Shell is chrome; blur depth starts at Pane (depth 1).
    <GlassDepthContext.Provider value={0}>
      <div className={['app-container', 'spectra-dark-theme', className].filter(Boolean).join(' ')}>
        {side != null && (
          <aside
            ref={sideRef}
            className={[
              variant === 'glass' ? 'glass-sidebar' : 'glass-sidebar glass-sidebar--solid',
              sideClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {side}
          </aside>
        )}
        <main className={['app-main', mainClassName].filter(Boolean).join(' ')}>{children}</main>
      </div>
    </GlassDepthContext.Provider>
  );
}
