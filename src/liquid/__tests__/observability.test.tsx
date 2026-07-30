import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LiquidBackground } from '../LiquidBackground';

afterEach(() => {
  cleanup();
  document.body.querySelectorAll('canvas.liquid-canvas').forEach((c) => c.remove());
});

describe('Tier Observability & data-tier DOM Attributes', () => {
  it('exposes data-tier="T1" on PosterLayer and Canvas in T1', () => {
    const { getByTestId } = render(<LiquidBackground tier="T1" />);
    const poster = getByTestId('poster-layer');
    expect(poster).toHaveAttribute('data-tier', 'T1');

    const canvas = document.body.querySelector('canvas.liquid-canvas');
    expect(canvas).toHaveAttribute('data-tier', 'T1');
  });

  it('exposes data-tier="T2" on PosterLayer and Canvas in T2', () => {
    const { getByTestId } = render(<LiquidBackground tier="T2" />);
    const poster = getByTestId('poster-layer');
    expect(poster).toHaveAttribute('data-tier', 'T2');

    const canvas = document.body.querySelector('canvas.liquid-canvas');
    expect(canvas).toHaveAttribute('data-tier', 'T2');
  });

  it('exposes data-tier="T3" on PosterLayer and unmounts canvas in T3', () => {
    const { getByTestId } = render(<LiquidBackground tier="T3" />);
    const poster = getByTestId('poster-layer');
    expect(poster).toHaveAttribute('data-tier', 'T3');

    const canvas = document.body.querySelector('canvas.liquid-canvas');
    expect(canvas).toBeNull();
  });
});
