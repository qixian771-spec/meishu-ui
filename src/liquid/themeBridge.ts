import type { LiquidTheme, LiquidUniforms } from './types';

/**
 * Pure hex→uniform bridge. Runs on THEME CHANGE ONLY — never per frame.
 * The per-frame hot path contains zero hardcoded color literals.
 */
export function hexToVec3(hex: string): [number, number, number] {
  if (typeof hex !== 'string') {
    throw new Error(`hexToVec3: expected string, got ${typeof hex}`);
  }
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) {
    throw new Error(`hexToVec3: malformed hex "${hex}" (expected #RRGGBB)`);
  }
  const n = parseInt(m[1], 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

function clampFinite(v: number, lo: number, hi: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}

export function themeToUniforms(theme: LiquidTheme): LiquidUniforms {
  if (!theme || !Array.isArray(theme.colors) || theme.colors.length !== 5) {
    throw new Error('themeToUniforms: theme.colors must be an array of 5 hex strings');
  }
  const colors = theme.colors.map(hexToVec3);
  const u_color = new Float32Array(colors.flat());
  const u_base = hexToVec3(theme.base);
  const u_intensity = clampFinite(theme.intensity, 0, 1, 0.9);
  const u_speed = clampFinite(theme.speed, 0, Infinity, 0.05);
  const u_warp = theme.warp > 0 && Number.isFinite(theme.warp) ? theme.warp : 2.0;
  return { u_color, u_base, u_intensity, u_speed, u_warp };
}
