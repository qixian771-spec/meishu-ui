---
phase: 10
slug: full-glass-primitives
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-31
---

# Phase 10 — Security

> Retroactive STRIDE. ASVS L1.

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|----------------|
| Pointer events → CSS vars | Mouse/touch coords → `--glass-lx/ly` etc. | numbers only |
| Depth context → blur | Integer depth from React tree | closed-set budget |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-10-01 | Denial of Service | `useGlassPointer` rAF | medium | mitigate | Single rAF; only topmost `.is-interactive` reacts | closed |
| T-10-02 | Tampering | CSS custom props from pointer | low | accept | Numeric coords only; no string injection | closed |
| T-10-03 | Spoofing | N/A | low | accept | No auth surface | closed |

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-10-01 | T-10-02 | Pointer → CSS vars are non-sensitive presentation | orchestrator | 2026-07-31 |

## Sign-Off

- [x] threats_open: 0
- [x] status: verified

**Approval:** verified 2026-07-31
