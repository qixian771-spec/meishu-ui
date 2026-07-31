import { describe, it, expect, vi } from 'vitest';
import { paintGlassWash, GLASS_WASHES } from '../glassWash';

function mockCtx() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  } as unknown as CanvasRenderingContext2D;
}

describe('glassWash palettes', () => {
  it('exposes tonal wash roles', () => {
    expect(Object.keys(GLASS_WASHES)).toEqual(
      expect.arrayContaining(['soft', 'mid', 'deep', 'glow', 'chrome']),
    );
  });

  it('paints each wash without throwing', () => {
    const ctx = mockCtx();
    for (const id of Object.keys(GLASS_WASHES) as Array<keyof typeof GLASS_WASHES>) {
      expect(() => paintGlassWash(ctx, 320, 140, 1.2, id, { themeId: 'ref123' })).not.toThrow();
    }
    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
