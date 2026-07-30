# Requirements — 灵犀 Nexus

> Scope: UI 设计 + WebGL 液态动态视觉的生产化与前端集成指引。非全栈应用实现。

## v1 Requirements

### Design（静态界面）

- [x] **DESIGN-01**: 4 个核心界面静态设计稿（登录/注册、首页仪表盘、列表+详情、个人中心/设置）— *已交付：Ardot 709534505401417*
- [x] **DESIGN-02**: 液态渐变作为系统级底层母题铺到全部 4 个界面 — *已交付*
- [x] **DESIGN-03**: 液态签名织入品牌 Logo 标记（全站一致） — *已交付：LiquidLogo.tsx*
- [x] **DESIGN-04**: 液态签名织入激活态导航、主按钮、头像、状态胶囊等核心交互元素 — *已交付：LiquidButton + LiquidAvatar + LiquidBadge + NavActivePill*
- [x] **DESIGN-05**: 截图后端恢复后，对照参考图校验静态画布液态观感；必要时上多层发光色团版 — *已交付：ardotTokenMap + LiquidStaticBlobs*

### Visual（WebGL 液态动态）

- [x] **VISUAL-01**: WebGL 动态液态背景（fragment shader + 域扭曲噪声，含流动+变形）— *已交付：liquid-demo.html*
- [x] **VISUAL-02**: 将 WebGL 液态移植为生产组件（Three.js/R3F 或保留原生 WebGL），配色/速度/扭曲提升为 uniform，由主题 token 驱动 — *已交付：LiquidCanvas.ts + <LiquidBackground/>*
- [x] **VISUAL-03**: 性能与降级——rAF 门控、visibility 暂停、像素比/分辨率缩放、质量分级（T1 全量 / T2 冻结帧 / T3 静态海报） — *已交付：QualityGovernor + PosterLayer + tierResolver*
- [x] **VISUAL-04**: 无障碍——prefers-reduced-motion 冻结单帧；无 WebGL/低功耗时降级为主题化静态海报 — *已交付：reducedMotion + data-tier + precisionFallback*

### Handoff（设计→代码）

- [x] **HANDOFF-01**: 设计到代码的集成规范（分层模型、玻璃模糊预算、token→uniform 映射、海报资源管线） — *已交付：docs/INTEGRATION_SPEC.md + handoffSpec.ts*

### QA

- [ ] **QA-01**: 跨设备/跨 GPU 视觉与性能校验；对照参考图一致性确认

## v2 Requirements（deferred）

- [ ] 浅色「Spectra」全套主题变体（需全量 token 重做 + 对比度复审）
- [ ] 看板/时间线任务视图（列表视图已满足 v1）
- [ ] 光标响应式液态扭曲（需性能 gating）

## Out of Scope

- 后端服务、数据库、鉴权逻辑 — 本项目仅界面设计与动态视觉
- 真正的 WebGL 流体在静态 .ardot 画布内运行 — 画布为静态设计稿
- 全量无障碍审计、i18n/多语言 — 暂不在本轮范围
- 自研图表引擎 — 复用现有库并做主题化

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DESIGN-01 | Phase 1 | delivered (backfill) |
| DESIGN-02 | Phase 1 | delivered (backfill) |
| VISUAL-01 | Phase 1 | delivered (backfill) |
| DESIGN-03 | Phase 5 | completed |
| DESIGN-04 | Phase 5 | completed |
| DESIGN-05 | Phase 5 | completed |
| VISUAL-02 | Phase 2 | completed |
| VISUAL-03 | Phase 3 | completed |
| VISUAL-04 | Phase 4 | completed |
| HANDOFF-01 | Phase 6 | completed |
| QA-01 | Phase 7 | pending |

*Traceability filled by roadmap (2026-07-30). Coverage: 11/11 v1 requirements mapped.*
