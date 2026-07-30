# 灵犀 Nexus — 液态美学桌面应用界面

## What This Is

「灵犀 Nexus」是一个面向企业员工的桌面端（Web 应用）生产力/任务管理产品界面设计。以深色玻璃质感（dark glassmorphism）为基底，以** WebGL 驱动的动态液态渐变**作为贯穿全站的视觉母题，目标是既美观又易用。当前已产出 4 个核心界面的静态设计稿（Ardot 画布）与 1 个可直接运行的 WebGL 液态动态背景（HTML）。

## Core Value

用户打开应用第一眼就能感受到「会流动、会呼吸」的液态视觉，且这种液态美学作为系统级母题一致地贯穿登录、仪表盘、列表详情、设置等所有界面——而非某一处的装饰。

## Requirements

### Validated

<!-- 已交付（尚未经真实用户验证） -->

- ✓ 深色玻璃质感 + 翠绿强调色（#4ADE80）的视觉方向确立 — 初始化阶段
- ✓ 4 个核心界面静态设计稿（登录/注册、首页仪表盘、列表+详情、个人中心/设置） — Ardot 文件 709534505401417
- ✓ 液态渐变作为系统级底层母题铺到 4 个界面（单层 NORMAL 线性渐变） — 初始化阶段
- ✓ WebGL 动态液态背景 demo（fragment shader + 域扭曲噪声，流动+变形） — liquid-demo.html

### Active

- [ ] 液态签名织入核心交互元素：品牌 Logo 标记、激活态导航、主按钮、头像/状态胶囊
- [ ] 截图后端恢复后，对照参考图校验静态画布液态观感，必要时上多层发光色团版
- [ ] 决定并实现：浅色 Spectra 全套方向 vs 维持深色液态方向
- [ ] 将 WebGL 液态按目标技术栈封装为可集成组件（原生 WebGL / Three.js / React）
- [ ] 液态效果的性能与降级策略（低端 GPU、移动端、prefers-reduced-motion）

### Out of Scope

- 后端服务、数据库、鉴权逻辑 — 本项目仅做界面设计与动态视觉，非全栈实现
- 真正的 WebGL 流体在静态 .ardot 画布内运行 — 画布为静态设计稿，动态效果以代码交付
- 多语言/i18n、无障碍全量审计 — 暂不在本轮设计范围

## Context

- 起点是用户提供的 4 张参考图：前 3 张为统一的深色玻璃 + 翠绿点缀桌面应用风格；第 4 张「Spectra」为浅色 + 胶囊形流动彩色渐变（液态），并明确提出液态需含「流动、变形」动态行为。
- 另参考 Dribbble「Quarn SaaS AI Workflow Control Dashboard」（RonDesignLab）的整体设计调性。
- 设计工具为 Ardot（.ardot 静态画布），文件 ID 709534505401417；动态液态以自包含 HTML（liquid-demo.html）交付，零依赖。
- 技术踩坑：当前环境 capture_screenshot 对 SCREEN 混合 + 多层大面积径向渐变会 ADAPTER_TIMEOUT，已收敛为单层 NORMAL 线性渐变；截图后端在栅格化环节存在抖动，导致静态画布无法自我视觉验证。
- 字体使用 Noto Sans SC 保证中文渲染；圆角 20–24px（卡片）/ 12–16px（按钮）。

## Constraints

- **Tech stack**: 静态设计稿 = Ardot .ardot；动态液态 = WebGL fragment shader（域扭曲 simplex 噪声） — 动态效果无法在静态画布内呈现
- **Performance**: WebGL 液态需考虑 GPU 开销与降级，深色底保证 UI 文字可读
- **Tooling**: fetch_editor_state 不支持按节点下钻，无法直接取得子节点 ID；截图后端当前不稳定
- **Compatibility**: 液态需兼容 prefers-reduced-motion 与低端设备

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 深色玻璃 + 翠绿强调色 | 对齐前 3 张参考图统一视觉语言 | ✓ Good |
| 液态作为系统级母题（非单层装饰） | 用户明确要求"作为核心元素的一环" | — Pending（仅完成底层，交互元素待织入） |
| 静态画布用单层 NORMAL 渐变近似液态 | SCREEN 多层导致截图超时；单层更稳且磨砂后接近 Spectra 柔和感 | ⚠️ Revisit（截图恢复后可上多层版） |
| 动态液态以 WebGL shader 交付（非 CSS） | 用户明确要求"用 webgl"，且 shader 域扭曲噪声才能实现真流动变形 | ✓ Good |
| 液态配色取参考粉彩 + 品牌绿 | 兼顾 Spectra 调性与品牌识别 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-30 after initialization (backfill)*
