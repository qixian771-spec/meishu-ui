# 灵犀 Nexus — ClauseOS Glass Framework + Skill

## What This Is

「灵犀 Nexus」已从「做一个任务 App UI」升级为 **ClauseOS 级满屏玻璃设计系统**：可发布的 **组件框架 + AI Skill**，让他人（以及喂喂 App）能复刻同档透亮玻璃、玻璃套玻璃、统一色调。

当前仓库里的任务仪表盘是 **demo 画廊 / 验收台**，不是最终产品 UI。动机来自喂喂 App 前端不够好看——本里程碑先把系统做硬，喂喂接入放后续。

## Core Value

别人用这套框架或 Skill，能做出 **满屏透亮玻璃 + 玻璃套玻璃 + 一套色打到底** 的界面——而不是再手搓一堆半哑面板。

## Current Milestone: v2.0 ClauseOS Glass Framework + Skill

**Goal:** 把满屏玻璃系统做成可复用的组件框架与 Cursor/Claude Skill；任务页降级为 demo；喂喂对接路径写清但不在本里程碑改喂喂代码。

**Target features:**
- 满屏玻璃原语（侧栏/顶栏/面板/列表行/嵌套卡均可玻璃化，含 glass-in-glass）
- 统一色调包（克莱因 / 翠玉 / 天际 / 琥珀）一套色打到底
- 可发布 Skill + 组件库（文档、API、demo 画廊）
- 喂喂对接路径文档（如何迁到玻璃层）— 实现留给后续

**CEO decisions (2026-07-30):**
- 交付形态：Skill 与组件框架同等重要（1C）
- 优先级：先做硬框架/Skill，喂喂后接（2A）
- 版本：v2.0 大升级（3A）

## Requirements

### Validated（v1 已交付）

- ✓ 深色石墨工作区 + 冷色强调的视觉探索
- ✓ WebGL / Canvas 液态与玻璃卡片试验（Liquid*、SpectraGlassCard、色调切换雏形）
- ✓ 集成规范与跨设备 QA 基线（docs/INTEGRATION_SPEC.md 等）
- ✓ 4 屏静态设计稿与液态 demo 回填

### Active（v2.0）

- [ ] 满屏玻璃：侧栏、列表、嵌套面均为可组合玻璃原语（ClauseOS 向）
- [ ] 玻璃套玻璃：外层壳 + 内层卡/行有清晰材质层级
- [ ] 统一色调系统可切换且整页同色相
- [ ] 组件框架可被外部项目引用/拷贝集成
- [ ] Cursor/Claude Skill 可指导 AI 按契约落地同档质感
- [ ] Demo 画廊展示原语与组合，不绑定「灵犀任务产品」叙事
- [ ] 喂喂对接路径文档（迁移步骤与边界）

### Out of Scope（本里程碑）

- 喂喂 App 代码改造与发布 — 本轮只交付对接路径，实现后续里程碑
- 后端 / 鉴权 / 真实任务数据
- 把当前任务仪表盘当成最终产品 UI 继续堆功能
- 浅色 Spectra Studio 全站重做（可作未来色调包）

## Context

- 北星参考：[ClauseOS / RonDesignLab](https://rondesignlab.com/cases/clause-os-compliance-management-saas) — 满屏玻璃卡、卡内彩色、静空间、单锚点；强调色用我们自己的色调包，不抄 Harmony Green 当唯一品牌色。
- 用户反馈：左侧不是玻璃、缺少 glass-in-glass、色调要统一可切换；「这不是我要的 UI」——要的是可复用系统。
- 已有资产：`SpectraGlassCard`、`accentThemes`、`glassWash`、液态组件、INTEGRATION_SPEC — v2 重构为框架边界清晰的包，而非继续在 App 壳上打补丁。

## Constraints

- **Tech:** React + CSS（backdrop-filter / 分层）为主；Canvas/WebGL 作戏眼可选，不绑架框架核心
- **Performance:** 多层 `backdrop-filter` 有预算；嵌套玻璃需文档化上限与降级
- **Distribution:** Skill 走 Cursor/Claude skills 目录约定；组件以清晰包结构 + 文档交付（npm 可选）
- **Brand:** 色调包可切换；默认克莱因；翠玉对齐 ClauseOS 绿系观感

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v2 产品形态 = 框架 + Skill | 喂喂与他人复用；当前 App 只是验收台 | ✓ Locked |
| 先框架后喂喂 | 避免半成品玻璃被产品页绑死 | ✓ Locked |
| ClauseOS 满屏玻璃 + nested glass | 用户明确对照与纠正 | ✓ Locked |
| 统一色调包（非彩虹卡） | ClauseOS「绿就全绿」 | ✓ Locked（雏形已有） |
| v1 任务仪表盘降级为 demo | 「这不是我要的 UI」 | ✓ Locked |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-30 — start milestone v2.0*
