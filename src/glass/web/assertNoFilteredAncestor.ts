/**
 * Dev-only: warn when a glass node sits under an ancestor with CSS `filter`.
 * A filtered ancestor re-roots backdrop-filter sampling — glass becomes a grey slab.
 */
export function assertNoFilteredAncestor(el: HTMLElement | null): void {
  if (!import.meta.env.DEV || !el) return;

  let p = el.parentElement;
  while (p) {
    const filter = getComputedStyle(p).filter;
    if (filter && filter !== 'none') {
      const child = el.className || el.tagName;
      const ancestor = p.className || p.tagName;
      console.warn(
        `[glass] <${typeof child === 'string' ? child : el.tagName}> 的祖先 <${typeof ancestor === 'string' ? ancestor : p.tagName}> 带有 filter: ${filter}，这会重置 backdrop-filter 的采样根，玻璃将静默失效。请把阴影改到玻璃元素自身的 box-shadow 上。`,
      );
      return;
    }
    p = p.parentElement;
  }
}
