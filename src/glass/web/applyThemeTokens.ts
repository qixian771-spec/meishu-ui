import type { ThemeTokens } from '../tokens/types';

const WASH_ROLES = ['soft', 'mid', 'deep', 'glow', 'chrome'] as const;

/**
 * Inject resolved theme tokens into CSS custom properties on a DOM root.
 * Variable names must stay byte-compatible with existing glass CSS.
 */
export function applyThemeTokens(
  tokens: ThemeTokens,
  root: HTMLElement = document.documentElement,
): void {
  root.dataset.accentTheme = tokens.id;
  root.dataset.surface = tokens.surface;

  root.style.setProperty('--accent-primary', tokens.accent.primary);
  root.style.setProperty('--accent-primary-soft', tokens.accent.primarySoft);
  root.style.setProperty('--accent-primary-border', tokens.accent.primaryBorder);
  root.style.setProperty('--accent-swatch', tokens.accent.swatch);
  root.style.setProperty('--accent-green', tokens.accent.primary);
  root.style.setProperty('--theme-bloom-a', tokens.stage.bloomA);
  root.style.setProperty('--theme-bloom-b', tokens.stage.bloomB);
  root.style.setProperty('--theme-bloom-c', tokens.stage.bloomC);
  root.style.setProperty('--spectra-dark-bg', tokens.stage.bg);
  root.style.setProperty('--text-primary', tokens.text.primary);
  root.style.setProperty('--text-secondary', tokens.text.secondary);
  root.style.setProperty('--text-muted', tokens.text.muted);
  root.style.setProperty('--text-faint', tokens.text.faint);
  root.style.setProperty('--text-on-accent', tokens.accent.onAccent);

  for (const role of WASH_ROLES) {
    const w = tokens.washes[role];
    root.style.setProperty(`--wash-${role}-ink`, w.ink);
    root.style.setProperty(`--wash-${role}-mid`, w.mid);
    root.style.setProperty(`--wash-${role}-glow`, w.glow);
    root.style.setProperty(`--wash-${role}-rim`, w.rim);
    root.style.setProperty(`--wash-${role}-glow-a`, w.glowA);
    root.style.setProperty(`--wash-${role}-mid-a`, w.midA);
    root.style.setProperty(`--wash-${role}-ink-a`, w.inkA);
  }
}
