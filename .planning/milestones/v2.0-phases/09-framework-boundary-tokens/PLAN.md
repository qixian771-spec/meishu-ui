# Phase 9: Framework Boundary & Tokens

> 先读 `.planning/EXECUTION-BRIEF.md`。本 phase 是整个里程碑的地基：token 层不解耦，后面 Skill 和 Remotion 都无从谈起。

## Goal

玻璃系统有清晰的包边界与 token 契约；**token 层平台无关，不绑浏览器**；demo 布局样式与框架样式分离。

## Requirements

FR-01（可导入的原语边界）、FR-05（框架 CSS 与 demo CSS 分离）、FR-06（token 为平台无关纯数据）

## Success Criteria

1. 存在可导入的玻璃模块边界 `src/glass/`，公开导出清单文档化
2. Demo/任务布局 CSS 与框架 token/primitives CSS 分离（改 demo 不会破坏框架 API）
3. 现有 `accentThemes` 成为框架 token 源，而非 App 私货
4. **token 层可在无 DOM / 无 React 环境解析出同一套色值**；CSS 变量注入下移到 web 实现层
5. Vitest 覆盖 token 契约不回归，含一条「不碰 DOM 也能拿到色」的用例

## Plans

| Plan | 名称 | 产出 |
|---|---|---|
| 09-01 | Token 层下沉 | `src/glass/tokens/` 纯数据 + 纯函数；`AccentThemeContext` 瘦身为「消费 + 注入」 |
| 09-02 | CSS 切石 | `spectraGlass.css` 2673 行切成框架 CSS 与 demo CSS；建立 `src/glass/` 边界与导出清单 |

09-01 必须先做完（09-02 的框架 CSS 要引用 09-01 定下的变量名）。

## 关键约束

- **不要改视觉**。这个 phase 是纯重构：六套主题的最终渲染结果必须与重构前逐像素等价（允许的差异只有你主动修掉的 bug）。改完对比一次 24 组合审计。
- 不要引入新依赖，不要建 monorepo（`packages/` 留给以后真要发 npm 时再说，现在 `src/glass/` 就是边界）。
- 保持 `npm test` ≥ 76 个测试全绿。
