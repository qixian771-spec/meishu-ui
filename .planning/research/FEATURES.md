# Feature Research

**Domain:** ClauseOS-style glass design system + Skill
**Researched:** 2026-07-30
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (must ship in v2.0)

| Feature | Complexity | Notes |
|---------|------------|-------|
| GlassShell (app chrome / sidebar / main) | MEDIUM | Full-screen glass, not matte sidebar |
| GlassPane (panel / card) | LOW | Specular rim + blur + theme wash hook |
| GlassInset (nested glass) | MEDIUM | Glass-in-glass list rows, AI boxes, chips |
| Cohesive theme packs (4+) | MEDIUM | One hue family; switchable; persisted |
| Layer model documented | LOW | atmosphere → shell → pane → inset → content |
| Demo gallery (not product UI) | MEDIUM | Shows primitives + compositions |
| Skill with recipes | MEDIUM | Agent can rebuild look in another app |
| Migration path doc for 喂喂 | LOW | Steps only; no 喂喂 code this milestone |

### Differentiators

| Feature | Complexity | Notes |
|---------|------------|-------|
| Tonal wash roles (soft/mid/deep/glow) | LOW | Already prototyped in `accentThemes` |
| Ultrathink / canvas wash as optional focal | MEDIUM | Existing; Skill marks as optional |
| Material budget rules (blur caps, nest depth) | MEDIUM | Prevents GPU mush |
| Dual delivery: code API ↔ Skill contracts stay synced | HIGH | Tests + “source of truth” files Skill reads |

### Anti-features

- Rainbow washes across one screen (breaks ClauseOS cohesion)
- Treating task dashboard as the product
- Glass on every dense data cell without readability floor
- Requiring WebGL for “hello world” glass
- Shipping Skill that contradicts CSS primitives

### Existing assets to absorb (not invent)

- `SpectraGlassCard`, `glassWash`, `accentThemes`, `ThemeSwitcher`, liquid elements, INTEGRATION_SPEC

## Dependencies

Theme packs → all primitives read tokens.  
GlassInset depends on GlassPane opacity rules.  
Skill depends on frozen public API names + layer docs.  
Demo gallery depends on primitives export.
