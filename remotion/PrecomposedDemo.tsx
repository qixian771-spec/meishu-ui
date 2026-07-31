import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import {
  resolveThemeTokens,
  PrecomposedAtmosphere,
  PrecomposedShell,
  PrecomposedPane,
  PrecomposedInset,
} from '../src/glass';

const THEME_ID = 'ref123' as const;

export const PrecomposedDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const tokens = resolveThemeTokens(THEME_ID);
  const t = frame / fps;

  const drift = {
    xA: Math.sin(t * 0.35) * 0.06,
    yA: Math.cos(t * 0.28) * 0.05,
    xB: Math.cos(t * 0.22) * 0.07,
    yB: Math.sin(t * 0.31) * 0.06,
  };

  const titleOpacity = interpolate(frame, [0, Math.min(20, durationInFrames)], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{ background: tokens.stage.bg, fontFamily: 'system-ui, sans-serif' }}
      className="pc-root"
    >
      <PrecomposedAtmosphere tokens={tokens} drift={drift} />
      <AbsoluteFill>
        <PrecomposedShell
          tokens={tokens}
          side={
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.12em' }}>MEISHU-UI</div>
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Precomposed</div>
              <div style={{ marginTop: 8, fontSize: 13, color: tokens.text.secondary }}>
                Remotion · frame {frame}
              </div>
            </div>
          }
        >
          <PrecomposedPane tokens={tokens} wash="glow" style={{ minHeight: 420 }}>
            <div style={{ opacity: titleOpacity }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  color: tokens.text.secondary,
                  fontWeight: 600,
                }}
              >
                v2.1 · SAME TOKENS
              </div>
              <h1
                style={{
                  margin: '10px 0 8px',
                  fontSize: 48,
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: tokens.text.primary,
                }}
              >
                Glass without backdrop-filter
              </h1>
              <p style={{ margin: 0, color: tokens.text.secondary, maxWidth: 520 }}>
                Clipped blur copy · premultiplied wash · nest budget tint-only at depth 3.
              </p>
            </div>
            <div style={{ marginTop: 28 }}>
              <PrecomposedInset tokens={tokens} wash="mid">
                <div style={{ fontWeight: 600 }}>Inset · depth 2</div>
                <div style={{ marginTop: 12 }}>
                  <PrecomposedInset tokens={tokens} wash="soft">
                    Inset · depth 3 · tint-only
                  </PrecomposedInset>
                </div>
              </PrecomposedInset>
            </div>
          </PrecomposedPane>
        </PrecomposedShell>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
