import type { CSSProperties } from 'react';
import type { ThemeTokens } from '../tokens';
import { buildAtmosphereSpec } from './buildLayers';
import './precomposed.css';

export type PrecomposedAtmosphereProps = {
  tokens: ThemeTokens;
  /** Frame-driven offsets (Remotion). Fractions of container size. */
  drift?: { xA?: number; yA?: number; xB?: number; yB?: number };
  className?: string;
  style?: CSSProperties;
};

export function PrecomposedAtmosphere({
  tokens,
  drift,
  className = '',
  style,
}: PrecomposedAtmosphereProps) {
  const spec = buildAtmosphereSpec(tokens);
  return (
    <div
      className={`pc-atmosphere ${className}`.trim()}
      style={
        {
          ...style,
          ['--pc-stage-bg' as string]: spec.stageBg,
          ['--pc-bloom-a' as string]: spec.bloomA,
          ['--pc-bloom-b' as string]: spec.bloomB,
          ['--pc-bloom-c' as string]: spec.bloomC,
        } as CSSProperties
      }
      data-testid="pc-atmosphere"
    >
      <div
        className="pc-atmosphere-bloom pc-atmosphere-bloom--a"
        style={{
          transform: `translate(${(drift?.xA ?? 0) * 100}%, ${(drift?.yA ?? 0) * 100}%)`,
        }}
      />
      <div
        className="pc-atmosphere-bloom pc-atmosphere-bloom--b"
        style={{
          transform: `translate(${(drift?.xB ?? 0) * 100}%, ${(drift?.yB ?? 0) * 100}%)`,
        }}
      />
      <div className="pc-atmosphere-bloom pc-atmosphere-bloom--c" />
    </div>
  );
}
