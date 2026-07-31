# Architecture Research

**Domain:** Dual delivery — React glass package + AI Skill
**Researched:** 2026-07-30
**Confidence:** HIGH

## Target Shape

```
packages/glass/          (or src/glass/ until extract)
  tokens/                accent themes, CSS vars
  primitives/            GlassShell, GlassPane, GlassInset, GlassRow…
  theme/                 AccentThemeProvider
  motion/                optional wash / ultrathink adapters
  index.ts               public API

skill/meishu-ui/
  SKILL.md               when to use, hard rules, recipes
  references/            layer-model.md, theme-packs.md, do-dont.md

apps/demo/ or src/App    gallery screens composing primitives only
docs/                    FRAMEWORK.md + WEIWEI_MIGRATION.md
```

## Layer Model (source of truth)

| Layer | Role | Glass? |
|-------|------|--------|
| Atmosphere | `--app-bg` blooms, optional liquid | No UI chrome |
| Shell | Sidebar, topbar, page frame | Yes — translucent |
| Pane | Panels, cards, smart detail | Yes — primary glass |
| Inset | Rows, nested AI cards, chips | Yes — nested glass |
| Content | Text, controls | Opaque enough for WCAG |

**Rule:** Nest depth default ≤2 live `backdrop-filter` levels; deeper nests use tint-only fallback.

## Theme Token Flow

`AccentThemeProvider` → `documentElement` CSS vars + `data-accent-theme` → primitives consume vars → optional canvas wash reads same RGB palettes from `accentThemes.ts`.

## Build Order

1. Tokens + layer CSS contracts  
2. Primitives (Shell/Pane/Inset/Row)  
3. Refactor demo App off monolothic `spectraGlass.css` product styles  
4. Skill authored against frozen API  
5. 喂喂 migration doc  

## New vs Modified

| Item | Action |
|------|--------|
| `spectraGlass.css` monolith | Split: framework tokens/primitives vs demo-only layouts |
| `SpectraGlassCard` | Become Pane + optional wash adapter |
| `DashboardWorkspace` | Demo composition only |
| Skill | New |
| 喂喂 repo | Out of scope (doc only) |
