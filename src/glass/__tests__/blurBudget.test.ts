import { describe, it, expect } from 'vitest';
import { resolveBlurForDepth } from '../blurBudget';

describe('blurBudget', () => {
  it('decreases blur for depth 1–2', () => {
    expect(resolveBlurForDepth(1)).toEqual({ blur: 24, tintOnly: false });
    expect(resolveBlurForDepth(2)).toEqual({ blur: 14, tintOnly: false });
  });

  it('tint-only beyond max depth', () => {
    expect(resolveBlurForDepth(3)).toEqual({ blur: 0, tintOnly: true });
    expect(resolveBlurForDepth(4)).toEqual({ blur: 0, tintOnly: true });
    expect(resolveBlurForDepth(10)).toEqual({ blur: 0, tintOnly: true });
  });
});
