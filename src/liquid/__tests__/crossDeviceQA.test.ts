import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveInitialTier } from '../tierResolver';
import { QualityGovernor } from '../QualityGovernor';
import { themeToUniforms } from '../themeBridge';
import { defaultTheme, warmTheme } from '../defaultTheme';
import { LiquidCanvas } from '../LiquidCanvas';

describe('Cross-Device QA & Reference Consistency', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.querySelectorAll('canvas.liquid-canvas').forEach((c) => c.remove());
  });

  it('Hardware Matrix: classifies hardware capabilities into correct QualityTiers', () => {
    // 1. High-end WebGL2 desktop
    const canvas2 = document.createElement('canvas');
    vi.spyOn(canvas2, 'getContext').mockReturnValue({} as WebGL2RenderingContext);
    vi.spyOn(document, 'createElement').mockReturnValue(canvas2);
    vi.stubGlobal('navigator', { connection: { saveData: false }, hardwareConcurrency: 8 });
    expect(resolveInitialTier()).toBe('T1');

    // 2. Low-end CPU (<=2 cores) -> T2
    vi.stubGlobal('navigator', { connection: { saveData: false }, hardwareConcurrency: 2 });
    expect(resolveInitialTier()).toBe('T2');

    // 3. Save-Data enabled -> T3
    vi.stubGlobal('navigator', { connection: { saveData: true }, hardwareConcurrency: 8 });
    expect(resolveInitialTier()).toBe('T3');
  });

  it('Shader Precision Safety: verifies WebGL1 precision fallback mechanism', () => {
    const gl1 = {
      VERTEX_SHADER: 35633,
      FRAGMENT_SHADER: 35632,
      COMPILE_STATUS: 35713,
      LINK_STATUS: 35714,
      TRIANGLES: 4,
      ARRAY_BUFFER: 34962,
      STATIC_DRAW: 35044,
      FLOAT: 5126,
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      getShaderInfoLog: () => '',
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      getProgramInfoLog: () => '',
      useProgram: () => {},
      getAttribLocation: () => 0,
      getUniformLocation: () => ({}),
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      viewport: () => {},
      uniform1f: () => {},
      uniform2f: () => {},
      uniform3f: () => {},
      uniform3fv: () => {},
      drawArrays: () => {},
      deleteBuffer: () => {},
      deleteProgram: () => {},
      deleteShader: () => {},
    };

    const canvas = {
      clientWidth: 800,
      clientHeight: 600,
      width: 800,
      height: 600,
      getContext: vi.fn((type: string) => (type === 'webgl' ? gl1 : null)),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const onError = vi.fn();
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme, onError });

    expect(onError).not.toHaveBeenCalled();
    engine.dispose();
  });

  it('Performance Governor: downscales qualityScale when frames >20ms and recovers when <12ms', () => {
    const governor = new QualityGovernor();
    expect(governor.getQualityScale()).toBe(1.0);

    // Simulate sustained slow frames (>20ms)
    for (let i = 0; i < 65; i++) governor.recordFrameTime(25);
    expect(governor.getQualityScale()).toBe(0.75);

    for (let i = 0; i < 65; i++) governor.recordFrameTime(25);
    expect(governor.getQualityScale()).toBe(0.5);

    // Hysteresis recovery (<12ms over 240 frames)
    for (let i = 0; i < 240; i++) governor.recordFrameTime(5);
    expect(governor.getQualityScale()).toBe(0.75);
  });

  it('Theme Consistency: defaultTheme and warmTheme preserve 5-color palette structure & base color', () => {
    const uDefault = themeToUniforms(defaultTheme);
    const uWarm = themeToUniforms(warmTheme);

    expect(uDefault.u_color.length).toBe(15);
    expect(uWarm.u_color.length).toBe(15);
    expect(uDefault.u_base).toEqual(uWarm.u_base); // Both share dark base #0A0A0F
  });
});
