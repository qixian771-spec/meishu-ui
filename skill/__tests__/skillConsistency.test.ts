import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SKILL = join(ROOT, 'skill/meishu-ui');
const GLASS_INDEX = join(ROOT, 'src/glass/index.ts');
const APPLY = join(ROOT, 'src/glass/web/applyThemeTokens.ts');
const FRAMEWORK = join(ROOT, 'docs/FRAMEWORK.md');

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

describe('meishu-ui skill consistency', () => {
  const skillText = walkMd(SKILL)
    .concat([FRAMEWORK])
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  const glassIndex = readFileSync(GLASS_INDEX, 'utf8');
  const applySrc = readFileSync(APPLY, 'utf8');

  it('Glass* names in skill exist in glass index', () => {
    const names = [...skillText.matchAll(/\bGlass[A-Z][A-Za-z]+\b/g)].map((m) => m[0]);
    const unique = [...new Set(names)];
    for (const name of unique) {
      expect(glassIndex, name).toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  it('CSS vars mentioned in skill are written by applyThemeTokens', () => {
    const vars = [...skillText.matchAll(/--(?:accent|text|wash|spectra|theme)-[a-z0-9-]+/g)].map(
      (m) => m[0],
    );
    for (const v of [...new Set(vars)]) {
      // wash roles are written in a loop — check stem
      if (v.startsWith('--wash-')) {
        expect(applySrc).toMatch(/--wash-\$\{role\}/);
        continue;
      }
      if (v.startsWith('--theme-bloom')) {
        expect(applySrc).toMatch(/--theme-bloom/);
        continue;
      }
      expect(applySrc, v).toContain(`'${v}'`);
    }
  });

  it('core functions are documented', () => {
    for (const fn of ['resolveThemeTokens', 'applyThemeTokens']) {
      expect(skillText).toContain(fn);
      expect(glassIndex).toContain(fn);
    }
  });

  it('glass component exports are mentioned at least once in skill/docs', () => {
    const exported = [...glassIndex.matchAll(/export \{ ([^}]+) \}/g)]
      .flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))
      .filter((n) => n && /^Glass(Atmosphere|Shell|Pane|Inset)$/.test(n));
    for (const name of exported) {
      expect(skillText, name).toContain(name);
    }
  });
});
