import { describe, it, expect, vi } from 'vitest';
import { paintUltrathink, ULTRATHINK_AURORA, MODE_PRESETS } from '../ultrathink';

function mockCtx() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  } as unknown as CanvasRenderingContext2D;
}

describe('ultrathink paint language', () => {
  it('exposes aurora palette and mode presets', () => {
    expect(ULTRATHINK_AURORA.sky[2]).toBe(252); // #7DD3FC
    expect(MODE_PRESETS.idle.speed).toBeLessThan(MODE_PRESETS.thinking.speed);
    expect(MODE_PRESETS.thinking.speed).toBeLessThan(MODE_PRESETS.active.speed);
  });

  it('paints idle / thinking / active without throwing', () => {
    const ctx = mockCtx();
    expect(() => paintUltrathink(ctx, 320, 160, 1.2, { mode: 'idle' })).not.toThrow();
    expect(() => paintUltrathink(ctx, 320, 160, 2.4, { mode: 'thinking' })).not.toThrow();
    expect(() =>
      paintUltrathink(ctx, 320, 160, 3.1, {
        mode: 'active',
        hovered: true,
        focusX: 220,
        focusY: 40,
      }),
    ).not.toThrow();
    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
