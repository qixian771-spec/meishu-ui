# Pitfalls Research

**Domain:** Packaging glass framework + Skill from demo app
**Researched:** 2026-07-30
**Confidence:** HIGH

## Critical Pitfalls

### 1. Demo ≠ product (scope hijack)
**Warning:** New features keep landing in task dashboard instead of primitives.  
**Prevention:** App is gallery-only; REQ reject “task product” stories.  
**Phase:** 9 (framework boundary)

### 2. Nested `backdrop-filter` GPU storm
**Warning:** Shell + pane + every row all blur live → jank.  
**Prevention:** Budget ≤2 live blur levels; insets may use translucent tint without blur; document caps in Skill.  
**Phase:** 10 (primitives)

### 3. Theme incohesion (rainbow cards)
**Warning:** soft/mid/deep roles painted as different hues.  
**Prevention:** Roles are tonal steps of one `AccentThemeId` only.  
**Phase:** 10–11

### 4. Skill / code drift
**Warning:** Skill teaches class names that refactor deleted.  
**Prevention:** Skill links to `packages/glass` public exports; contract tests; changelog in Skill.  
**Phase:** 12 (Skill)

### 5. Matte chrome regression
**Warning:** “performance” excuses bring back solid sidebar.  
**Prevention:** Shell is glass by default; solid is explicit escape hatch.  
**Phase:** 10

### 6. Over-WebGL as requirement
**Warning:** Hello-world needs shader.  
**Prevention:** CSS-first path in Skill; canvas optional.  
**Phase:** 9–12

### 7. Opacity traps (unreadable text)
**Warning:** Nested glass washes wash out type.  
**Prevention:** Content layer min contrast; left frost zones on wash panes.  
**Phase:** 10–11

### 8. Exporting broken CSS variables
**Warning:** Theme switch updates React state but not `:root` vars.  
**Prevention:** Provider always writes CSS vars (already started).  
**Phase:** 10

## Integration Pitfalls (喂喂 later)

- Host app opaque body kills glass refraction → need atmosphere layer  
- Global CSS resets fighting border-radius / blur  
- Multiple theme systems (antd tokens vs glass tokens) — Skill must say “glass tokens win for chrome”
