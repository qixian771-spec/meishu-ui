import fragSrc from './liquid.frag';
import vertSrc from './fullscr.vert';
import { themeToUniforms } from './themeBridge';
import type { LiquidCanvasOptions, LiquidTheme } from './types';

type GL = WebGL2RenderingContext | WebGLRenderingContext;

/**
 * Framework-agnostic WebGL2-first engine. Owns context, compile/link, rAF,
 * resize/DPR, context-loss, and uniform pushing. The rAF loop is structured as
 * start()/stop()/renderOnce() from day one so Phase 3 can gate it without refactor.
 */
export class LiquidCanvas {
  private canvas: HTMLCanvasElement;
  private gl: GL | null = null;
  private program: WebGLProgram | null = null;
  private isWebGL2 = false;
  private buf: WebGLBuffer | null = null;
  private locs: Record<string, WebGLUniformLocation | null> = {};
  private aPos = 0;
  private raf = 0;
  private startT = 0;
  private running = false;
  private dprCap: number;
  private onError?: (e: Error) => void;
  private uniforms = themeToUniforms({ colors: ['#000000', '#000000', '#000000', '#000000', '#000000'], base: '#000000', intensity: 0, speed: 0, warp: 2 });
  private disposed = false;

  constructor(opts: LiquidCanvasOptions) {
    this.canvas = opts.canvas;
    this.dprCap = opts.dprCap ?? 2;
    this.onError = opts.onError;

    const gl2 = this.canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
    if (gl2) {
      this.gl = gl2;
      this.isWebGL2 = true;
    } else {
      const gl1 = this.canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }) as WebGLRenderingContext | null
        || this.canvas.getContext('experimental-webgl', { antialias: false, alpha: false }) as WebGLRenderingContext | null;
      this.gl = gl1;
      this.isWebGL2 = false;
    }

    if (!this.gl) {
      this.onError?.(new Error('WebGL not available'));
      return;
    }

    if (!this.initProgram()) return;
    this.initBuffer();
    this.resize();
    this.setTheme(opts.theme);
    this.canvas.addEventListener('webglcontextlost', this.onContextLost as EventListener);
  }

  private compile(type: number, src: string): WebGLShader | null {
    const gl = this.gl!;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      this.onError?.(new Error('Shader compile failed: ' + gl.getShaderInfoLog(sh)));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  private link(vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    const gl = this.gl!;
    const prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      this.onError?.(new Error('Shader link failed: ' + gl.getProgramInfoLog(prog)));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  private initProgram(): boolean {
    const gl = this.gl!;
    const vs = this.compile(gl.VERTEX_SHADER, vertSrc);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return false;
    let prog = this.link(vs, fs);
    // Declaration fallback (WebGL1 only): swap highp → mediump, relink. No octave reduction.
    if (!prog && !this.isWebGL2) {
      const fsMed = this.compile(gl.FRAGMENT_SHADER, fragSrc.replace('precision highp float;', 'precision mediump float;'));
      if (fsMed) prog = this.link(vs, fsMed);
    }
    if (!prog) return false;
    this.program = prog;
    gl.useProgram(prog);
    this.aPos = gl.getAttribLocation(prog, 'a_pos');
    this.locs.u_res = gl.getUniformLocation(prog, 'u_res');
    this.locs.u_time = gl.getUniformLocation(prog, 'u_time');
    this.locs.u_color = gl.getUniformLocation(prog, 'u_color[0]');
    this.locs.u_base = gl.getUniformLocation(prog, 'u_base');
    this.locs.u_intensity = gl.getUniformLocation(prog, 'u_intensity');
    this.locs.u_speed = gl.getUniformLocation(prog, 'u_speed');
    this.locs.u_warp = gl.getUniformLocation(prog, 'u_warp');
    return true;
  }

  private initBuffer(): void {
    const gl = this.gl!;
    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    if (this.aPos >= 0) {
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    }
  }

  /** Push uniforms WITHOUT recompiling/relinking. Called on theme change only. */
  setTheme(theme: LiquidTheme): void {
    if (!this.gl || !this.program) return;
    this.uniforms = themeToUniforms(theme);
    const gl = this.gl;
    gl.useProgram(this.program);
    if (this.locs.u_color) gl.uniform3fv(this.locs.u_color, this.uniforms.u_color);
    if (this.locs.u_base) gl.uniform3f(this.locs.u_base, this.uniforms.u_base[0], this.uniforms.u_base[1], this.uniforms.u_base[2]);
    if (this.locs.u_intensity) gl.uniform1f(this.locs.u_intensity, this.uniforms.u_intensity);
    if (this.locs.u_speed) gl.uniform1f(this.locs.u_speed, this.uniforms.u_speed);
    if (this.locs.u_warp) gl.uniform1f(this.locs.u_warp, this.uniforms.u_warp);
  }

  resize(): void {
    if (!this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    const gl = this.gl;
    gl.viewport(0, 0, w, h);
    if (this.locs.u_res) gl.uniform2f(this.locs.u_res, w, h);
  }

  /** Draw exactly one frame at the given time (seconds). Does not continue the loop. */
  renderOnce(time?: number): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const t = time ?? (performance.now() - this.startT) / 1000;
    if (this.locs.u_time) gl.uniform1f(this.locs.u_time, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Begin the rAF loop. Safe to call once; no-op if already running. */
  start(): void {
    if (!this.gl || !this.program || this.running) return;
    this.running = true;
    this.startT = performance.now();
    const loop = () => {
      if (!this.running) return;
      this.renderOnce();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Cancel the rAF loop without destroying the context. */
  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.stop();
    this.onError?.(new Error('WebGL context lost'));
  };

  /** Tear down all GL resources, listeners, and rAF. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost as EventListener);
    const gl = this.gl;
    if (gl && this.program) {
      gl.deleteProgram(this.program);
      if (this.buf) gl.deleteBuffer(this.buf);
    }
    this.program = null;
    this.buf = null;
    this.gl = null;
  }
}
