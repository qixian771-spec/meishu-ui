import { useMemo, useState } from 'react';
import { LiquidBackground } from './liquid';
import { defaultTheme, warmTheme } from './liquid/defaultTheme';
import type { LiquidTheme } from './liquid/types';

const THEMES: Record<string, LiquidTheme> = {
  default: defaultTheme,
  warm: warmTheme,
};

export default function App() {
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('default');
  const [speed, setSpeed] = useState(defaultTheme.speed);
  const [warp, setWarp] = useState(defaultTheme.warp);

  const liveTheme = useMemo<LiquidTheme>(
    () => ({ ...THEMES[themeKey], speed, warp }),
    [themeKey, speed, warp],
  );

  return (
    <>
      <div className="liquid-base-layer" />
      <LiquidBackground theme={liveTheme} />

      <div
        style={{
          position: 'relative',
          zIndex: 30,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          color: '#fff',
          fontFamily: '"Noto Sans SC", system-ui, sans-serif',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>灵犀 Nexus</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.6, fontSize: 14 }}>
            WebGL 液态动态背景 · 生产组件 · 主题 token 驱动（热换肤不重编译）
          </p>
        </div>

        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            gap: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: 16,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            flexDirection: 'column',
            minWidth: 260,
          }}
        >
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
                {k}
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
    </>
  );
}

function btn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: active ? 'linear-gradient(135deg,#A78BFA,#60A5FA 55%,#4ADE80)' : 'rgba(255,255,255,0.05)',
    color: active ? '#0A0A0F' : '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  };
}
