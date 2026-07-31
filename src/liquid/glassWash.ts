/**
 * ClauseOS-style colored glass washes — translucent color living INSIDE the card.
 * Palette comes from the active accent theme (one hue family).
 */

import {
  washForTheme,
  type AccentThemeId,
  type WashPalette,
  type WashRole,
} from '../glass/tokens/accentThemes';

export type GlassWashId = WashRole;
export type { WashRole, WashPalette };

/** @deprecated Prefer theme + role. Kept for tests / fallback chrome. */
export const GLASS_WASHES: Record<WashRole, WashPalette> = {
  soft: washForTheme('ref123', 'soft'),
  mid: washForTheme('ref123', 'mid'),
  deep: washForTheme('ref123', 'deep'),
  glow: washForTheme('ref123', 'glow'),
  chrome: washForTheme('ref123', 'chrome'),
};

function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

/**
 * Soft ClauseOS glass interior: colored depth + right-side glow bloom + left readable zone.
 */
export function paintGlassWash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  washId: WashRole = 'chrome',
  opts: {
    intensity?: number;
    focusX?: number;
    focusY?: number;
    themeId?: AccentThemeId;
    palette?: WashPalette;
    surface?: 'dark' | 'light';
  } = {},
) {
  const p = opts.palette ?? washForTheme(opts.themeId ?? 'ref123', washId);
  const intensity = opts.intensity ?? 0.85;
  const light = opts.surface === 'light';
  const breath = 0.5 + 0.5 * Math.sin(time * 0.35);
  const fx = opts.focusX ?? width * 0.72;
  const fy = opts.focusY ?? height * 0.45;

  ctx.fillStyle = rgba(p.ink, light ? 0.55 : 0.92);
  ctx.fillRect(0, 0, width, height);

  const body = ctx.createLinearGradient(0, 0, width, height);
  body.addColorStop(0, rgba(p.ink, 0.55));
  body.addColorStop(0.45, rgba(p.mid, 0.42 * intensity));
  body.addColorStop(1, rgba(p.glow, 0.28 * intensity));
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, width, height);

  const bloom = ctx.createRadialGradient(
    fx,
    fy,
    0,
    fx,
    fy,
    Math.max(width, height) * 0.7,
  );
  bloom.addColorStop(0, rgba(p.glow, (0.38 + breath * 0.1) * intensity));
  bloom.addColorStop(0.45, rgba(p.mid, 0.22 * intensity));
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, width, height);

  const sheen = ctx.createLinearGradient(width * 0.55, 0, width, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, rgba(p.rim, 0.12 * intensity));
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  const frost = ctx.createLinearGradient(0, 0, width * 0.55, 0);
  frost.addColorStop(0, rgba(p.ink, 0.75));
  frost.addColorStop(0.55, rgba(p.ink, 0.35));
  frost.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = frost;
  ctx.fillRect(0, 0, width, height);

  const shade = ctx.createLinearGradient(0, height * 0.5, 0, height);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, light ? 'rgba(15, 23, 42, 0.05)' : 'rgba(0,0,0,0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
}
