# Roadmap: 灵犀 Nexus — v2.0 ClauseOS Glass Framework + Skill

## Overview

v1 完成液态/玻璃试验。v2.0 把交付物升级为 **可复用玻璃框架 + AI Skill**：满屏玻璃、玻璃套玻璃、统一色调包；App 降为 demo 画廊；喂喂只交迁移文档。

**Phase numbering:** continues from v1 (last phase 8) → starts at **Phase 9**.

## Phases

- [ ] **Phase 9: Framework Boundary & Tokens** — 抽出玻璃包边界与 token；App 仅作 host
- [ ] **Phase 10: Full-Glass Primitives** — Shell / Pane / Inset；嵌套玻璃与模糊预算
- [ ] **Phase 11: Theme Packs & Demo Gallery** — 四套统一色调 + 组合画廊
- [ ] **Phase 12: Skill + 喂喂 Path** — Skill 契约与迁移/框架文档

## Phase Details

### Phase 9: Framework Boundary & Tokens
**Goal:** 玻璃系统有清晰包边界与 token 契约；demo App 不再与框架代码缠死。  
**Requirements:** FR-01, FR-05  
**Success Criteria:**
1. 存在可导入的玻璃模块边界（`packages/glass` 或 `src/glass`），导出列表文档化
2. Demo/任务布局 CSS 与框架 token/primitives CSS 分离（改 demo 不破坏包 API）
3. 现有 `accentThemes` / CSS 变量成为框架 token 源，而非 App 私货
4. Vitest 至少覆盖 token/resolve 契约不回归  
**UI hint:** yes  
**Plans:** TBD

### Phase 10: Full-Glass Primitives
**Goal:** 侧栏到列表行均为可组合玻璃原语，支持 glass-in-glass。  
**Depends on:** Phase 9  
**Requirements:** FR-02, FR-03, FR-04  
**Success Criteria:**
1. GlassShell 默认透亮玻璃侧栏/壳（非哑面）
2. GlassPane 具备顶左高光 rim + 可读内容区 + 可选 wash
3. GlassInset/Row 可嵌在 Pane 内形成玻璃套玻璃
4. 文档/注释写明 blur 嵌套预算；超预算有 tint-only 回退  
**UI hint:** yes  
**Plans:** TBD

### Phase 11: Theme Packs & Demo Gallery
**Goal:** 一套色打到底可切换；画廊展示组合，不扮演产品。  
**Depends on:** Phase 10  
**Requirements:** TH-01, TH-02, TH-03, DM-01, DM-02  
**Success Criteria:**
1. ≥4 套色调切换后整页同色相（含壳/窗格/内嵌）
2. wash 角色仅为同色相深浅
3. 选择可持久化
4. Demo 画廊有明确「示例组合」叙事，非产品承诺  
**UI hint:** yes  
**Plans:** TBD

### Phase 12: Skill + 喂喂 Path
**Goal:** 别人（含 AI）能按契约复刻；喂喂有迁移路径。  
**Depends on:** Phase 11  
**Requirements:** SK-01, SK-02, SK-03, HF-01, HF-02  
**Success Criteria:**
1. Skill 安装后可指导生成 Shell→Pane→Inset 组合
2. Skill 中的 API/token 名与框架导出一致
3. Skill 标明 CSS-first、WebGL 可选
4. FRAMEWORK.md + WEIWEI_MIGRATION.md 可独立阅读执行  
**UI hint:** no  
**Plans:** TBD

## Coverage

| REQ | Phase |
|-----|-------|
| FR-01 FR-05 | 9 |
| FR-02 FR-03 FR-04 | 10 |
| TH-01 TH-02 TH-03 DM-01 DM-02 | 11 |
| SK-01 SK-02 SK-03 HF-01 HF-02 | 12 |

100% of v2.0 requirements mapped.
