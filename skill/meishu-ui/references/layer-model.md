# Layer model

1. **Atmosphere** (`GlassAtmosphere` / `.liquid-stage-wash`) — drifting accent blobs. Required under glass.
2. **Shell** (`GlassShell` / `.glass-sidebar`) — app chrome; default `variant="glass"`.
3. **Pane** (`GlassPane` / `.glass-container`) — specular rim, wash role, content zone.
4. **Inset** (`GlassInset`) — nested glass; `as="row"` for list rows.

Blur budget (`resolveBlurForDepth`): depth 1 → 24px, depth 2 → 14px, depth 3+ → tint-only.
