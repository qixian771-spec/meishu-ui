# Phase 12: Skill + 喂喂 Path

> 先读 `.planning/EXECUTION-BRIEF.md`。这是本里程碑的**真正交付物**——前面三个 phase 都是为了让这份契约有东西可指。

## Goal

别人（尤其是 AI）拿着 Skill 就能在别的项目里复刻这套美术；喂喂有明确的迁移路径。

## Requirements

SK-01（Skill 教会分层模型/硬禁忌/配方）、SK-02（API 与 token 名与框架一致）、SK-03（CSS-first，WebGL 可选）、SK-04（按平台分叉 + 硬禁忌）、HF-01（`docs/WEIWEI_MIGRATION.md`）、HF-02（`docs/FRAMEWORK.md`）

## Success Criteria

1. Skill 安装后可指导生成 Shell→Pane→Inset 组合
2. Skill 中的 API / token 名与框架导出一致
3. Skill 标明 CSS-first、WebGL 可选
4. Skill 按目标平台分叉（浏览器实时玻璃 vs 渲染器预合成），写明硬禁忌
5. `FRAMEWORK.md` + `WEIWEI_MIGRATION.md` 可独立阅读执行

## Plans

| Plan | 名称 | 产出 |
|---|---|---|
| 12-01 | Skill 契约 | `skill/meishu-ui/`（SKILL.md + references），含平台分叉与硬禁忌；一致性测试 |
| 12-02 | 人读文档 | `docs/FRAMEWORK.md` + `docs/WEIWEI_MIGRATION.md` |

## 命名：`meishu-ui`（CEO 已定，不要改）

Skill 名为 **`meishu-ui`**。这个名字有一个必须补偿的副作用：**它本身不含任何技术信号**（不带 glass / css / theme 等词），AI 检索技能时几乎只能靠 `description` 判断该不该激活。

所以 `description` 字段承担全部识别负担，必须同时满足：

- 中英关键词都有：玻璃 / glass / backdrop-filter / token / 主题 / theme / 满屏 / Remotion
- 说清适用平台（Web React/CSS + 视频渲染器两条路径）
- 与用户机器上已有的 `liquid-glass-design`（**Apple iOS 26 SwiftUI** 那套，与本项目无关）区分开——写明本 skill 是 Web/CSS 与平台无关 token，不是 SwiftUI

同理，`SKILL.md` 的「何时激活」一节要写得比一般 skill 更具体，因为名字帮不上忙。

## 交付位置

Skill 源文件放在**仓库内** `skill/meishu-ui/`（可版本控制、可跟着框架一起演进），再在文档里说明如何安装到各家目录：

```
~/.claude/skills/meishu-ui/          Claude Code
~/.cursor/skills-cursor/meishu-ui/   Cursor
~/.codex/skills/meishu-ui/           Codex
```

安装方式建议用软链接（`ln -s`）而不是复制，这样框架改了 skill 自动跟着更新。
