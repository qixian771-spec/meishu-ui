import { describe, it, expect } from 'vitest';
import { ACCENT_THEME_ORDER, washForTheme, type WashRole } from '../index';

function rgbToHue([r, g, b]: [number, number, number]): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  switch (max) {
    case rn:
      h = ((gn - bn) / d) % 6;
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
  }
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

function hueDelta(a: number, b: number): number {
  return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
}

const CORE: WashRole[] = ['soft', 'mid', 'deep'];

describe('wash roles stay same-hue family', () => {
  it('keeps soft/mid/deep mid-tones within 40° on dark packs', () => {
    for (const id of ACCENT_THEME_ORDER) {
      // Light studio pack uses near-neutral washes; hue is unstable at low chroma.
      if (id === 'white') continue;
      const hues = CORE.map((role) => rgbToHue(washForTheme(id, role).mid));
      for (let i = 0; i < hues.length; i++) {
        for (let j = i + 1; j < hues.length; j++) {
          expect(
            hueDelta(hues[i], hues[j]),
            `${id} ${CORE[i]} vs ${CORE[j]}`,
          ).toBeLessThanOrEqual(40);
        }
      }
    }
  });
});
