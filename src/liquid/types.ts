export interface LiquidTheme {
  /** Five palette colors as #RRGGBB (violet, blue, green, coral, pink by default). */
  colors: [string, string, string, string, string];
  /** Dark base color as #RRGGBB. */
  base: string;
  /** Color intensity, clamped to [0, 1]. */
  intensity: number;
  /** Animation speed multiplier (u_time factor), clamped to >= 0. */
  speed: number;
  /** Domain-warp strength, clamped to > 0. */
  warp: number;
}

export interface LiquidUniforms {
  /** 15 floats: 5 vec3 colors flattened. */
  u_color: Float32Array;
  u_base: [number, number, number];
  u_intensity: number;
  u_speed: number;
  u_warp: number;
}

export interface LiquidCanvasOptions {
  canvas: HTMLCanvasElement;
  theme: LiquidTheme;
  /** devicePixelRatio clamp (default 2). */
  dprCap?: number;
  /** Called on WebGL unavailable or context loss (Phase 2 surfaces; Phase 3 handles fallback). */
  onError?: (e: Error) => void;
}
