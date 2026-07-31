---
phase: 11
slug: theme-packs-demo-gallery
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-31
---

# Phase 11 — Security

> Continues Phase 9 theme trust boundary. ASVS L1.

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-11-01 | Tampering | theme pack switcher | high | mitigate | Allowlist + closed-set pack tokens | closed |
| T-11-02 | Injection | root CSS vars on switch | high | mitigate | `applyThemeTokens` from resolved packs only | closed |
| T-11-03 | Information Disclosure | localStorage theme | low | accept | Preference only | closed |

## Sign-Off

- [x] threats_open: 0
- [x] status: verified
