import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assertNoFilteredAncestor } from '../assertNoFilteredAncestor';

describe('assertNoFilteredAncestor', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  beforeEach(() => {
    warn.mockClear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('warns when an ancestor has filter', () => {
    const parent = document.createElement('div');
    parent.className = 'glass-stage';
    parent.style.filter = 'drop-shadow(0 1px 1px black)';
    const child = document.createElement('div');
    child.className = 'glass-container';
    parent.appendChild(child);
    document.body.appendChild(parent);

    // jsdom may not compute filter from style; stub getComputedStyle for parent
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === parent) {
        return { filter: 'drop-shadow(0 1px 1px black)' } as CSSStyleDeclaration;
      }
      return real(el);
    });

    assertNoFilteredAncestor(child);
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/filter/);
  });

  it('stays quiet on a clean tree', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);
    assertNoFilteredAncestor(child);
    expect(warn).not.toHaveBeenCalled();
  });
});
