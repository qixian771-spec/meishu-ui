# Stack Research

**Domain:** Reusable ClauseOS-grade glass UI framework + AI Skill (React/CSS)
**Researched:** 2026-07-30
**Confidence:** HIGH
**Note:** Written inline after research subagents failed connection; supersedes v1 liquid-WebGL-centric stack research for milestone v2.0.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x (existing) | Component framework surface | Already in repo; consumers of 喂喂-class apps are React |
| CSS custom properties + `backdrop-filter` | native | Glass material core | ClauseOS look is frosted panes + rim light, not mandatory WebGL |
| TypeScript | 7.x (existing) | Typed public API for primitives | Prevents Skill/code contract drift |
| Vite | 8.x (existing) | Demo gallery + library build | Fast HMR for material iteration |
| Vitest + Testing Library | existing | Contract tests for primitives | Framework must stay green when CSS refactors |

### Supporting Libraries

| Library | Purpose | When to Use |
|---------|---------|-------------|
| Canvas2D wash / ultrathink (existing `glassWash` / `ultrathink`) | Colored glass interior + focal motion | Optional accent on hero/focal panes — **not** framework core dependency |
| WebGL LiquidBackground (existing) | Atmosphere option | Demo / advanced recipe only; Skill must teach CSS-first path |
| No new UI kit (MUI/Chakra) | — | Would fight glass tokens; avoid |

### Distribution

| Channel | Format | Notes |
|---------|--------|-------|
| Component framework | `packages/glass` or `src/glass/` + clear exports | Copy-kit first; npm publish optional later |
| Cursor Skill | `.cursor/skills/clauseos-glass/SKILL.md` (+ references) | Agent-facing recipes |
| Claude Skill | `~/.claude/skills/...` or project `.claude/skills/` | Same content, dual install docs |
| Tokens | CSS variables on `[data-accent-theme]` | Single source for App + Skill examples |

## What NOT to Add

- Three.js / R3F as **required** peer for glass core (keep optional)
- Tailwind-only glass utilities without semantic primitives (Skill can't teach composition)
- Heavy design-token npm (Style Dictionary) in v2.0 — plain CSS vars enough
- Storybook mandatory — demo gallery App is enough for CEO visual QA

## Installation (consumer path)

1. Copy `glass` package + theme CSS
2. Wrap app in `AccentThemeProvider`
3. Compose `GlassShell` → `GlassPane` → `GlassInset`
4. Install Skill so AI follows the same layer model

## Confidence Notes

HIGH for CSS glass + React primitives. MEDIUM for npm packaging polish (defer if copy-kit ships first).
