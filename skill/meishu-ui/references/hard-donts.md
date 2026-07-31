# Hard don'ts (verified 2026-07-31)

## 1. No `filter` on any glass ancestor

**Symptom:** glass becomes an opaque grey slab; invisible on dark themes, obvious on light.  
**Why:** filtered ancestor re-roots `backdrop-filter` sampling.  
**Fix:** float shadows via the glass node's own `box-shadow`.

## 2. Opaque stage = no refraction

**Symptom:** blur exists but looks like grey plastic.  
**Fix:** mount `GlassAtmosphere` (or equivalent drifting colour).

## 3. No hardcoded brand hues

**Symptom:** after theme switch, one control stays old colour.  
**Fix:** `var(--accent-primary)` / `color-mix(...)` / wash tokens. Keep shadows neutral.

## 4. Light surface needs overrides

**Symptom:** white-on-white text.  
**Fix:** every new glass class needs `html[data-surface='light']` rules.

## 5. Live blur nesting ≤ 2

**Symptom:** muddy stack + jank.  
**Fix:** depth 3+ uses `.is-tint-only` (no backdrop-filter).
