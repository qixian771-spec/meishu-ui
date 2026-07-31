import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GlassInset } from '../GlassInset';
import { GlassPane } from '../GlassPane';

describe('glass pointer interactivity', () => {
  it('marks Inset interactive by default', () => {
    const { container } = render(<GlassInset>hi</GlassInset>);
    expect(container.querySelector('.glass-inset')?.className).toContain('is-interactive');
  });

  it('can disable interactivity', () => {
    const { container } = render(<GlassInset interactive={false}>hi</GlassInset>);
    expect(container.querySelector('.glass-inset')?.className).not.toContain('is-interactive');
  });

  it('marks Pane interactive by default', () => {
    const { container } = render(<GlassPane>hi</GlassPane>);
    expect(container.querySelector('.glass-pane')?.className).toContain('is-interactive');
  });
});
