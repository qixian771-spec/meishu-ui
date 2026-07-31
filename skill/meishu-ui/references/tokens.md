# Tokens

```ts
import { resolveThemeTokens, applyThemeTokens, ACCENT_THEME_ORDER } from './glass';

const tokens = resolveThemeTokens('klein'); // works in Node — no DOM
applyThemeTokens(tokens); // web: writes CSS vars + data-accent-theme / data-surface
```

Key CSS variables (do not rename):

- `--accent-primary` `--accent-primary-soft` `--accent-primary-border` `--accent-swatch` `--accent-green`
- `--text-primary` `--text-secondary` `--text-muted` `--text-faint` `--text-on-accent`
- `--spectra-dark-bg` `--theme-bloom-a|b|c`
- `--wash-{soft|mid|deep|glow|chrome}-{ink|mid|glow|rim}` and `*-a` alpha forms

Packs: `ref123` `klein` `sky` `amber` `cinnabar` `chrome` `white` (light surface).

Helpers: `pickOnAccent` `contrastRatio` `relativeLuminance` `parseHex`.
