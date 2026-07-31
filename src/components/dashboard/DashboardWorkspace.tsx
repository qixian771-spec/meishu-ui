import { useMemo, useState } from 'react';
import { SpectraGlassCard } from '../liquid/SpectraGlassCard';
import { LiquidBadge } from '../liquid';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useAccentTheme } from '../../theme/AccentThemeContext';
import { UltrathinkStrip } from './UltrathinkStrip';

type TaskItem = {
  id: number;
  code: string;
  title: string;
  group: '需求评审' | '产品设计' | '开发实现';
  owner: string;
  status: string;
  priority: '高' | '中' | '低';
  due: string;
  project: string;
  tags: string[];
  progress: number;
  docs: string[];
};

const TASKS: TaskItem[] = [
  {
    id: 0,
    code: 'WXB-2025-001',
    title: '需求评审会议',
    group: '需求评审',
    owner: 'Brandon',
    status: '进行中',
    priority: '高',
    due: '2025-05-24 18:00',
    project: '灵犀 Nexus 2.0',
    tags: ['评审', '需求', '关键路径'],
    progress: 62,
    docs: ['d1', 'd3'],
  },
  {
    id: 1,
    code: 'WXB-2025-002',
    title: '信息架构梳理',
    group: '产品设计',
    owner: 'Yolanda',
    status: '已完成',
    priority: '高',
    due: '2025-05-21 18:00',
    project: '灵犀 Nexus 2.0',
    tags: ['设计', 'IA'],
    progress: 100,
    docs: ['d2'],
  },
  {
    id: 2,
    code: 'WXB-2025-003',
    title: '交互流程设计',
    group: '产品设计',
    owner: 'Kason',
    status: '评审中',
    priority: '中',
    due: '2025-05-28 18:00',
    project: '灵犀 Nexus 2.0',
    tags: ['交互', '流程'],
    progress: 48,
    docs: ['d2', 'd3'],
  },
  {
    id: 3,
    code: 'WXB-2025-004',
    title: '核心功能开发',
    group: '开发实现',
    owner: 'Mia',
    status: '进行中',
    priority: '高',
    due: '2025-06-02 18:00',
    project: '灵犀 Nexus 2.0',
    tags: ['开发', '关键路径'],
    progress: 35,
    docs: ['d1', 'd2'],
  },
  {
    id: 4,
    code: 'WXB-2025-005',
    title: '测试与验收准备',
    group: '开发实现',
    owner: 'Tracy',
    status: '待办',
    priority: '低',
    due: '2025-06-05 18:00',
    project: '灵犀 Nexus 2.0',
    tags: ['测试'],
    progress: 8,
    docs: ['d3'],
  },
];

const DOCS = [
  { id: 'd1', title: 'Project Documents 2025 — Q2', progress: 87, active: true },
  { id: 'd2', title: 'Design Spec — Glass System', progress: 64, active: false },
  { id: 'd3', title: 'Sprint Notes — May', progress: 41, active: false },
];

const TIMELINE = [
  { id: 't1', label: '需求评审', start: 2, span: 18, tone: 'muted' as const },
  { id: 't2', label: '产品设计', start: 16, span: 22, tone: 'muted' as const },
  { id: 't3', label: '交互流程', start: 28, span: 16, tone: 'muted' as const },
  { id: 't4', label: '核心功能开发', start: 40, span: 28, tone: 'accent' as const },
  { id: 't5', label: '测试验收', start: 64, span: 20, tone: 'muted' as const },
];

const GROUPS: TaskItem['group'][] = ['需求评审', '产品设计', '开发实现'];

type FocalEye = 'doc' | 'ai';

/* Active doc gets green glow wash; stack behind stays neutral chrome */
const DOC_TONES = ['glow', 'chrome', 'soft'] as const;

