import { useMemo, useState } from 'react';
import { LiquidBackground } from './liquid';
import { defaultTheme, warmTheme } from './liquid/defaultTheme';
import type { LiquidTheme, QualityTier } from './liquid/types';

const THEMES: Record<string, LiquidTheme> = {
  default: defaultTheme,
  warm: warmTheme,
};

export default function App() {
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('default');
  const [speed, setSpeed] = useState(defaultTheme.speed);
  const [warp, setWarp] = useState(defaultTheme.warp);
  const [tierOverride, setTierOverride] = useState<QualityTier | undefined>(undefined);
  const [activeTier, setActiveTier] = useState<QualityTier>('T1');
  const [qualityScale, setQualityScale] = useState(1.0);

  const liveTheme = useMemo<LiquidTheme>(
    () => ({ ...THEMES[themeKey], speed, warp }),
    [themeKey, speed, warp],
  );

  return (
    <>
      <LiquidBackground
        theme={liveTheme}
        tier={tierOverride}
        onTierChange={setActiveTier}
        onQualityScaleChange={setQualityScale}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 30,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          color: '#fff',
          fontFamily: '"Noto Sans SC", system-ui, sans-serif',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>灵犀 Nexus</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.65, fontSize: 14 }}>
            Phase 4 无障碍 (WCAG 2.2.2) 与 No-WebGL 海报降级 · data-tier 端到端可观测
          </p>
        </div>

        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            gap: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 18,
            padding: 20,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            flexDirection: 'column',
            minWidth: 340,
            boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>当前 Tier (data-tier):</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                background: activeTier === 'T1' ? '#4ADE80' : activeTier === 'T2' ? '#F59E0B' : '#EF4444',
                color: '#0A0A0F',
              }}
            >
              {activeTier} {activeTier === 'T1' ? '(Full)' : activeTier === 'T2' ? '(Reduced Motion / Frozen)' : '(Poster Fallback)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['Auto', 'T1', 'T2', 'T3'] as const).map((t) => {
              const val = t === 'Auto' ? undefined : t;
              const isSelected = tierOverride === val;
              return (
                <button
                  key={t}
                  onClick={() => setTierOverride(val)}
                  style={btn(isSelected)}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, opacity: 0.8 }}>
              <span>DPR & Resolution Scale:</span>
              <span style={{ fontWeight: 600 }}>{qualityScale.toFixed(2)}x</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {Object.keys(THEMES).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setThemeKey(k);
                    setSpeed(THEMES[k].speed);
                    setWarp(THEMES[k].warp);
                  }}
                  style={btn(themeKey === k)}
                >
                  Theme: {k}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 13, opacity: 0.8 }}>
              速度 speed = {speed.toFixed(3)}
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.005}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>

            <label style={{ fontSize: 13, opacity: 0.8 }}>
              扭曲 warp = {warp.toFixed(2)}
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={warp}
                onChange={(e) => setWarp(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

function btn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: active ? 'linear-gradient(135deg,#A78BFA,#60A5FA 55%,#4ADE80)' : 'rgba(255,255,255,0.05)',
    color: active ? '#0A0A0F' : '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  };
}
