import {
  resolveAccentTheme,
  type AccentThemeId,
  type WashRole,
} from './accentThemes';
import { pickOnAccent } from './contrast';
import type { ThemeTokens, WashTokens } from './types';

const WASH_ROLES: WashRole[] = ['soft', 'mid', 'deep', 'glow', 'chrome'];

const TEXT_LIGHT = {
  primary: '#0F172A',
  secondary: '#1E293B',
  muted: '#334155',
  faint: '#475569',
} as const;

const TEXT_DARK = {
  primary: '#FFFFFF',
  secondary: '#E2E8F0',
  muted: '#A3B0C2',
  faint: '#7C8899',
} as const;

function rgbString(rgb: [number, number, number]): string {
  return `rgb(${rgb.join(',')})`;
}

function rgbaString(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function resolveThemeTokens(id: AccentThemeId | string | undefined): ThemeTokens {
  const theme = resolveAccentTheme(id);
  const light = theme.surface === 'light';
  const glowA = light ? 0.35 : 0.45;
  const midA = light ? 0.5 : 0.4;
  const inkA = light ? 0.75 : 0.55;

  const washes = {} as ThemeTokens['washes'];
  for (const role of WASH_ROLES) {
    const p = theme.washes[role];
    const entry: WashTokens = {
      ink: rgbString(p.ink),
      mid: rgbString(p.mid),
      glow: rgbString(p.glow),
      rim: rgbString(p.rim),
      inkA: rgbaString(p.ink, inkA),
      midA: rgbaString(p.mid, midA),
      glowA: rgbaString(p.glow, glowA),
      inkRgb: [...p.ink],
      midRgb: [...p.mid],
      glowRgb: [...p.glow],
      rimRgb: [...p.rim],
    };
    washes[role] = entry;
  }

  return {
    id: theme.id,
    surface: theme.surface,
    accent: {
      primary: theme.primary,
      primarySoft: theme.primarySoft,
      primaryBorder: theme.primaryBorder,
      swatch: theme.swatch,
      onAccent: pickOnAccent(theme.primary),
    },
    text: light ? { ...TEXT_LIGHT } : { ...TEXT_DARK },
    stage: {
      bg: theme.stageBg ?? (light ? '#F4F5F7' : '#000000'),
      bloomA: theme.bloomA,
      bloomB: theme.bloomB,
      bloomC: theme.bloomC,
    },
    washes,
  };
}
