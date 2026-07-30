import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { PosterLayer } from '../PosterLayer';
import { warmTheme } from '../defaultTheme';

afterEach(() => {
  cleanup();
});

describe('<PosterLayer/>', () => {
  it('renders fixed z-index 0 element with base color background', () => {
    const { getByTestId } = render(<PosterLayer />);
    const poster = getByTestId('poster-layer');
    expect(poster).toBeInTheDocument();
    expect(poster.style.position).toBe('fixed');
    expect(poster.style.zIndex).toBe('0');
    expect(poster.style.pointerEvents).toBe('none');
  });

  it('updates background gradient when theme changes', () => {
    const { getByTestId, rerender } = render(<PosterLayer />);
    const poster = getByTestId('poster-layer');
    const bgBefore = poster.style.backgroundImage;

    rerender(<PosterLayer theme={warmTheme} />);
    const bgAfter = poster.style.backgroundImage;

    expect(bgBefore).not.toEqual(bgAfter);
  });
});
