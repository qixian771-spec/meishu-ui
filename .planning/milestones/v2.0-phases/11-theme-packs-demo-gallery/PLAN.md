# Phase 11: Theme Packs & Demo Gallery

> 先读 `.planning/EXECUTION-BRIEF.md`。

## Goal

一套色打到底、可切换、可持久化；demo 明确变成「示例组合画廊」，不再假装是产品。

## Requirements

TH-01（≥4 套色调，整页同色相）、TH-02（wash 仅为同色相深浅）、TH-03（持久化 + 写 root 变量）、DM-01（画廊展示组合）、DM-02（不宣称是喂喂/最终产品）

## Success Criteria

1. ≥4 套色调切换后整页同色相（含壳/窗格/内嵌）
2. wash 角色仅为同色相深浅
3. 选择可持久化
4. Demo 画廊有明确「示例组合」叙事，非产品承诺

## 现状盘点（Phase 11 比看起来轻）

已经满足或接近满足的：
- **六套**色调已实现（`ref123` 翠玉 / `klein` 克莱因 / `sky` 天际 / `amber` 琥珀 / `chrome` 铬 / `white` 白瓷），超过 TH-01 的 ≥4
- wash 五角色（`soft/mid/deep/glow/chrome`）已是同色相档位（TH-02 的数据结构已对）
- 持久化已有（`localStorage` key `lingxi-accent-theme`，含 legacy `mint→ref123` 迁移）
- 已清掉一批硬编码克莱因蓝泄漏（卡片投影、hover 光晕、hero 边框、地面阴影、CTA、甘特条、`hud-dot`、`dash-doc-bar`）

所以本 phase 的真实工作量在两处：
1. **把「同色相」从人眼判断变成自动检测**（防止泄漏复发，也是 TH-01/02 的验收证据）
2. **画廊叙事**（DM-01/02 完全没做——现在四个页面是在扮演一个真实产品）

## Plans

| Plan | 名称 | 产出 |
|---|---|---|
| 11-01 | 色相一致性自动检测 | 色相审计脚本 + 测试；修剩余泄漏；主题切换器提到全局 |
| 11-02 | Demo 画廊叙事 | 新增画廊首页；四个页面降级为 sample composition；加免责标注 |

## 已知且**不要**处理的事

- **`klein` 与 `sky` 两套色调观感接近**：CEO 已决定「保留两套，先不管」（2026-07-31）。不要合并、不要重新调色、不要提出方案。
