import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const GLASS_ROOT = join(process.cwd(), 'src/glass');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

describe('glass package boundary', () => {
  it('does not import demo or dashboard from glass sources', () => {
    const files = walk(GLASS_ROOT).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('__tests__'));
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (/from\s+['"][^'"]*(?:src\/)?demo\//.test(text) || /from\s+['"][^'"]*components\/dashboard/.test(text)) {
        offenders.push(relative(process.cwd(), file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps tokens free of DOM / React', () => {
    const files = walk(join(GLASS_ROOT, 'tokens')).filter(
      (f) => /\.(ts|tsx)$/.test(f) && !f.includes('__tests__'),
    );
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, relative(process.cwd(), file)).not.toMatch(/\bdocument\b/);
      expect(text, relative(process.cwd(), file)).not.toMatch(/\bwindow\b/);
      expect(text, relative(process.cwd(), file)).not.toMatch(/from ['"]react['"]/);
    }
  });
});
