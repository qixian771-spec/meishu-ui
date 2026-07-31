# WEIWEI_MIGRATION.md

> Guide only. **This milestone does not change 喂喂 code.** Implementation + visual QA are later.

## Preconditions

- React web app?
- Background solid colour or photo? Solid → add Atmosphere first or glass fails.
- Any ancestor with `filter` / heavy `transform`? Scan and clear before glass.
- Need light + dark? Wire `data-surface` from day one.

## Steps (outside → inside)

1. Import `src/glass/css/index.css` + `applyThemeTokens(resolveThemeTokens(...))` + `<GlassAtmosphere />`
2. Outer chrome → `GlassShell`
3. Main panels → `GlassPane` (one page at a time)
4. Rows / nested cards → `GlassInset`
5. Run contrast / ancestor-filter / hue audits
6. Theme switcher + persistence (`lingxi-accent-theme`)

Each step should be reversible.

## Common conflicts

- UI libraries with opaque fills → lower alpha / wrap in Pane carefully
- `overflow: hidden` / z-index wars vs Atmosphere (`z-index: 0`)
- Brand colours ≠ seven packs → add another pack; don't fork framework tokens randomly
- Hardcoded text colours → switch to `--text-*`

## Out of scope here

Backend, auth, real data, product features, copying demo `.dash-*` layouts wholesale.
