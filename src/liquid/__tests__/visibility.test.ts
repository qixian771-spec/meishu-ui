import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiquidCanvas } from '../LiquidCanvas';
import { defaultTheme } from '../defaultTheme';

function makeMockGL() {
  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    TRIANGLES: 4,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => ''),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    useProgram: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    viewport: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform3fv: vi.fn(),
    drawArrays: vi.fn(),
    deleteBuffer: vi.fn(),
  };
  return gl;
}

function makeCanvas(gl: Record<string, unknown>) {
  return {
    width: 0,
    height: 0,
    clientWidth: 800,
    clientHeight: 600,
    getContext: vi.fn(() => gl),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLCanvasElement;
}

describe('LiquidCanvas visibility gating & time offset recovery', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('performance', { now: vi.fn(() => 1000) });
  });

  it('pauseAnimation cancels rAF and records pause time', () => {
    const gl = makeMockGL();
    const canvas = makeCanvas(gl);
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme });
    engine.start();

    // simulate 5 seconds passing, then pause
    (performance.now as ReturnType<typeof vi.fn>).mockReturnValue(6000);
    engine.pauseAnimation();

    expect(cancelAnimationFrame).toHaveBeenCalled();

    // simulate 10 seconds hidden, then resume
    (performance.now as ReturnType<typeof vi.fn>).mockReturnValue(16000);
    engine.resumeAnimation();

    // total pause duration should be 16000 - 6000 = 10000ms
    expect(engine.getAccumulatedPauseTime()).toBe(10000);
    engine.dispose();
  });
});
