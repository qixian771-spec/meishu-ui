import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GlassShell } from '../GlassShell';
import { GlassPane } from '../GlassPane';
import { GlassInset } from '../GlassInset';

describe('glass nesting budget', () => {
  it('marks deepest inset tint-only under Shell > Pane > Inset > Inset', () => {
    const { container } = render(
      <GlassShell side={<span>s</span>}>
        <GlassPane>
          <GlassInset>
            <GlassInset>deep</GlassInset>
          </GlassInset>
        </GlassPane>
      </GlassShell>,
    );
    const insets = container.querySelectorAll('.glass-inset');
    expect(insets.length).toBe(2);
    expect(insets[0].className).not.toContain('is-tint-only');
    expect(insets[1].className).toContain('is-tint-only');
  });

  it('honours manual tintOnly', () => {
    const { container } = render(<GlassPane tintOnly>x</GlassPane>);
    expect(container.querySelector('.glass-pane')?.className).toContain('is-tint-only');
  });

  it('depth-1 pane gets max blur var', () => {
    const { container } = render(<GlassPane>solo</GlassPane>);
    const style = container.querySelector('.glass-pane')?.getAttribute('style') ?? '';
    expect(style).toContain('--glass-blur: 24px');
  });
});
