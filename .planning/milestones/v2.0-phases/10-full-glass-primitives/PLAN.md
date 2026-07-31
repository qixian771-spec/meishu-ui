# Phase 10: Full-Glass Primitives

> 先读 `.planning/EXECUTION-BRIEF.md` 与 Phase 9 产出（`src/glass/`）。

## Goal

从侧栏到列表行都是可组合的玻璃原语，支持玻璃套玻璃（glass-in-glass），并且**嵌套预算有明确规则 + 超预算自动降级 + 测试兜住 R1 红线**。

## Requirements

FR-02（Shell 默认透亮玻璃）、FR-03（Pane 具备高光 rim + 可读内容区 + wash hook）、FR-04（Inset 支持嵌套，预算文档化）

## Success Criteria

1. `GlassShell` 默认渲染为透亮玻璃壳/侧栏，不是哑面石墨块
2. `GlassPane` 具备顶左 specular rim + 可读内容区 + 可选 wash
3. `GlassInset` / `GlassRow` 可嵌在 Pane 内形成玻璃套玻璃
4. blur 嵌套预算写进代码注释与文档；超预算自动 tint-only 回退，有测试
5. 玻璃祖先 `filter` 违规在开发模式下会告警（R1 防复发）

## Plans

| Plan | 名称 | 产出 |
|---|---|---|
| 10-01 | 四件原语 | `GlassAtmosphere` / `GlassShell` / `GlassPane` / `GlassInset`，demo 改为消费它们 |
| 10-02 | 嵌套预算与守卫 | depth context 自动降级、dev-mode filter 守卫、性能与回归测试 |

10-01 先做。

## 现状可复用的东西

- `.glass-container`（及 `--quiet` / `--hero` / `--wash-*` 变体）、`.glass-sidebar`、`.glass-panel-box`、`.glass-stage`、`.glass-rim-arc`、`.glass-cast-shadow` 已在 Phase 9 切到 `src/glass/css/primitives.css`
- `src/components/liquid/SpectraGlassCard.tsx`（288 行）是 Pane 的雏形，含 canvas wash 挂载、status pill、hero 变体。**抽取它的骨架，不要从零写**
- `.liquid-stage-wash` 已实现漂移台面（R2），Phase 10 要把它包装成 `GlassAtmosphere` 组件

## 关键约束

- **CSS-first**（R5）：三件原语不装 WebGL 也必须出玻璃；canvas wash 是可选 prop
- 原语不许 import demo 代码（Phase 9 的边界测试会拦）
- 不许给原语的容器加 `filter`（R1）——浮起效果一律 `box-shadow`
