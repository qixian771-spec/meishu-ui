import type { HTMLAttributes } from 'react';

export type GlassAtmosphereProps = {
  /** Colour-blob count; default 4 */
  blobs?: number;
  /** Disable drift animation (reduced-motion still wins in CSS) */
  static?: boolean;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Drifting stage colour under every glass panel.
 * Not decoration — without it, backdrop-filter only blurs a flat fill and glass reads as grey plastic.
 */
export function GlassAtmosphere({
  blobs = 4,
  static: isStatic = false,
  className = '',
  ...rest
}: GlassAtmosphereProps) {
  const count = Math.max(1, Math.min(blobs, 8));
  return (
    <div
      className={['liquid-stage-wash', isStatic ? 'is-static' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
