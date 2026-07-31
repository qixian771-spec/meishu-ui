import type { AccentThemeId, WashRole } from './accentThemes';

export type RgbTuple = [number, number, number];

export type WashTokens = {
  ink: string;
  mid: string;
  glow: string;
  rim: string;
  inkA: string;
  midA: string;
  glowA: string;
  inkRgb: RgbTuple;
  midRgb: RgbTuple;
  glowRgb: RgbTuple;
  rimRgb: RgbTuple;
};

export type ThemeTokens = {
  id: AccentThemeId;
  surface: 'dark' | 'light';
  accent: {
    primary: string;
    primarySoft: string;
    primaryBorder: string;
    swatch: string;
    onAccent: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    faint: string;
  };
  stage: {
    bg: string;
    bloomA: string;
    bloomB: string;
    bloomC: string;
  };
  washes: Record<WashRole, WashTokens>;
};
