# 灵犀 Nexus — meishu-ui Glass Art System

## What This Is

可复刻的玻璃美术资产：真身是 **token + 契约（Skill `meishu-ui`）**。  
实现分叉：**Web live**（`Glass*` + backdrop-filter）与 **预合成 / Remotion**（`Precomposed*`）。

## Core Value

别人用这套 token 与 Skill，能做出满屏透亮玻璃 + 玻璃套玻璃 + 一套色打到底；同一套美术打到 app 与视频。

## Current Milestone

**None active.** v2.1 shipped 2026-07-31. Awaiting next milestone (likely 喂喂接入 or packaging).

## Requirements

### Validated

- ✓ v1.0 液态 / SPECTRA
- ✓ v2.0 `src/glass` Web + 七套色 + 画廊 + Skill
- ✓ v2.1 precomposed + Remotion `PrecomposedDemo` + runnable recipes

### Active

（空 — 下一里程碑再锁）

### Out of Scope（框架仓）

- 喂喂仓库改代码（只交迁移路径）
- 任务产品功能

## Context

- Preview Web: `npm run dev`
- Preview Remotion: `npm run remotion:studio`
- Tests: ~129 green

## Key Decisions

| Decision | Outcome |
|----------|---------|
| Remotion = v2.1 precomposed fork | ✓ Shipped |
| DOM order over z-index in precomposed | ✓ Good |
| TypeScript pinned 5.8 for Remotion | ✓ Good |

---
*Last updated: 2026-07-31 after v2.1 milestone*
