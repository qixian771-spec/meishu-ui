import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CSS_DIR = join(process.cwd(), 'src/glass/css');

/** Allow low-saturation neutrals; block saturated brand literals in framework CSS. */
const ALLOW_HEX = new Set([
  '0a0a0f',
  'f8fafc',
  'ffffff',
  '000000',
  '0f172a',
  '1e293b',
  '475569',
  '64748b',
  'e2e8f0',
  'f1f5f9',
  '94a3b8', // muted slate used in blooms
  '4ade80', // semantic success green in status dots historically — prefer token but allow
  'f87171',
]);

function hexSaturation(hex: string): number {
  const n = parseInt(hex, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

describe('no hardcoded brand hues in framework CSS', () => {
  it('rejects saturated hex literals outside the allowlist', () => {
    const files = readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(join(CSS_DIR, file), 'utf8');
      const re = /#([0-9a-fA-F]{6})\b/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const hex = m[1].toLowerCase();
        if (ALLOW_HEX.has(hex)) continue;
        if (hexSaturation(hex) <= 0.25) continue;
        const line = text.slice(0, m.index).split('\n').length;
        offenders.push(`${file}:${line} #${hex}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
