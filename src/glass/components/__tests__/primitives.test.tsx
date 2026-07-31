import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassAtmosphere } from '../GlassAtmosphere';
import { GlassShell } from '../GlassShell';
import { GlassPane } from '../GlassPane';
import { GlassInset } from '../GlassInset';

describe('glass primitives', () => {
  it('GlassAtmosphere renders default blobs', () => {
    const { container } = render(<GlassAtmosphere />);
    expect(container.querySelectorAll('.liquid-stage-wash span')).toHaveLength(4);
  });

  it('GlassAtmosphere static class', () => {
    const { container } = render(<GlassAtmosphere static />);
    expect(container.firstElementChild?.className).toContain('is-static');
  });

  it('GlassShell defaults to glass sidebar', () => {
    const { container } = render(
      <GlassShell side={<span>nav</span>}>
        <span>main</span>
      </GlassShell>,
    );
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('glass-sidebar');
    expect(aside?.className).not.toContain('glass-sidebar--solid');
    expect(screen.getByText('main')).toBeTruthy();
  });

  it('GlassShell solid variant', () => {
    const { container } = render(
      <GlassShell variant="solid" side={<span>nav</span>}>
        body
      </GlassShell>,
    );
    expect(container.querySelector('aside')?.className).toContain('glass-sidebar--solid');
  });

  it('GlassPane maps variant and wash', () => {
    const { container } = render(
      <GlassPane variant="hero" wash="glow">
        pane
      </GlassPane>,
    );
    const el = container.querySelector('.glass-pane');
    expect(el?.className).toContain('glass-container--hero');
    expect(el?.className).toContain('glass-container--wash-glow');
    expect(el?.getAttribute('style') ?? '').not.toMatch(/filter:/);
  });

  it('GlassPane quiet variant', () => {
    const { container } = render(<GlassPane variant="quiet">q</GlassPane>);
    expect(container.querySelector('.glass-pane')?.className).toContain('glass-container--quiet');
  });

  it('GlassInset row form', () => {
    const { container } = render(
      <GlassInset as="row" wash="soft">
        row
      </GlassInset>,
    );
    expect(container.querySelector('.glass-inset')?.className).toContain('glass-inset--row');
  });
});
