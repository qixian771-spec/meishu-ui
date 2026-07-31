# Requirements — 灵犀 Nexus

> Milestone **v2.0**: ClauseOS Glass Framework + Skill.  
> Scope: reusable glass primitives + AI Skill + demo gallery. Not a task-product UI. 喂喂 code out of scope.

## v1 Requirements (shipped — archived)

See `.planning/milestones/` and git history. Liquid/SPECTRA exploration complete; dashboard demoted to demo.

## v2.0 Requirements

### Framework (FR)

- [ ] **FR-01**: Consumer can import glass primitives (`GlassShell`, `GlassPane`, `GlassInset` / row) from a clear package boundary (`packages/glass` or `src/glass`) without pulling task-dashboard code
- [ ] **FR-02**: GlassShell renders sidebar / app chrome as translucent glass (blur + rim), not matte solid graphite by default
- [ ] **FR-03**: GlassPane provides ClauseOS-style frosted pane (specular top-left rim, theme-aware wash hook, readable content zone)
- [ ] **FR-04**: GlassInset supports glass-in-glass (nested panes/rows inside a Pane) with documented nest/blur budget
- [ ] **FR-05**: Framework CSS/tokens are separated from demo-only layout styles (no monolith product CSS required to use primitives)

### Theme (TH)

- [ ] **TH-01**: User can switch among ≥4 cohesive accent packs (克莱因 / 翠玉 / 天际 / 琥珀); entire chrome stays one hue family
- [ ] **TH-02**: Wash roles (`soft` / `mid` / `deep` / `glow`) are tonal steps of the active pack, not mixed rainbow hues
- [ ] **TH-03**: Theme choice persists (e.g. localStorage) and updates CSS variables on the document root

### Demo (DM)

- [ ] **DM-01**: App presents a demo gallery / compositions showcasing Shell + Pane + Inset + themes (task UI may appear only as a sample composition)
- [ ] **DM-02**: Demo does not claim to be the 喂喂 or final product UI

### Skill (SK)

- [ ] **SK-01**: A Cursor/Claude Skill (`SKILL.md` + references) teaches agents the layer model, hard do/don't, and recipes to compose full-screen glass + nested glass + theme packs
- [ ] **SK-02**: Skill references the same public API / token names as the framework (no contradictory class recipes)
- [ ] **SK-03**: Skill documents CSS-first path; WebGL/canvas wash marked optional

### Handoff (HF)

- [ ] **HF-01**: `docs/WEIWEI_MIGRATION.md` (or equivalent) describes how to migrate 喂喂 frontend onto the glass layer (steps, boundaries, out-of-scope)
- [ ] **HF-02**: `docs/FRAMEWORK.md` documents layer model, blur budget, theme packs, and import path for humans

## Future Requirements (deferred)

- [ ] 喂喂 App 实际代码改造与视觉验收
- [ ] npm 正式发包与版本语义化发布流水线
- [ ] Storybook / 多框架（Vue）适配
- [ ] 浅色 Spectra 全套色调包

## Out of Scope (v2.0)

| Item | Reason |
|------|--------|
| 喂喂仓库改代码 | CEO: 先框架后喂喂 |
| 任务产品功能扩展 | Demo only |
| 强制 WebGL 才能出玻璃 | CSS-first |
| 后端 / 鉴权 / 真数据 | 非本里程碑 |

## Traceability

| Requirement | Phase |
|-------------|-------|
| FR-01, FR-05 | 9 |
| FR-02, FR-03, FR-04 | 10 |
| TH-01, TH-02, TH-03, DM-01, DM-02 | 11 |
| SK-01, SK-02, SK-03, HF-01, HF-02 | 12 |

---
*Defined: 2026-07-30 for milestone v2.0*
