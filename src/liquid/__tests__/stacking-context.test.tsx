import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LiquidBackground } from '../LiquidBackground';
import { checkStackingContext } from '../stackingGuard';

afterEach(() => {
  cleanup();
  document.body.querySelectorAll('canvas.liquid-canvas').forEach((c) => c.remove());
  vi.restoreAllMocks();
});

describe('stacking-context guard', () => {
  it('is silent on a clean mount (canvas is a direct child of body)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<LiquidBackground />);
    const canvas = document.body.querySelector('canvas.liquid-canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    // canvas is a direct child of body → no intermediate ancestor → no warnings
    const warnings = checkStackingContext(canvas, false);
    expect(warnings).toHaveLength(0);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when an intermediate ancestor creates a stacking context (transform)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // build: body > div(transform) > canvas
    const wrapper = document.createElement('div');
    wrapper.style.transform = 'translateX(10px)';
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper);

    // jsdom may not compute transform; stub getComputedStyle to flag it on the wrapper
    const real = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
      const base = real(el);
      if (el === wrapper) {
        return {
          getPropertyValue: (p: string) => (p === 'transform' ? 'translateX(10px)' : base.getPropertyValue(p)),
        } as CSSStyleDeclaration;
      }
      return base;
    });

    const warnings = checkStackingContext(canvas, true);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.join(' ')).toContain('transform');
    expect(warnSpy).toHaveBeenCalled();
  });
});
