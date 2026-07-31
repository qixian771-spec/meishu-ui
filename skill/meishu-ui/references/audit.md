# Audit

After colour or opacity changes:

1. Ancestor filter probe — must return `[]`:

```js
[...document.querySelectorAll('*')].filter(el => {
  const cs = getComputedStyle(el);
  if (!cs.backdropFilter || cs.backdropFilter === 'none') return false;
  let p = el.parentElement;
  while (p) {
    if (getComputedStyle(p).filter !== 'none') return true;
    p = p.parentElement;
  }
  return false;
}).map(el => el.className);
```

2. Theme switch: force finish transitions or reload after writing `lingxi-accent-theme`.

3. Contrast: normal text ≥ 4.5:1; do not sample canvas pixels for background.

4. Run `npm test` (includes hue / boundary / skill consistency).
