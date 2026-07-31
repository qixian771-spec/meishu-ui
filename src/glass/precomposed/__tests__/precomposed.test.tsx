import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { resolveThemeTokens } from '../../tokens';
import { PrecomposedAtmosphere } from '../PrecomposedAtmosphere';
import { PrecomposedShell } from '../PrecomposedShell';
import { PrecomposedPane, PrecomposedInset } from '../PrecomposedPane';

describe('Precomposed primitives', () => {
  const tokens = resolveThemeTokens('ref123');

  it('nests pane → inset with depth and tint-only at 3', () => {
    render(
      <div className="pc-root">
        <PrecomposedAtmosphere tokens={tokens} />
        <PrecomposedShell tokens={tokens} side={<span>nav</span>}>
          <PrecomposedPane tokens={tokens} wash="glow">
            <PrecomposedInset tokens={tokens} wash="mid">
              <PrecomposedInset tokens={tokens} wash="soft">
                deep
              </PrecomposedInset>
            </PrecomposedInset>
          </PrecomposedPane>
        </PrecomposedShell>
      </div>,
    );

    expect(screen.getByTestId('pc-atmosphere')).toBeTruthy();
    expect(screen.getByTestId('pc-shell')).toBeTruthy();
    const panes = screen.getAllByTestId('pc-pane');
    const insets = screen.getAllByTestId('pc-inset');
    expect(panes.length).toBeGreaterThanOrEqual(1);
    expect(insets.length).toBe(2);
    const deepest = insets[insets.length - 1];
    expect(deepest.getAttribute('data-pc-depth')).toBe('3');
    expect(deepest.getAttribute('data-pc-tint-only')).toBe('true');
  });

  it('does not use backdrop-filter in precomposed css class tree', () => {
    const { container } = render(
      <PrecomposedPane tokens={tokens}>
        hi
      </PrecomposedPane>,
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(/backdrop-filter/i);
  });
});
