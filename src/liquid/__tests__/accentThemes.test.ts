import { describe, it, expect } from 'vitest';
import {
  ACCENT_THEME_LIST,
  ACCENT_THEMES,
  resolveAccentTheme,
  washForTheme,
} from '../accentThemes';

describe('accentThemes', () => {
  it('ships seven cohesive accent packs', () => {
    expect(ACCENT_THEME_LIST.map((t) => t.id)).toEqual([
      'ref123',
      'klein',
      'sky',
      'amber',
      'cinnabar',
      'chrome',
      'white',
    ]);
  });

  it('keeps every wash role inside the same theme object', () => {
    for (const theme of ACCENT_THEME_LIST) {
      expect(Object.keys(theme.washes)).toEqual(
        expect.arrayContaining(['soft', 'mid', 'deep', 'glow', 'chrome']),
      );
    }
  });

  it('maps ref123 to cyber green from references', () => {
    const ref = resolveAccentTheme('ref123');
    expect(ref.swatch).toMatch(/#4ADE80/i);
    expect(ref.surface).toBe('dark');
    const glow = washForTheme('ref123', 'glow').glow;
    expect(glow[1]).toBeGreaterThan(glow[0]);
  });

  it('exposes a light white studio pack', () => {
    const white = resolveAccentTheme('white');
    expect(white.surface).toBe('light');
    expect(white.stageBg).toBeTruthy();
  });

  it('exposes a dark china-red cinnabar pack', () => {
    const red = resolveAccentTheme('cinnabar');
    expect(red.surface).toBe('dark');
    expect(red.label).toBe('中国红');
    expect(red.swatch).toMatch(/#DE2910/i);
    const mid = washForTheme('cinnabar', 'mid').mid;
    expect(mid[0]).toBeGreaterThan(mid[1]);
    expect(mid[0]).toBeGreaterThan(mid[2]);
    /* Gold rim: warm yellow (r≈g, both >> b) */
    const rim = washForTheme('cinnabar', 'glow').rim;
    expect(rim[0]).toBeGreaterThan(240);
    expect(rim[1]).toBeGreaterThan(200);
    expect(rim[2]).toBeLessThan(210);
  });

  it('migrates legacy mint id to ref123', () => {
    expect(resolveAccentTheme('mint').id).toBe('ref123');
  });

  it('defaults unknown ids to ref123', () => {
    expect(resolveAccentTheme('nope').id).toBe('ref123');
    expect(ACCENT_THEMES.ref123.primary).toBeTruthy();
  });
});
