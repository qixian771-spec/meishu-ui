import { describe, it, expect, vi } from 'vitest';
import { LiquidCanvas } from '../LiquidCanvas';
import { defaultTheme } from '../defaultTheme';

describe('WebGL Context Loss & Graceful Fallback', () => {
  it('triggers onError callback when webglcontextlost event fires', () => {
    const onError = vi.fn();
    const listeners: Record<string, EventListener> = {};

    const canvas = {
      clientWidth: 800,
      clientHeight: 600,
      width: 800,
      height: 600,
      getContext: vi.fn(() => ({
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
        deleteProgram: () => {},
        deleteShader: () => {},
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
      })),
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        listeners[event] = handler;
      }),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const engine = new LiquidCanvas({ canvas, theme: defaultTheme, onError });

    // Fire synthetic webglcontextlost event
    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as Event;
    listeners['webglcontextlost']?.(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toContain('context lost');

    engine.dispose();
  });
});
