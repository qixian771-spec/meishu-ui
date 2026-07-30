export const CONTEXT_CREATING_PROPS = [
  'transform', 'opacity', 'will-change', 'filter', 'backdrop-filter',
  'mask', 'clip-path', 'perspective', 'contain', 'isolation', 'mix-blend-mode',
] as const;

/**
 * Walk ancestors between `canvas` and document.body (exclusive of body).
 * Returns warnings for any ancestor whose computed style creates a stacking context
 * that would silently break backdrop-filter sampling on future glass panels.
 * In dev, also console.warns each finding.
 */
export function checkStackingContext(canvas: HTMLElement, warn = true): string[] {
  const warnings: string[] = [];
  let node: Node | null = canvas.parentNode;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const cs = getComputedStyle(node);
      for (const prop of CONTEXT_CREATING_PROPS) {
        const val = cs.getPropertyValue(prop);
        if (val && val !== 'none' && val !== 'normal' && val !== 'auto') {
          const msg = `[liquid] stacking-context guard: <${node.tagName.toLowerCase()}> has "${prop}: ${val}" — backdrop-filter sampling may break.`;
          warnings.push(msg);
          if (warn) console.warn(msg);
        }
      }
    }
    node = node.parentNode;
  }
  return warnings;
}
