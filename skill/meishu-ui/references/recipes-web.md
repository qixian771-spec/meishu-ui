# Web recipes (live glass)

## Empty project → full-screen glass

1. Copy `src/glass/`
2. `import './glass/css/index.css'`
3. `applyThemeTokens(resolveThemeTokens('ref123'))`
4. Render `<GlassAtmosphere />` + `<GlassShell>` + `<GlassPane>`

## Nested list

```tsx
<GlassPane wash="soft">
  {rows.map((r) => (
    <GlassInset key={r.id} as="row" wash="mid">{r.title}</GlassInset>
  ))}
</GlassPane>
```

## Add a theme pack

Extend `ACCENT_THEMES` in `src/glass/tokens/accentThemes.ts` with primary/swatch/washes/ultrathink/blooms.  
If `surface: 'light'`, set `stageBg` and verify light CSS overrides + contrast audit.
