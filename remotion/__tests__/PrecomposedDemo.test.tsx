import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children, style, className }: { children?: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  useCurrentFrame: () => 15,
  useVideoConfig: () => ({ fps: 30, durationInFrames: 150, width: 1280, height: 720 }),
  interpolate: (frame: number, input: number[], output: number[]) => {
    if (frame <= input[0]) return output[0];
    if (frame >= input[1]) return output[1];
    const t = (frame - input[0]) / (input[1] - input[0]);
    return output[0] + (output[1] - output[0]) * t;
  },
}));

import { PrecomposedDemo } from '../PrecomposedDemo';

describe('Remotion PrecomposedDemo', () => {
  it('renders nested precomposed glass from tokens', () => {
    render(<PrecomposedDemo />);
    expect(screen.getByTestId('pc-atmosphere')).toBeTruthy();
    expect(screen.getByTestId('pc-shell')).toBeTruthy();
    expect(screen.getByText(/Glass without backdrop-filter/i)).toBeTruthy();
    expect(screen.getByText(/depth 3 · tint-only/i)).toBeTruthy();
    expect(screen.getByText(/frame 15/)).toBeTruthy();
  });

  it('drives atmosphere bloom transforms from useCurrentFrame', () => {
    const { container } = render(<PrecomposedDemo />);
    const blooms = container.querySelectorAll('.pc-atmosphere-bloom--a, .pc-atmosphere-bloom--b');
    expect(blooms.length).toBe(2);
    for (const el of blooms) {
      const transform = (el as HTMLElement).style.transform;
      expect(transform).toMatch(/translate\(/);
      expect(transform).not.toBe('translate(0%, 0%)');
    }
  });
});
