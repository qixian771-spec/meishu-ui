---
phase: 9
slug: framework-boundary-tokens
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-31
---

# Phase 9 — Security

> Retroactive STRIDE (plans had no `<threat_model>`). ASVS L1. `security_block_on: high`.

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser localStorage → theme resolver | Preference id only | string theme id |
| Token resolve → DOM CSS vars | Closed-set colour tokens | hex / rgb strings from `ACCENT_THEMES` |
| Demo App → glass package | Import public API | React components / CSS |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-9-01 | Tampering | `AccentThemeContext.readStoredTheme` | high | mitigate | `isAccentThemeId` allowlist; illegal / unknown → `DEFAULT_ACCENT_THEME`; legacy `mint→ref123` | closed |
| T-9-02 | Injection | `applyThemeTokens` CSS vars | high | mitigate | Values only from `resolveThemeTokens` → `ACCENT_THEMES` constants; never write raw localStorage into `setProperty` | closed |
| T-9-03 | Spoofing | `setThemeId` | medium | mitigate | TypeScript `AccentThemeId` + UI chips only expose allowlisted ids | closed |
| T-9-04 | Information Disclosure | localStorage theme key | low | accept | Preference only; no secrets/PII | closed |
| T-9-05 | Denial of Service | Google Fonts `@import` in tokens.css | low | accept | Demo/CDN dependency; offline falls back to system fonts | closed |
| T-9-06 | Elevation of Privilege | N/A | low | accept | No auth/roles in this phase | closed |

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-9-01 | T-9-04 | Theme preference is non-sensitive | CEO / orchestrator | 2026-07-31 |
| R-9-02 | T-9-05 | Font CDN outage only affects typography, not security boundary | CEO / orchestrator | 2026-07-31 |
| R-9-03 | T-9-06 | Phase has no privilege model | CEO / orchestrator | 2026-07-31 |

## Evidence (L1)

- `isAccentThemeId` / `resolveAccentTheme` in `src/liquid/accentThemes.ts` + re-export via `src/glass/tokens`
- `readStoredTheme` only accepts allowlisted ids (`src/theme/AccentThemeContext.tsx`)
- `applyThemeTokens` sets properties exclusively from `ThemeTokens` object
- Node test `src/glass/tokens/__tests__/resolveTheme.test.ts` (@vitest-environment node)
- Boundary test forbids glass → demo imports

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-31 | 6 | 6 | 0 | gsd-secure-phase (retroactive STRIDE, ASVS L1) |

## Sign-Off

- [x] All threats have a disposition
- [x] Accepted risks documented
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-31
