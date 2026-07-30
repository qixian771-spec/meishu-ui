# Roadmap: 灵犀 Nexus

## Overview

灵犀 Nexus 是一个深色玻璃质感的桌面端生产力/任务管理界面设计项目，以 **WebGL 驱动的动态液态渐变**作为贯穿全站的视觉母题。本路线图把已交付的静态设计稿与液态 demo 回填为 Phase 1，然后沿研究给出的关键路径向前推进：先把液态背景生产化为可集成组件（Phase 2），再做性能降级分层与无障碍/降级（Phase 3、4）——这三步必须在任何液态元素差异化之前完成，因为 Logo/导航/按钮/头像的配色与运动语言都派生自系统级背景；之后把液态签名织入核心交互元素并校验静态画布（Phase 5），产出设计→代码集成规范（Phase 6），最后跨设备/GPU 校验并对照参考图确认一致性（Phase 7）。浅色「Spectra」主题明确推迟到 v2，不在本轮范围内。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Static Design Foundation & Liquid Demo** *(BACKFILL — delivered)* - 4 屏静态设计稿 + 液态底层母题 + 可运行 WebGL 液态 demo
- [x] **Phase 2: Production WebGL Liquid Component** - 液态 demo 移植为生产组件，配色/速度/扭曲提升为 uniform，由主题 token 驱动 — *已交付：LiquidCanvas.ts + <LiquidBackground/>*
- [x] **Phase 3: Degradation & Performance Tiers** - rAF 门控、visibility 暂停、分辨率缩放、质量分级 T1/T2/T3 与海报兜底 — *已交付：QualityGovernor + PosterLayer + tierResolver*
- [x] **Phase 4: Accessibility & No-WebGL Fallback** - prefers-reduced-motion 冻结单帧；无 WebGL/低功耗降级为主题化静态海报 — *已交付：reducedMotion + data-tier + precisionFallback*
- [x] **Phase 5: Liquid Element Differentiators & Static Canvas Verification** - 液态签名织入 Logo/导航/按钮/头像/胶囊，并校验静态画布液态观感 — *已交付：LiquidLogo + LiquidButton + LiquidAvatar + LiquidBadge + NavActivePill + ardotTokenMap*
- [x] **Phase 6: Design→Code Integration Spec** - 分层模型、玻璃模糊预算、token→uniform 映射、海报资源管线集成规范 — *已交付：docs/INTEGRATION_SPEC.md + handoffSpec.ts*
- [ ] **Phase 7: Cross-Device QA & Reference Consistency** - 跨设备/跨 GPU 视觉与性能校验，对照参考图一致性确认

## Phase Details

### Phase 1: Static Design Foundation & Liquid Demo
**Goal**: 4 个核心界面的静态设计稿、作为系统级底层母题的液态渐变、以及一个可直接运行的 WebGL 液态动态背景 demo，作为后续所有工作的视觉真理来源。
**Mode**: mvp
**Depends on**: Nothing (initialization backfill)
**Requirements**: DESIGN-01, DESIGN-02, VISUAL-01
**Success Criteria** (what must be TRUE):
  1. 登录/注册、首页仪表盘、列表+详情、个人中心/设置 4 个核心界面以静态设计稿存在于 Ardot 文件 709534505401417
  2. 液态渐变作为系统级底层母题铺到全部 4 个界面（单层 NORMAL 线性渐变近似）
  3. 一个零依赖、可直接运行的 WebGL 液态动态背景 demo（liquid-demo.html）存在，含域扭曲噪声的流动+变形
**Plans**: delivered (backfill) — not re-executed
**UI hint**: yes

> **Backfill note:** Phase 1 在项目初始化阶段已完成并回填。其成功标准用于记录已交付状态，不再执行计划。后续 Phase 从 Phase 2 起向前推进。

### Phase 2: Production WebGL Liquid Component
**Goal**: 液态背景从独立 demo 进化为生产可用、可集成的组件，shader 原样移植到目标技术栈，配色/速度/扭曲提升为 uniform 并由主题 token 驱动。
**Mode**: mvp
**Depends on**: Phase 1 (liquid-demo.html 的域扭曲 fbm shader 是真理来源)
**Requirements**: VISUAL-02
**Success Criteria** (what must be TRUE):
  1. liquid-demo.html 的域扭曲 fbm shader 在目标技术栈内以可复用组件运行（`<LiquidBackground/>`，固定全屏 canvas，z:10，`pointer-events:none`）
  2. 调色板（u_color[5]/u_base）、强度、速度、扭曲以 uniform 暴露，可由主题 token 驱动（热路径中无硬编码 vec3 字面量）
  3. canvas 位于根层叠上下文，无 transform/opacity/will-change 祖先，backdrop-filter 采样不会被静默破坏
  4. 在健康 GPU 上组件以预期质量渲染流动+变形液态，控制台无报错
**Plans**: 1 plan
- [ ] 02-01-PLAN.md — Verbatim shader port + LiquidCanvas engine + ThemeBridge + <LiquidBackground/> wrapper + stacking-context contract + theme-drive demo + 4-criterion verification gate
**UI hint**: yes

