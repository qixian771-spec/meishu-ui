import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveInitialTier } from '../tierResolver';

describe('prefers-reduced-motion integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolveInitialTier returns T2 when prefers-reduced-motion: reduce is active', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as WebGLRenderingContext);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    expect(resolveInitialTier()).toBe('T2');
  });
});
