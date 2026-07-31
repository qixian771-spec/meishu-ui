import { useState } from 'react';
import { SpectraGlassCard } from './components/liquid/SpectraGlassCard';
import { LiquidLogo, LiquidAvatar, LiquidBadge } from './components/liquid';
import { DashboardWorkspace } from './components/dashboard/DashboardWorkspace';
import { ThemeSwitcher } from './components/theme/ThemeSwitcher';
import { useAccentTheme } from './theme/AccentThemeContext';
import { GlassAtmosphere, GlassShell } from './glass';
import { GalleryPage, SampleBanner } from './demo/pages/GalleryPage';

type ScreenType = 'gallery' | 'dashboard' | 'tasks' | 'settings' | 'login';

const NAV_ITEMS: { id: ScreenType; label: string; sample?: boolean }[] = [
  { id: 'gallery', label: '画廊' },
  { id: 'dashboard', label: '任务管理', sample: true },
  { id: 'tasks', label: '项目总览', sample: true },
  { id: 'settings', label: '设置中心', sample: true },
  { id: 'login', label: '账号登录', sample: true },
];

const TASK_ROWS = [
  { id: 0, code: 'WXB-2025-001', title: '用户研究分析', owner: 'BR', ownerName: 'Brandon', status: '进行中', statusColor: '#94A3B8', priority: '高', due: 'May 24, 2025' },
  { id: 1, code: 'WXB-2025-002', title: '信息架构梳理', owner: 'YL', ownerName: 'Yolanda', status: '已完成', statusColor: '#4ADE80', priority: '高', due: 'May 21, 2025' },
  { id: 2, code: 'WXB-2025-003', title: '原型设计交付', owner: 'KS', ownerName: 'Kason', status: '评审中', statusColor: '#94A3B8', priority: '中', due: 'May 28, 2025' },
  { id: 3, code: 'WXB-2025-004', title: '可用性测试', owner: 'MT', ownerName: 'Mia', status: '待办', statusColor: '#64748B', priority: '低', due: 'May 30, 2025' },
  { id: 4, code: 'WXB-2025-005', title: '设计交接清单', owner: 'TC', ownerName: 'Tracy', status: '阻塞', statusColor: '#F87171', priority: '高', due: 'Jun 02, 2025' },
];

