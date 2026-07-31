/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { resolveThemeTokens } from '../../tokens';
import { buildAtmosphereSpec, buildPaneSpec } from '../buildLayers';

describe('buildPrecomposedLayers', () => {
  const tokens = resolveThemeTokens('ref123');

  it('atmosphere uses stage tokens only', () => {
    const a = buildAtmosphereSpec(tokens);
    expect(a.stageBg).toBe(tokens.stage.bg);
    expect(a.bloomA).toBe(tokens.stage.bloomA);
    expect(a.bloomB).toBe(tokens.stage.bloomB);
  });

  it('depth 1 gets blur, depth 3 is tint-only', () => {
    const d1 = buildPaneSpec(tokens, 1, 'glow');
    const d3 = buildPaneSpec(tokens, 3, 'mid');
    expect(d1.blurPx).toBe(24);
    expect(d1.tintOnly).toBe(false);
    expect(d3.blurPx).toBe(0);
    expect(d3.tintOnly).toBe(true);
    expect(d3.fill.startsWith('rgba(')).toBe(true);
  });

  it('wash fill is premultiplied rgba from token midRgb', () => {
    const spec = buildPaneSpec(tokens, 1, 'mid');
    const [r, g, b] = tokens.washes.mid.midRgb;
    expect(spec.fill).toContain(`${r}, ${g}, ${b}`);
  });
});
