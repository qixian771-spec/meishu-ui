import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccentThemeProvider } from '../../theme/AccentThemeContext';
import App from '../../App';
import { GalleryPage, SampleBanner } from '../pages/GalleryPage';
import { ACCENT_THEME_ORDER } from '../../glass';

function wrap(ui: React.ReactNode) {
  return render(<AccentThemeProvider>{ui}</AccentThemeProvider>);
}

describe('gallery demo', () => {
  it('defaults to gallery, not task dashboard', () => {
    wrap(<App />);
    expect(screen.getByText('可复刻的玻璃美术')).toBeTruthy();
    expect(screen.queryByTestId('sample-banner')).toBeNull();
  });

  it('renders primitive showcase', () => {
    wrap(<GalleryPage />);
    expect(screen.getByTestId('gallery-primitives')).toBeTruthy();
    expect(screen.getByText('GlassAtmosphere')).toBeTruthy();
    expect(screen.getByText('GlassShell')).toBeTruthy();
    expect(screen.getByText('GlassPane')).toBeTruthy();
    expect(screen.getByText('GlassInset')).toBeTruthy();
  });

  it('exposes six theme chips and switches accent', () => {
    wrap(<GalleryPage />);
    for (const id of ACCENT_THEME_ORDER) {
      expect(document.querySelector(`[data-theme-chip="${id}"]`)).toBeTruthy();
    }
    fireEvent.click(document.querySelector('[data-theme-chip="amber"]')!);
    expect(document.documentElement.dataset.accentTheme).toBe('amber');
  });

  it('sample banner copy is present', () => {
    wrap(<SampleBanner />);
    expect(screen.getByTestId('sample-banner').textContent).toMatch(/示例组合/);
  });

  it('sample pages show disclaimer banner', () => {
    wrap(<App />);
    fireEvent.click(screen.getByRole('button', { name: '设置中心' }));
    expect(screen.getByTestId('sample-banner')).toBeTruthy();
  });
});
