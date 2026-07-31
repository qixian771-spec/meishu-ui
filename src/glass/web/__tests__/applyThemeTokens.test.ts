import { describe, it, expect, beforeEach } from 'vitest';
import { applyThemeTokens } from '../applyThemeTokens';
import { resolveThemeTokens } from '../../tokens/resolveTheme';

const REQUIRED_VARS = [
  '--accent-primary',
  '--accent-primary-soft',
  '--accent-primary-border',
  '--accent-swatch',
  '--accent-green',
  '--theme-bloom-a',
  '--theme-bloom-b',
  '--theme-bloom-c',
  '--spectra-dark-bg',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-faint',
  '--text-on-accent',
];

const WASH_ROLES = ['soft', 'mid', 'deep', 'glow', 'chrome'] as const;
const WASH_KEYS = ['ink', 'mid', 'glow', 'rim', 'glow-a', 'mid-a', 'ink-a'] as const;

describe('applyThemeTokens', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-accent-theme');
    document.documentElement.removeAttribute('data-surface');
    document.documentElement.style.cssText = '';
  });

  it('writes every required CSS variable', () => {
    applyThemeTokens(resolveThemeTokens('ref123'));
    const style = document.documentElement.style;
    for (const v of REQUIRED_VARS) {
      expect(style.getPropertyValue(v).trim(), v).not.toBe('');
    }
    for (const role of WASH_ROLES) {
      for (const key of WASH_KEYS) {
        const name = `--wash-${role}-${key}`;
        expect(style.getPropertyValue(name).trim(), name).not.toBe('');
      }
    }
  });

  it('flips data-surface with theme', () => {
    applyThemeTokens(resolveThemeTokens('white'));
    expect(document.documentElement.dataset.surface).toBe('light');
    expect(document.documentElement.dataset.accentTheme).toBe('white');

    applyThemeTokens(resolveThemeTokens('amber'));
    expect(document.documentElement.dataset.surface).toBe('dark');
    expect(document.documentElement.dataset.accentTheme).toBe('amber');
  });

  it('keeps --accent-green as primary alias', () => {
    const tokens = resolveThemeTokens('klein');
    applyThemeTokens(tokens);
    expect(document.documentElement.style.getPropertyValue('--accent-green')).toBe(
      tokens.accent.primary,
    );
  });
});
