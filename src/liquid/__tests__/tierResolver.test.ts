import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveInitialTier } from '../tierResolver';

describe('tierResolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns T1 when WebGL is available and device is healthy', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as WebGLRenderingContext);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    expect(resolveInitialTier()).toBe('T1');
  });

  it('returns T3 when WebGL context creation fails', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    expect(resolveInitialTier()).toBe('T3');
  });

  it('returns T3 when saveData is enabled', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as WebGLRenderingContext);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    vi.stubGlobal('navigator', {
      connection: { saveData: true },
      hardwareConcurrency: 8,
    });

    expect(resolveInitialTier()).toBe('T3');
  });

  it('returns T2 when hardwareConcurrency <= 2', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as WebGLRenderingContext);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);

    vi.stubGlobal('navigator', {
      connection: { saveData: false },
      hardwareConcurrency: 2,
    });

    expect(resolveInitialTier()).toBe('T2');
  });
});
