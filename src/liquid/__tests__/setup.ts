import '@testing-library/jest-dom/vitest';

// Global mock for HTMLCanvasElement.prototype.getContext in jsdom environment
if (typeof window !== 'undefined' && HTMLCanvasElement.prototype.getContext) {
  const dummyGL = {
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
  };

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
    if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
      return dummyGL as unknown as WebGLRenderingContext;
    }
    return origGetContext.apply(this, [type, ...args] as [string, ...unknown[]]);
  };
}
