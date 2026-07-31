# 灵犀 Nexus — meishu-ui Glass Art System

## What This Is

可复刻的玻璃美术资产：真身是 **token + 契约（Skill `meishu-ui`）**；`src/glass` 的 React/CSS 是第一个实现。Demo 画廊是验收台，不是任务产品。

消费路径：`美术 → Skill → app`，以及（v2.1）`美术 → Skill → Remotion → 视频`。

## Core Value

别人用这套 token 与 Skill，能做出 **满屏透亮玻璃 + 玻璃套玻璃 + 一套色打到底** 的界面；同一套美术能打到 app 与视频渲染。

## Current Milestone

**Awaiting v2.1** (Remotion / precomposed glass). v2.0 shipped 2026-07-31.

## Requirements

### Validated

- ✓ 深色石墨工作区 + 冷色强调的视觉探索 — v1.0
- ✓ WebGL / Canvas 液态与玻璃卡片试验 — v1.0
- ✓ 集成规范与跨设备 QA 基线 — v1.0
- ✓ 平台无关 token + `src/glass` 包边界 — v2.0
- ✓ Atmosphere / Shell / Pane / Inset + nest blur budget — v2.0
- ✓ 七套色调（含白瓷、中国红）+ wash 同色相审计 + 持久化 — v2.0
- ✓ Demo 画廊封面级首屏 + 示例组合免责 — v2.0
- ✓ `meishu-ui` Skill + FRAMEWORK / WEIWEI_MIGRATION — v2.0

### Active（下一里程碑候选）

- [ ] Remotion / 视频预合成玻璃实现（复用 token + 契约）
- [ ] 喂喂按迁移文档接入（实现不在框架仓）

### Out of Scope

- 喂喂仓库改代码（框架仓只交路径）
- 任务产品功能扩展
- 强制 WebGL 才能出玻璃
- 后端 / 鉴权 / 真数据

## Context

- 北星：[ClauseOS / RonDesignLab](https://rondesignlab.com/cases/clause-os-compliance-management-saas)
- 代码：`src/glass/`、`skill/meishu-ui/`、`src/demo/`；测试 122 绿（v2.0 ship）
- Pack 真源：`src/glass/tokens/accentThemes.ts`（liquid 仅兼容 re-export）

## Constraints

- **Tech:** React + CSS backdrop-filter 为主；Canvas/WebGL 可选
- **Performance:** 真 blur ≤ 2 层；更深 tint-only
- **Distribution:** Skill 软链；组件以包结构 + 文档交付
- **Brand:** 色调包可切换；不许硬编码品牌色进框架

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v2 产品形态 = 框架 + Skill | 喂喂与他人复用 | ✓ Good |
| 先框架后喂喂 | 避免半成品绑死产品页 | ✓ Good |
| 美术真身 = token + 契约 | app 与 Remotion 共用判定 | ✓ Good |
| Remotion 推 v2.1 | 渲染器无 backdrop-filter | ✓ Good |
| Skill 名 `meishu-ui` | CEO 定；靠 description 检索 | ✓ Good |
| klein ≈ sky 保留两套 | CEO 锁 | ✓ Good |
| 第七套中国红 cinnabar | CEO 加；细金发丝不抢朱砂 | ✓ Good |
| Pack 迁入 `src/glass/tokens` | 清 FR-05 / 边界债 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-07-31 after v2.0 milestone*