export default function App() {
  const { theme } = useAccentTheme();
  const [activeNav, setActiveNav] = useState<ScreenType>('gallery');
  const [selectedTask, setSelectedTask] = useState<number>(1);
  const [categoryFilters, setCategoryFilters] = useState({
    design: true,
    development: false,
    testing: false,
    requirement: false,
  });

  const priorityClass = (p: string) => {
    if (p === '高') return 'priority-high';
    if (p === '中') return 'priority-medium';
    return 'priority-low';
  };

  const titles: Record<ScreenType, string> = {
    gallery: '画廊',
    dashboard: '任务管理',
    tasks: '项目总览',
    settings: '设置中心',
    login: '账号登录',
  };

  const isSample = activeNav !== 'gallery';

  const side = (
    <>
      <div className="sidebar-brand-block">
        <LiquidLogo size={34} title="灵犀 Nexus" />

        <div>
          <div className="sidebar-kicker">玻璃美术资产</div>
          <div className="workspace-select">meishu-ui demo</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`glass-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-theme">
          <ThemeSwitcher compact />
        </div>
      </div>

      <div className="sidebar-user">
        <LiquidAvatar name="Brandon" size={34} showStatus statusColor="#4ADE80" />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span className="sidebar-user-name">Brandon</span>
          <span className="sidebar-user-role">产品经理</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <GlassAtmosphere />
      <GlassShell
        side={side}
        mainClassName={activeNav === 'dashboard' ? 'app-main--flush' : ''}
        className="spectra-dark-theme"
      >
        {activeNav !== 'dashboard' && activeNav !== 'gallery' && (
          <header className="app-page-header">
            <div>
              <div className="app-header-kicker">示例组合</div>
              <h1 className="app-header-title">{titles[activeNav]}</h1>
            </div>
            <LiquidBadge dotColor={theme.primary}>工作区</LiquidBadge>
          </header>
        )}

        {isSample && <SampleBanner />}

        {activeNav === 'gallery' && <GalleryPage />}

        {activeNav === 'dashboard' && <DashboardWorkspace />}

        {activeNav === 'tasks' && (
          <div className="tasks-layout">
            <div className="glass-panel-box filter-panel">
              <div className="hud-tag">
                <span className="hud-dot" />
                筛选
              </div>

              <div>
                <div className="filter-section-label">分类</div>
                {(
                  [
                    ['requirement', '需求', 12],
                    ['design', '设计', 8],
                    ['development', '开发', 28],
                    ['testing', '测试', 6],
                  ] as const
                ).map(([key, label, count]) => (
                  <label key={key} className="filter-check">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={categoryFilters[key]}
                        onChange={() =>
                          setCategoryFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                      />
                      {label}
                    </span>
                    <span style={{ color: 'var(--text-faint)' }}>{count}</span>
                  </label>
                ))}
              </div>

              <div>
                <div className="filter-section-label">日期范围</div>
                <input className="glass-input" defaultValue="2025-05-01 → 2025-05-24" readOnly />
              </div>

              <div>
                <div className="filter-section-label">已选</div>
                <div className="filter-chips">
                  {categoryFilters.design && <span className="filter-chip">设计 ×</span>}
                  <span className="filter-chip">2025-05-01 ~ 05-24 ×</span>
                </div>
              </div>

              <div className="filter-actions">
                <button
                  className="filter-reset"
                  onClick={() =>
                    setCategoryFilters({
                      design: false,
                      development: false,
                      testing: false,
                      requirement: false,
                    })
                  }
                >
                  重置
                </button>
                <button className="filter-apply">应用</button>
              </div>
            </div>

            <div className="glass-panel-box task-data-surface">
              <table className="task-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>任务</th>
                    <th>负责人</th>
                    <th>状态</th>
                    <th>优先级</th>
                    <th>截止日期</th>
                  </tr>
                </thead>
                <tbody>
                  {TASK_ROWS.map((task) => (
                    <tr
                      key={task.id}
                      className={selectedTask === task.id ? 'selected' : ''}
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <td style={{ color: 'var(--text-muted)' }}>{selectedTask === task.id ? '●' : '○'}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.code}</div>
                      </td>
                      <td>
                        <span className="owner-chip">
                          <span className="owner-avatar">{task.owner}</span>
                          {task.ownerName}
                        </span>
                      </td>
                      <td>
                        <LiquidBadge dotColor={task.statusColor}>{task.status}</LiquidBadge>
                      </td>
                      <td className={priorityClass(task.priority)}>{task.priority}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{task.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="task-footer">
                <span>显示 1–5 / 共 28 项</span>
                <div className="pager">
                  {['‹', '1', '2', '3', '4', '5', '›'].map((p) => (
                    <button key={p} className={`pager-btn ${p === '1' ? 'active' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'settings' && (
          <div className="settings-stack">
            <div className="glass-panel-box glass-panel-box--lush settings-theme-panel">
              <ThemeSwitcher />
            </div>
            <div className="card-stage-floor">
              <SpectraGlassCard
                id="set-1"
                variant="quiet"
                ultrathink={false}
                wash="soft"
                tag="性能"
                title="渲染策略"
                subtitle="离屏暂停 · 自适应降载"
                price="自动"
                statusText="开启"
                height={200}
              />
              <SpectraGlassCard
                id="set-2"
                variant="hero"
                wash="glow"
                tag="视觉"
                title="焦点光效"
                subtitle="横向扫光 · 思考态呼吸"
                price="当前"
                statusText="启用"
                height={200}
              />
            </div>
          </div>
        )}

        {activeNav === 'login' && (
          <div className="login-stage">
            <SpectraGlassCard
              id="login-card"
              variant="hero"
              wash="mid"
              tag="账号"
              title="登录"
              subtitle="灵犀 Nexus"
              price=""
              height={340}
              style={{ width: 400 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', marginTop: 8 }}>
                <input type="text" className="glass-input" defaultValue="Brandon" placeholder="用户名" />
                <input type="password" className="glass-input" defaultValue="••••••••" placeholder="密码" />
              </div>
            </SpectraGlassCard>
          </div>
        )}
      </GlassShell>
    </>
  );
}
