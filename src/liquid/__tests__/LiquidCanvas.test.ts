import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LiquidCanvas } from '../LiquidCanvas';
import { defaultTheme } from '../defaultTheme';

/** Minimal mock GL recording calls so we can assert engine behavior in jsdom. */
function makeMockGL() {
  const calls: Record<string, number> = {};
  const shaderParam = vi.fn(() => true);
  const programParam = vi.fn(() => true);
  const uniforms: Record<string, unknown> = {};
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
    getShaderParameter: shaderParam,
    getShaderInfoLog: vi.fn(() => ''),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(() => { calls.linkProgram = (calls.linkProgram || 0) + 1; }),
    getProgramParameter: programParam,
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
    uniform1f: vi.fn((loc: unknown, v: number) => { uniforms['1f'] = v; }),
    uniform2f: vi.fn((loc: unknown, a: number, b: number) => { uniforms['2f'] = [a, b]; }),
    uniform3f: vi.fn(),
    uniform3fv: vi.fn((loc: unknown, v: Float32Array) => { uniforms['3fv'] = v; }),
    drawArrays: vi.fn(() => { calls.drawArrays = (calls.drawArrays || 0) + 1; }),
    clearColor: vi.fn(),
    clear: vi.fn(),
    deleteBuffer: vi.fn(),
  };
  return { gl, calls, uniforms, shaderParam, programParam };
}

function makeCanvas(gl: Record<string, unknown>) {
  const canvas = {
    width: 0,
    height: 0,
    clientWidth: 800,
    clientHeight: 600,
    getContext: vi.fn(() => gl),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLCanvasElement;
  return canvas;
}

describe('LiquidCanvas engine', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      // do not actually loop in tests
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('performance', { now: () => 1000 });
    vi.stubGlobal('devicePixelRatio', 1);
  });

  it('start() schedules rAF and drawArrays is invoked', () => {
    const { gl, calls } = makeMockGL();
    const canvas = makeCanvas(gl);
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme });
    engine.start();
    expect(requestAnimationFrame).toHaveBeenCalled();
    // the loop callback draws one frame synchronously? rAF is stubbed not to run cb,
    // so call renderOnce to prove a draw path works.
    engine.renderOnce(1.5);
    expect(calls.drawArrays).toBeGreaterThanOrEqual(1);
    engine.dispose();
  });

  it('renderOnce(time) pushes u_time and draws exactly one frame', () => {
    const { gl, calls, uniforms } = makeMockGL();
    const canvas = makeCanvas(gl);
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme });
    const before = calls.drawArrays || 0;
    engine.renderOnce(1.5);
    expect(uniforms['1f']).toBe(1.5);
    expect(calls.drawArrays).toBe(before + 1);
    engine.dispose();
  });

  it('setTheme() pushes uniforms via uniform3fv WITHOUT recompiling', () => {
    const { gl, calls, uniforms } = makeMockGL();
    const canvas = makeCanvas(gl);
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme });
    // baseline AFTER construction (construction compiles + links once)
    const createShaderBefore = (gl.createShader as ReturnType<typeof vi.fn>).mock.calls.length;
    const linkBefore = calls.linkProgram || 0;
    engine.setTheme({ ...defaultTheme, intensity: 0.5 });
    expect(uniforms['3fv']).toBeInstanceOf(Float32Array);
    expect((uniforms['3fv'] as Float32Array).length).toBe(15);
    // no new shader compilation / relink on theme change
    expect((gl.createShader as ReturnType<typeof vi.fn>).mock.calls.length).toBe(createShaderBefore);
    expect(calls.linkProgram || 0).toBe(linkBefore);
    engine.dispose();
  });

  it('onError fires when WebGL is unavailable (no throw)', () => {
    const onError = vi.fn();
    const canvas = {
      getContext: vi.fn(() => null),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme, onError });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    engine.dispose(); // no-op, should not throw
  });

  it('stop() cancels rAF', () => {
    const { gl } = makeMockGL();
    const canvas = makeCanvas(gl);
    const engine = new LiquidCanvas({ canvas, theme: defaultTheme });
    engine.start();
    engine.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    engine.dispose();
  });
});
