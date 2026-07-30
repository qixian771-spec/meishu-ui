import { describe, it, expect, vi } from 'vitest';
import { LiquidCanvas } from '../LiquidCanvas';
import { defaultTheme } from '../defaultTheme';

describe('Shader Precision Fallback (highp -> mediump)', () => {
  it('retries compilation with mediump declaration on WebGL1 when highp link fails', () => {
    const shaderSources: string[] = [];
    let linkCallCount = 0;

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
      shaderSource: (_sh: unknown, src: string) => {
        shaderSources.push(src);
      },
      compileShader: () => {},
      getShaderParameter: () => true,
      getShaderInfoLog: () => '',
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {
        linkCallCount++;
      },
      // First link attempt (highp) fails, second link attempt (mediump) succeeds
      getProgramParameter: () => {
        return linkCallCount > 1;
      },
      getProgramInfoLog: () => 'highp precision not supported',
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
      // Force WebGL1 path
      getContext: vi.fn((type: string) => (type === 'webgl' ? gl1 : null)),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const onError = vi.fn();
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme, onError });

    // Verify mediump replacement source was created and linked
    const mediumpShader = shaderSources.find((s) => s.includes('precision mediump float;'));
    expect(mediumpShader).toBeDefined();
    expect(onError).not.toHaveBeenCalled();

    engine.dispose();
  });
});
