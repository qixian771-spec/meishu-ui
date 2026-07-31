# Roadmap: 灵犀 Nexus — meishu-ui

## Milestones

- ✅ **v1.0** Liquid + SPECTRA exploration — Phases 1–8 (shipped 2026-07-30)
- ✅ **v2.0** ClauseOS Glass Framework + Skill — Phases 9–12 (shipped 2026-07-31)
- 📋 **v2.1** Remotion / video precomposed glass — not started

## Phases

<details>
<summary>✅ v1.0 Liquid + SPECTRA (Phases 1–8) — SHIPPED 2026-07-30</summary>

See git history / prior planning archives.

</details>

<details>
<summary>✅ v2.0 Glass Framework + Skill (Phases 9–12) — SHIPPED 2026-07-31</summary>

- [x] Phase 9: Framework Boundary & Tokens (2/2) — archived
- [x] Phase 10: Full-Glass Primitives (2/2) — archived
- [x] Phase 11: Theme Packs & Demo Gallery (2/2) — archived
- [x] Phase 12: Skill + 喂喂 Path (2/2) — archived

Full detail: [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)  
Requirements: [milestones/v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md)  
Audit: [milestones/v2.0-MILESTONE-AUDIT.md](milestones/v2.0-MILESTONE-AUDIT.md)

</details>

### 📋 v2.1 Remotion / video implementation (Planned)

- [ ] Phase 13: Precomposed glass renderer (blurred backdrop copy + premultiplied wash)
- [ ] Phase 14: Remotion compositions consume `resolveThemeTokens` + meishu-ui contract

**Notes:** Same tokens + Skill contract as v2.0. Renderers lack `backdrop-filter` / `mix-blend-mode` / `z-index` — use DOM order + clipped blur copies. Drive motion with `useCurrentFrame()`.

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 9. Framework Boundary & Tokens | v2.0 | 2/2 | Complete | 2026-07-31 |
| 10. Full-Glass Primitives | v2.0 | 2/2 | Complete | 2026-07-31 |
| 11. Theme Packs & Demo Gallery | v2.0 | 2/2 | Complete | 2026-07-31 |
| 12. Skill + 喂喂 Path | v2.0 | 2/2 | Complete | 2026-07-31 |
| 13. Precomposed glass (planned) | v2.1 | 0/? | Not started | — |
| 14. Remotion compositions (planned) | v2.1 | 0/? | Not started | — |
