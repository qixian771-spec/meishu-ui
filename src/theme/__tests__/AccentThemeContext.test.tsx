import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  ACCENT_THEME_STORAGE_KEY,
  DEFAULT_ACCENT_THEME,
} from '../../glass';
import { AccentThemeProvider, useAccentTheme } from '../AccentThemeContext';

function Probe() {
  const { themeId, setThemeId } = useAccentTheme();
  return (
    <div>
      <span data-testid="theme-id">{themeId}</span>
      <button type="button" onClick={() => setThemeId('amber')}>
        set-amber
      </button>
      <button type="button" onClick={() => setThemeId('cinnabar')}>
        set-cinnabar
      </button>
    </div>
  );
}

describe('AccentThemeContext persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults when storage empty', () => {
    render(
      <AccentThemeProvider>
        <Probe />
      </AccentThemeProvider>,
    );
    expect(screen.getByTestId('theme-id').textContent).toBe(DEFAULT_ACCENT_THEME);
  });

  it('writes theme id and rehydrates after remount (reload)', () => {
    const { unmount } = render(
      <AccentThemeProvider>
        <Probe />
      </AccentThemeProvider>,
    );

    act(() => {
      screen.getByText('set-amber').click();
    });
    expect(localStorage.getItem(ACCENT_THEME_STORAGE_KEY)).toBe('amber');
    expect(screen.getByTestId('theme-id').textContent).toBe('amber');

    unmount();

    render(
      <AccentThemeProvider>
        <Probe />
      </AccentThemeProvider>,
    );
    expect(screen.getByTestId('theme-id').textContent).toBe('amber');
  });

  it('migrates legacy mint → ref123', () => {
    localStorage.setItem(ACCENT_THEME_STORAGE_KEY, 'mint');
    render(
      <AccentThemeProvider>
        <Probe />
      </AccentThemeProvider>,
    );
    expect(screen.getByTestId('theme-id').textContent).toBe('ref123');
    expect(localStorage.getItem(ACCENT_THEME_STORAGE_KEY)).toBe('ref123');
  });
});
