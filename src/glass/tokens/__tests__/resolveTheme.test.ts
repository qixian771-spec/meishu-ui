// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { ACCENT_THEME_ORDER } from '../accentThemes';
import { contrastRatio, parseHex, pickOnAccent } from '../contrast';
import { resolveThemeTokens } from '../resolveTheme';

describe('resolveThemeTokens (node / no DOM)', () => {
  it('resolves every pack in ACCENT_THEME_ORDER', () => {
    for (const id of ACCENT_THEME_ORDER) {
      const t = resolveThemeTokens(id);
      expect(t.id).toBe(id);
      expect(t.accent.primary).toBeTruthy();
      expect(t.washes.soft.inkRgb).toHaveLength(3);
    }
  });

  it('maps white to light surface text + stage', () => {
    const t = resolveThemeTokens('white');
    expect(t.surface).toBe('light');
    expect(t.text.primary).toBe('#0F172A');
    expect(t.text.secondary).toBe('#1E293B');
    expect(t.text.muted).toBe('#334155');
    expect(t.text.faint).toBe('#475569');
    expect(t.stage.bg).toBe('#8FA0B5');
  });

  it('maps dark packs to light text + black stage', () => {
    const t = resolveThemeTokens('ref123');
    expect(t.surface).toBe('dark');
    expect(t.text.primary).toBe('#FFFFFF');
    expect(t.text.secondary).toBe('#E2E8F0');
    expect(t.text.muted).toBe('#A3B0C2');
    expect(t.text.faint).toBe('#7C8899');
    expect(t.stage.bg).toBe('#000000');
  });

  it('applies wash alpha by surface', () => {
    const light = resolveThemeTokens('white').washes.soft.glowA;
    const dark = resolveThemeTokens('klein').washes.soft.glowA;
    expect(light).toMatch(/,\s*0\.35\)$/);
    expect(dark).toMatch(/,\s*0\.45\)$/);
    expect(resolveThemeTokens('white').washes.soft.midA).toMatch(/,\s*0\.5\)$/);
    expect(resolveThemeTokens('klein').washes.soft.midA).toMatch(/,\s*0\.4\)$/);
    expect(resolveThemeTokens('white').washes.soft.inkA).toMatch(/,\s*0\.75\)$/);
    expect(resolveThemeTokens('klein').washes.soft.inkA).toMatch(/,\s*0\.55\)$/);
  });

  it('keeps onAccent contrast ≥ 4.5:1 against primary', () => {
    for (const id of ACCENT_THEME_ORDER) {
      const t = resolveThemeTokens(id);
      const bg = parseHex(t.accent.primary);
      const fg = parseHex(t.accent.onAccent);
      expect(bg).not.toBeNull();
      expect(fg).not.toBeNull();
      expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('falls back for illegal / undefined / legacy mint', () => {
    expect(resolveThemeTokens(undefined).id).toBe('ref123');
    expect(resolveThemeTokens('nope').id).toBe('ref123');
    expect(resolveThemeTokens('mint').id).toBe('ref123');
  });

  it('snapshot-locks serialised tokens for all packs', () => {
    const snap = Object.fromEntries(
      ACCENT_THEME_ORDER.map((id) => [id, resolveThemeTokens(id)]),
    );
    expect(snap).toMatchSnapshot();
  });

  it('pickOnAccent returns paper for invalid hex', () => {
    expect(pickOnAccent('not-a-color')).toBe('#F8FAFC');
  });
});
