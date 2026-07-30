import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LiquidBackground } from '../LiquidBackground';

afterEach(() => {
  cleanup();
  // remove any portaled canvas left in body
  document.body.querySelectorAll('canvas.liquid-canvas').forEach((c) => c.remove());
});

describe('<LiquidBackground/>', () => {
  it('renders a liquid-canvas as a direct child of document.body', () => {
    render(<LiquidBackground />);
    const canvas = document.body.querySelector('canvas.liquid-canvas');
    expect(canvas).not.toBeNull();
    expect(canvas!.parentElement).toBe(document.body);
  });

  it('canvas has z-index 10 and pointer-events none (stacking contract)', () => {
    render(<LiquidBackground />);
    const canvas = document.body.querySelector('canvas.liquid-canvas') as HTMLCanvasElement;
    expect(canvas.style.zIndex).toBe('10');
    expect(canvas.style.pointerEvents).toBe('none');
    expect(canvas.style.position).toBe('fixed');
  });

  it('unmount removes the canvas and disposes the engine (no leak)', () => {
    const { unmount } = render(<LiquidBackground />);
    expect(document.body.querySelector('canvas.liquid-canvas')).not.toBeNull();
    unmount();
    expect(document.body.querySelector('canvas.liquid-canvas')).toBeNull();
  });

  it('accepts a custom className', () => {
    render(<LiquidBackground className="extra" />);
    const canvas = document.body.querySelector('canvas.liquid-canvas.extra');
    expect(canvas).not.toBeNull();
  });
});