export function DashboardWorkspace() {
  const { theme } = useAccentTheme();
  const [selectedId, setSelectedId] = useState(0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    需求评审: true,
    产品设计: true,
    开发实现: false,
  });
  const [activeDoc, setActiveDoc] = useState('d1');
  const [focalOverride, setFocalOverride] = useState<FocalEye | null>(null);

  const selected = useMemo(
    () => TASKS.find((t) => t.id === selectedId) ?? TASKS[0],
    [selectedId],
  );

  const linkedDocs = useMemo(
    () => DOCS.filter((doc) => selected.docs.includes(doc.id)),
    [selected],
  );

  // Default eye: in-progress tasks favor AI thinking; otherwise document stack
  const defaultEye: FocalEye = selected.status === '进行中' ? 'ai' : 'doc';
  const focalEye = focalOverride ?? defaultEye;
  const taskThinking = selected.status === '进行中';

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="dash-workspace" data-testid="dashboard-workspace" data-focal={focalEye}>
      <div className="dash-workspace-main">
        {/* Header */}
        <header className="dash-topbar">
          <div>
            <div className="app-header-kicker">灵犀 Nexus</div>
            <h1 className="app-header-title app-header-title--page">任务管理</h1>
            <p className="dash-topbar-sub">文档与任务在同一视野里推进</p>
          </div>
          <div className="dash-topbar-actions">
            <ThemeSwitcher compact />
            <label className="dash-search">
              <span className="dash-search-icon" aria-hidden="true">/</span>
              <input type="search" placeholder="搜索任务、负责人、标签…" />
            </label>
            <button type="button" className="dash-primary-btn">新增任务</button>
          </div>
        </header>

        {/* Stats — neutral frosted glass (refs #1–3), not color-wash cards */}
        <div className="dash-stats dash-stats--glass">
          <SpectraGlassCard
            id="stat-today"
            variant="quiet"
            ultrathink={false}
            wash="chrome"
            mode="idle"
            height={120}
          >
            <div className="stat-card-inner">
              <div className="stat-label">今日任务</div>
              <div className="stat-row">
                <span className="stat-value">12</span>
                <span className="stat-trend">+20%</span>
              </div>
            </div>
          </SpectraGlassCard>
          <SpectraGlassCard
            id="stat-progress"
            variant="quiet"
            ultrathink={false}
            wash="mid"
            mode="idle"
            height={120}
          >
            <div className="stat-card-inner">
              <div className="stat-label">进行中</div>
              <div className="stat-row">
                <span className="stat-value">28</span>
                <span className="stat-trend">+8%</span>
              </div>
            </div>
          </SpectraGlassCard>
          <SpectraGlassCard
            id="stat-done"
            variant="quiet"
            ultrathink={false}
            wash="chrome"
            mode="idle"
            height={120}
          >
            <div className="stat-card-inner">
              <div className="stat-label">已完成</div>
              <div className="stat-row">
                <span className="stat-value">56</span>
                <span className="stat-trend positive">+15%</span>
              </div>
            </div>
          </SpectraGlassCard>
          <SpectraGlassCard
            id="stat-overdue"
            variant="quiet"
            ultrathink={false}
            wash="soft"
            mode="idle"
            height={120}
          >
            <div className="stat-card-inner">
              <div className="stat-label">逾期</div>
              <div className="stat-row">
                <span className="stat-value">3</span>
                <span className="stat-trend warn">需关注</span>
              </div>
            </div>
          </SpectraGlassCard>
        </div>

        {/* Mid: glass task list + colored document stack */}
        <div className="dash-mid">
          <section className="glass-panel-box glass-panel-box--lush dash-task-groups">
            {GROUPS.map((group) => {
              const items = TASKS.filter((t) => t.group === group);
              const open = openGroups[group];
              return (
                <div key={group} className="dash-accordion">
                  <button
                    type="button"
                    className="dash-accordion-head"
                    onClick={() => toggleGroup(group)}
                  >
                    <span>{open ? '▾' : '▸'} {group}</span>
                    <span className="dash-accordion-count">{items.length}</span>
                  </button>
                  {open && (
                    <div className="dash-accordion-body">
                      {items.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={`dash-task-row ${selectedId === task.id ? 'selected' : ''}`}
                          onClick={() => setSelectedId(task.id)}
                        >
                          <div>
                            <div className="dash-task-title">{task.title}</div>
                            <div className="dash-task-meta">{task.code} · {task.due}</div>
                          </div>
                          <LiquidBadge
                            dotColor={
                              task.status === '已完成'
                                ? '#4ADE80'
                                : task.status === '进行中'
                                  ? '#94A3B8'
                                  : '#64748B'
                            }
                          >
                            {task.status}
                          </LiquidBadge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section
            className={`dash-doc-stack dash-doc-stack--anchor ${focalEye === 'doc' ? 'is-focal' : 'is-dimmed'}`}
            aria-label="项目文档堆叠"
            onMouseEnter={() => setFocalOverride('doc')}
            onMouseLeave={() => setFocalOverride(null)}
          >
            <div className="dash-doc-stack-label">文档堆叠</div>
            {DOCS.map((doc, index) => (
              <button
                key={doc.id}
                type="button"
                className={`dash-doc-card dash-doc-card--tone-${DOC_TONES[index] ?? 'soft'} ${
                  activeDoc === doc.id ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveDoc(doc.id);
                  setFocalOverride('doc');
                }}
              >
                {activeDoc === doc.id && (
                  <UltrathinkStrip
                    className="dash-doc-ultrathink"
                    radius={16}
                    mode={focalEye === 'doc' ? 'active' : 'idle'}
                    intensity={focalEye === 'doc' ? 1 : 0.08}
                  />
                )}
                <div className="dash-doc-kicker">文档</div>
                <div className={`dash-doc-title ${focalEye === 'doc' && activeDoc === doc.id ? 'ultrathink-text is-live' : ''}`}>
                  {doc.title}
                </div>
                <div className="dash-doc-progress">
                  <div className="dash-doc-bar">
                    <span style={{ width: `${doc.progress}%` }} />
                  </div>
                  <span className={focalEye === 'doc' && activeDoc === doc.id ? 'ultrathink-text ultrathink-text--soft' : ''}>
                    {doc.progress}%
                  </span>
                </div>
              </button>
            ))}
          </section>
        </div>

        {/* Timeline — glass strip with soft wash */}
        <section className="glass-panel-box glass-panel-box--lush dash-timeline" aria-label="项目时间轴">
          <div className="dash-timeline-head">
            <span className="hud-tag" style={{ margin: 0 }}>
              <span className="hud-dot" />
              项目时间轴 · 2025 年 5 月
            </span>
            <span className="dash-timeline-legend">今日</span>
          </div>
          <div className="dash-gantt">
            <div className="dash-gantt-today" style={{ left: '48%' }} />
            {TIMELINE.map((bar) => (
              <div key={bar.id} className="dash-gantt-row">
                <div className="dash-gantt-label">{bar.label}</div>
                <div className="dash-gantt-track">
                  <div
                    className={`dash-gantt-bar ${bar.tone}`}
                    style={{ left: `${bar.start}%`, width: `${bar.span}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right smart detail */}
      <aside
        className={`glass-panel-box glass-panel-box--lush dash-smart-detail ${
          focalEye === 'ai' ? 'is-surface-glass' : 'is-surface-quiet'
        }`}
        data-testid="smart-detail"
        data-surface={focalEye === 'ai' ? 'glass' : 'quiet'}
      >
        <div className="dash-smart-head">
          <span className="hud-tag" style={{ margin: 0 }}>
            <span className="hud-dot" style={{ background: theme.primary }} />
            智能详情
          </span>
        </div>

        <div className="dash-smart-title-row">
          <h2>{selected.title}</h2>
          <span className={`dash-priority-pill ${selected.priority === '高' ? 'high' : ''}`}>
            {selected.priority}优先级
          </span>
        </div>
        <div className="dash-smart-code">{selected.code}</div>

        <dl className="dash-smart-fields">
          <div>
            <dt>负责人</dt>
            <dd>{selected.owner}</dd>
          </div>
          <div>
            <dt>项目</dt>
            <dd>{selected.project}</dd>
          </div>
          <div>
            <dt>截止</dt>
            <dd>{selected.due}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>{selected.status}</dd>
          </div>
        </dl>

        <div className="dash-smart-tags">
          {selected.tags.map((tag) => (
            <span key={tag} className="filter-chip">{tag}</span>
          ))}
        </div>

        <div className="dash-smart-progress">
          <div className="dash-smart-progress-head">
            <span>完成度</span>
            <span className="dash-smart-progress-value">{selected.progress}%</span>
          </div>
          <div className="dash-doc-bar">
            <span style={{ width: `${selected.progress}%` }} />
          </div>
        </div>

        <div className="dash-smart-linked">
          <div className="dash-smart-linked-head">关联文档</div>
          {linkedDocs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              className={`dash-smart-linked-row ${activeDoc === doc.id ? 'active' : ''}`}
              onClick={() => {
                setActiveDoc(doc.id);
                setFocalOverride('doc');
              }}
            >
              <span className="dash-smart-linked-title">{doc.title}</span>
              <span className="dash-smart-linked-pct">{doc.progress}%</span>
            </button>
          ))}
        </div>

        <div
          className={`dash-ai-box ${focalEye === 'ai' ? 'is-focal' : 'is-dimmed'}`}
          data-testid="ai-focal"
          onMouseEnter={() => setFocalOverride('ai')}
          onMouseLeave={() => setFocalOverride(null)}
        >
          <UltrathinkStrip
            className="dash-ai-ultrathink"
            radius={12}
            mode={focalEye === 'ai' ? (taskThinking ? 'active' : 'thinking') : 'idle'}
            intensity={focalEye === 'ai' ? 1 : 0.1}
          />
          <div className="dash-ai-title">
            <span className={`ultrathink-label ${focalEye === 'ai' ? 'is-live' : 'is-idle'}`}>
              thinking
            </span>
            <span className="dash-ai-title-text">AI 助手建议</span>
          </div>
          <p>
            建议关联相关文档，并关注范围变更风险。当前任务位于关键路径，延期可能影响「核心功能开发」节点。
          </p>
        </div>

        <div className="dash-smart-actions">
          <button type="button" className="dash-ghost-btn">编辑任务</button>
          <button type="button" className="dash-primary-btn">完成任务</button>
        </div>
      </aside>
    </div>
  );
}
