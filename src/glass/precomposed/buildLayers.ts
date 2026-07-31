import { resolveBlurForDepth } from '../blurBudget';
import type { ThemeTokens, WashRole } from '../tokens';

export type PrecomposedAtmosphereSpec = {
  stageBg: string;
  bloomA: string;
  bloomB: string;
  bloomC: string;
  textPrimary: string;
};

export type PrecomposedPaneSpec = {
  depth: number;
  blurPx: number;
  tintOnly: boolean;
  /** Premultiplied translucent fill (no multiply blend). */
  fill: string;
  rimBorder: string;
  rimHighlight: string;
  sheen: string;
  textPrimary: string;
  textSecondary: string;
  /** Backdrop colour to blur/clip — usually stage or parent fill. */
  backdrop: string;
};

function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

export function buildAtmosphereSpec(tokens: ThemeTokens): PrecomposedAtmosphereSpec {
  return {
    stageBg: tokens.stage.bg,
    bloomA: tokens.stage.bloomA,
    bloomB: tokens.stage.bloomB,
    bloomC: tokens.stage.bloomC,
    textPrimary: tokens.text.primary,
  };
}

export function buildPaneSpec(
  tokens: ThemeTokens,
  depth: number,
  wash: WashRole | 'none' = 'none',
  backdropOverride?: string,
): PrecomposedPaneSpec {
  const { blur, tintOnly } = resolveBlurForDepth(depth);
  const light = tokens.surface === 'light';
  const baseFill = light ? 'rgba(255, 255, 255, 0.42)' : 'rgba(18, 22, 32, 0.45)';
  let fill = baseFill;
  if (wash !== 'none') {
    const w = tokens.washes[wash];
    const alpha = tintOnly ? (light ? 0.55 : 0.5) : light ? 0.38 : 0.32;
    fill = rgba(w.midRgb, alpha);
  } else if (tintOnly) {
    fill = light ? 'rgba(255, 255, 255, 0.55)' : 'rgba(22, 26, 36, 0.62)';
  }

  const accentRgb = hexToRgb(tokens.accent.primary) ?? [74, 222, 128];
  const rimBorder = light
    ? rgba(accentRgb, 0.32)
    : rgba([255, 255, 255], 0.14);
  const rimHighlight = light
    ? 'rgba(255, 255, 255, 0.92)'
    : rgba(tokens.washes.glow.rimRgb, 0.45);

  return {
    depth,
    blurPx: blur,
    tintOnly,
    fill,
    rimBorder,
    rimHighlight,
    sheen: light
      ? 'linear-gradient(125deg, rgba(255,255,255,0.85) 0%, transparent 28%, transparent 60%, rgba(255,255,255,0.08) 100%)'
      : `linear-gradient(125deg, ${rgba(tokens.washes.glow.rimRgb, 0.22)} 0%, transparent 24%, transparent 70%, ${rgba(accentRgb, 0.1)} 100%)`,
    textPrimary: tokens.text.primary,
    textSecondary: tokens.text.secondary,
    backdrop: backdropOverride ?? tokens.stage.bg,
  };
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
