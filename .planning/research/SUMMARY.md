# Project Research Summary

**Project:** 灵犀 Nexus — ClauseOS Glass Framework + Skill
**Domain:** Reusable glass design system (React/CSS) + AI Skill packaging
**Researched:** 2026-07-30
**Confidence:** HIGH
**Note:** Inline synthesis after all four research subagents failed connection. Replaces v1 WebGL-liquid-centric SUMMARY for milestone v2.0 purposes.

## Executive Summary

v2.0 is not another task-app UI sprint. It is a **dual delivery**: (1) a React/CSS **glass component framework** with Shell / Pane / Inset primitives and cohesive theme packs, and (2) a **Cursor/Claude Skill** that teaches agents the same layer model so others (and later 喂喂) can reproduce ClauseOS-grade full-screen glass + glass-in-glass. WebGL/canvas washes remain optional accents; framework core must work with CSS glass alone.

Primary risks are nested blur cost, Skill/code drift, and sliding back into product-UI feature creep. Mitigations: blur budget, public API freeze before Skill, demo-gallery-only App.

## Key Findings

### Recommended Stack

React 19 + CSS variables + `backdrop-filter` primitives + Vitest contracts. Optional Canvas wash / existing LiquidBackground. Copy-kit or `packages/glass` first; npm later. Skill as `SKILL.md` + references dual-installed for Cursor/Claude.

### Expected Features

**Must have:** GlassShell, GlassPane, GlassInset/Row, 4 theme packs, layer docs, demo gallery, Skill recipes, 喂喂 migration doc.  
**Differentiator:** Tonal washes + optional ultrathink focal + material budgets.  
**Defer:** 喂喂 code changes, Storybook mandate, mandatory WebGL, light Spectra full reskin.

### Architecture Approach

`packages/glass` (or `src/glass/`) + `skills/clauseos-glass` + demo App. Layers: atmosphere → shell → pane → inset → content. Theme provider drives CSS vars. Split monolothic `spectraGlass.css` into framework vs demo.

### Critical Pitfalls

1. Demo treated as product  
2. Nested blur GPU storm  
3. Rainbow theme incohesion  
4. Skill/code drift  
5. Matte sidebar regression  
6. Over-WebGL requirement  

## Implications for Roadmap

**Phase order:** tokens/boundary → primitives (full glass + nested) → theme polish + demo gallery → Skill + migration doc → verify.

Starting phase number continues from v1: **Phase 9**.

### Suggested Phases

| Phase | Name | Delivers |
|-------|------|----------|
| 9 | Framework boundary & tokens | Extract glass package surface; App = demo host |
| 10 | Full-glass primitives | Shell/Pane/Inset/Row; nested glass; no matte chrome |
| 11 | Theme packs & demo gallery | 4 cohesive themes; gallery compositions |
| 12 | Skill + 喂喂 path | SKILL.md recipes; WEIWEI_MIGRATION.md; API sync |

## Sources

- CEO milestone decisions 2026-07-30 (1C/2A/3A)
- ClauseOS / RonDesignLab case reference
- Existing repo: accentThemes, SpectraGlassCard, spectraGlass.css, INTEGRATION_SPEC
- Prior v1 research (liquid/WebGL) retained historically under milestones archive — not governing v2 core