### Phase 3: Degradation & Performance Tiers
**Goal**: 液态组件在低端/集成 GPU 上保持性能、不熔化 GPU、不耗尽电池，具备自动质量分级（T1 全量 / T2 冻结帧 / T3 静态海报），并以海报兜底保证永不出现黑色空洞。
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: VISUAL-03
**Success Criteria** (what must be TRUE):
  1. 在低端/集成 GPU 上液态自动缩放分辨率（DPR 上限 ≤1.5，qualityScale 1.0→0.75→0.5），无热节流崩溃（无「30 秒后衰减」特征）
  2. 标签页隐藏时（visibilitychange）rAF 循环被取消，返回时以时间偏移恢复（无时间跳变伪影）
  3. z:0 始终存在主题化静态海报（T3），canvas 关闭/降级时不出现黑色空洞且无布局位移
  4. 质量分级基于运行时能力检测（GPU 分级 / save-data / 低功耗启发式）自动选择
**Plans**: TBD
**UI hint**: yes

### Phase 4: Accessibility & No-WebGL Fallback
**Goal**: 液态尊重用户的运动偏好，并在 WebGL 不可用时优雅降级，满足 WCAG 2.2.2（暂停/停止/隐藏）并永不呈现黑屏。
**Mode**: mvp
**Depends on**: Phase 3 (复用分级机制与海报兜底)
**Requirements**: VISUAL-04
**Success Criteria** (what must be TRUE):
  1. 开启 prefers-reduced-motion 时液态仅渲染一帧静态画面并停止动画循环（无持续运动），且偏好变化时实时响应
  2. 无 WebGL（或 WebGL 上下文丢失）的设备/浏览器上展示主题化静态海报（T3），无黑屏、无破画布伪影
  3. 降级链路端到端可观测（T1 动画 → T2 冻结 → T3 海报），每一级均非黑且配色一致
  4. shader 精度安全处理（尝试 highp，失败回退 mediump），老旧/移动 GPU 不黑屏
**Plans**: 1 plan
- [ ] 04-01-PLAN.md — prefers-reduced-motion dynamic listener + webglcontextlost T3 fallback + data-tier DOM observability + dev harness simulation + Vitest contract test suite
**UI hint**: yes

### Phase 5: Liquid Element Differentiators & Static Canvas Verification
**Goal**: 液态签名织入核心交互 UI 元素（Logo、激活态导航、主按钮、头像、状态胶囊），并在截图后端恢复后校验/精修静态画布的液态观感，完成静态层面的液态设计语言。
**Mode**: mvp
**Depends on**: Phase 4 (液态背景配色/运动语言已稳定，差异化元素派生自它)
**Requirements**: DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. 品牌 Logo 标记承载液态渐变签名，在全部 4 个界面保持一致
  2. 激活态导航（含签名「倾倒」微交互）、主 CTA 按钮（每屏 1–2 个）、头像、状态胶囊均承载液态签名
  3. 截图后端恢复后，静态 Ardot 画布液态观感对照参考图校验，必要时上多层发光色团版
  4. 液态仅作强调保留（不铺在密集数据表格或正文文字背后），符合反特性护栏
**Plans**: TBD
**UI hint**: yes

### Phase 6: Design→Code Integration Spec
**Goal**: 产出完整的集成契约，让工程师能忠实落地液态+玻璃系统：分层 z-stack 模型、玻璃模糊预算、token→uniform 映射、海报资源管线。
**Mode**: mvp
**Depends on**: Phase 5 (规范化现已完整的液态+玻璃设计系统)
**Requirements**: HANDOFF-01
**Success Criteria** (what must be TRUE):
  1. 分层 z-stack 模型已文档化（海报 z:0 / canvas z:10 / UI z:30+ / 弹层 z:50），含 backdrop-filter 层叠上下文规则
  2. 玻璃模糊预算已规定（模糊半径上限 ~12–16px、每屏 ≤2 个实时 backdrop-filter 面、`@supports` 实色兜底）
  3. token→uniform 映射已规定（哪些主题 token 喂给 u_color/u_base/u_intensity/u_speed/u_warp），保证 shader 与海报同配色
  4. 海报资源管线已定义（从 shader 锚定帧自动截取 → 主题化 WebP ≤80 KB），含 T1↔T3 无缝衔接要求
**Plans**: TBD
**UI hint**: yes

### Phase 7: Cross-Device QA & Reference Consistency
**Goal**: 液态+玻璃系统在目标设备/GPU 上完成验证，确认与参考图一致，并端到端演练完整降级链路。
**Mode**: mvp
**Depends on**: Phase 6
**Requirements**: QA-01
**Success Criteria** (what must be TRUE):
  1. 液态在目标桌面 GPU 及至少一台真实移动/iOS 设备（WebGL1/mediump 金丝雀）上正确渲染（流动+变形、配色一致）
  2. 降级链路 T1→T2→T3 在真实硬件上端到端演练，每一级均非黑且视觉一致
  3. 集成 GPU 硬件上性能符合既定预算（无热节流崩溃、标签页隐藏暂停生效）
  4. 视觉输出对照参考图（4 张参考截图 + Spectra 液态意图）确认一致，分歧已记录
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 (delivered) → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Static Design Foundation & Liquid Demo | delivered (backfill) | Complete (backfill) | 2026-07-30 |
| 2. Production WebGL Liquid Component | 1 plan | Complete | 2026-07-30 |
| 3. Degradation & Performance Tiers | 1 plan | Complete | 2026-07-30 |
| 4. Accessibility & No-WebGL Fallback | 1 plan | Complete | 2026-07-30 |
| 5. Liquid Element Differentiators & Static Canvas Verification | 1 plan | Complete | 2026-07-30 |
| 6. Design→Code Integration Spec | 1 plan | Complete | 2026-07-30 |
| 7. Cross-Device QA & Reference Consistency | 0/TBD | Not started | - |
