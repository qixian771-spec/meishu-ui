import type { RgbTuple } from './types';

export function parseHex(hex: string): RgbTuple | null {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RgbTuple): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(a: RgbTuple, b: RgbTuple): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Label colour on a solid accent fill: whichever of ink / paper wins on contrast.
 * Hardcoding per-theme guesses left pale packs (klein, amber) at ~2.4:1.
 */
export function pickOnAccent(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#F8FAFC';
  const lum = relativeLuminance(rgb);
  const onInk = (lum + 0.05) / 0.05;
  const onPaper = 1.05 / (lum + 0.05);
  return onInk >= onPaper ? '#0A0A0F' : '#F8FAFC';
}
