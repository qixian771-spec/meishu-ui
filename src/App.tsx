import { useMemo, useState } from 'react';
import { LiquidBackground } from './liquid';
import { defaultTheme, warmTheme } from './liquid/defaultTheme';
import type { LiquidTheme, QualityTier } from './liquid/types';

import {
  LiquidLogo,
  LiquidAvatar,
  LiquidButton,
  LiquidBadge,
} from './components/liquid';
import './components/liquid/navStyles.css';

const THEMES: Record<string, LiquidTheme> = {
  default: defaultTheme,
  warm: warmTheme,
};

type ScreenType = 'dashboard' | 'tasks' | 'settings' | 'login';

export default function App() {
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('default');
  const [speed, setSpeed] = useState(defaultTheme.speed);
  const [warp, setWarp] = useState(defaultTheme.warp);
  const [tierOverride, setTierOverride] = useState<QualityTier | undefined>(undefined);
  const [activeTier, setActiveTier] = useState<QualityTier>('T1');
  const [qualityScale, setQualityScale] = useState(1.0);
  const [activeNav, setActiveNav] = useState<ScreenType>('dashboard');

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
          color: '#fff',
          fontFamily: '"Noto Sans SC", system-ui, sans-serif',
        }}
      >
        {/* Sidebar Navigation with Liquid Active Pill & LiquidLogo & LiquidAvatar */}
        <aside
          style={{
            width: 260,
            padding: '24px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <LiquidLogo size={36} title="灵犀 Nexus" />

            <nav className="nav-container">
              {(
                [
                  { id: 'dashboard', label: '概览仪表盘', icon: '▣' },
                  { id: 'tasks', label: '任务与详情', icon: '☰' },
                  { id: 'settings', label: '偏好与设置', icon: '⚙' },
                  { id: 'login', label: '登录与注册', icon: '🔒' },
                ] as const
              ).map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveNav(item.id)}
                  >
                    {isActive && <div className="nav-active-pill" />}
                    <span className="nav-item-content">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <LiquidAvatar name="Alex Chen" size={38} showStatus statusColor="#4ADE80" />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>Alex Chen</span>
              <span style={{ fontSize: 12, opacity: 0.6, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                alex@company.com
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          {/* Top Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                {activeNav === 'dashboard' && '仪表盘概览'}
                {activeNav === 'tasks' && '任务列表与详情'}
                {activeNav === 'settings' && '系统设置'}
                {activeNav === 'login' && '账号登录'}
              </h2>
              <span style={{ fontSize: 13, opacity: 0.6 }}>
                系统级 WebGL 液态动态视觉 · Phase 5 交互元素签名织入
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <LiquidBadge dotColor="#4ADE80">系统正常</LiquidBadge>
              <LiquidButton icon="＋" onClick={() => alert('新建任务')}>
                新建任务
              </LiquidButton>
            </div>
          </header>

          {/* Screen Content Showcase */}
          {activeNav === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {[
                { title: '今日待办', count: 12, tag: '设计', color: '#4ADE80' },
                { title: '已完成', count: 56, tag: '已审核', color: '#60A5FA' },
                { title: '进行中', count: 28, tag: '开发', color: '#A78BFA' },
                { title: '已逾期', count: 3, tag: '紧急', color: '#FB7185' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 20,
                    borderRadius: 18,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, opacity: 0.7 }}>{card.title}</span>
                    <LiquidBadge dotColor={card.color}>{card.tag}</LiquidBadge>
                  </div>
                  <span style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Anti-Feature Guarded Data Table Section */}
          <div
            style={{
              borderRadius: 18,
              background: '#0A0A0F', // Anti-feature guard: Solid dark background behind dense data table
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>任务追踪明细（护栏防护：实色深底保障高可读性）</h3>
              <LiquidButton variant="secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
                导出数据
              </LiquidButton>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.6 }}>
                  <th style={{ padding: '10px 0' }}>任务名称</th>
                  <th>负责人</th>
                  <th>状态</th>
                  <th>优先级</th>
                  <th style={{ textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'User Research Analysis', owner: 'Brandon', status: 'In Progress', priority: 'High' },
                  { name: 'Information Architecture', owner: 'Yaling', status: 'Completed', priority: 'High' },
                  { name: 'Prototype Design', owner: 'Kousong', status: 'In Review', priority: 'Medium' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 0', fontWeight: 500 }}>{row.name}</td>
                    <td>{row.owner}</td>
                    <td>
                      <LiquidBadge dotColor={row.status === 'Completed' ? '#4ADE80' : '#60A5FA'}>
                        {row.status}
                      </LiquidBadge>
                    </td>
                    <td>
                      <span style={{ color: row.priority === 'High' ? '#FB7185' : '#F59E0B' }}>
                        {row.priority}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <LiquidButton variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                        查看
                      </LiquidButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dev Control Panel */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 600 }}>Tier Status: {activeTier}</span>
            <span>DPR Scale: {qualityScale.toFixed(2)}x</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Auto', 'T1', 'T2', 'T3'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTierOverride(t === 'Auto' ? undefined : t)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: (tierOverride === undefined && t === 'Auto') || tierOverride === t ? '#4ADE80' : 'rgba(255,255,255,0.1)',
                    color: (tierOverride === undefined && t === 'Auto') || tierOverride === t ? '#0A0A0F' : '#FFF',
                    fontWeight: 600,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
