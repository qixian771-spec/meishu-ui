/**
 * Claude ultrathink visual language for product surfaces.
 * Horizontal shimmer + sine breath only — no circular blobs, no lavender party.
 * Graphite + Klein cold (sky/cyan). Ref #5 composition via left readability feather.
 */

export type UltrathinkColors = {
  ink: [number, number, number];
  sky: [number, number, number];
  klein: [number, number, number];
  mist: [number, number, number];
};

export type UltrathinkMode = 'idle' | 'thinking' | 'active';

export const ULTRATHINK_AURORA: UltrathinkColors = {
  ink: [10, 12, 18],
  sky: [125, 211, 252], // #7DD3FC cold
  klein: [29, 78, 216], // #1D4ED8
  mist: [226, 232, 240],
};

export const MODE_PRESETS: Record<
  UltrathinkMode,
  { intensity: number; speed: number; breath: number; peak: number }
> = {
  idle: { intensity: 0.12, speed: 0.03, breath: 0.25, peak: 0.08 },
  thinking: { intensity: 0.65, speed: 0.14, breath: 0.9, peak: 0.32 },
  active: { intensity: 0.9, speed: 0.2, breath: 1.05, peak: 0.48 },
};

function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

export function clipRoundRect(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  radius: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(0, 0, w, h, radius);
  } else {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
  }
  ctx.clip();
}

/**
 * Pure ultrathink: ink wash + horizontal Klein fields + shimmer sweep + left feather.
 * No radial celebration blobs.
 */
export function paintUltrathink(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  opts: {
    intensity?: number;
    mode?: UltrathinkMode;
    hovered?: boolean;
    focusX?: number;
    focusY?: number;
    colors?: UltrathinkColors;
    /** Light studio: pale wash + light feather so dark ink text stays readable */
    surface?: 'dark' | 'light';
  } = {},
) {
  const mode = opts.mode ?? 'thinking';
  const preset = MODE_PRESETS[mode];
  const intensity = (opts.intensity ?? 1) * preset.intensity;
  const hovered = opts.hovered ?? false;
  const colors = opts.colors ?? ULTRATHINK_AURORA;
  const surface = opts.surface ?? 'dark';
  const light = surface === 'light';
  const focusX = opts.focusX ?? width * 0.68;
  const focusY = opts.focusY ?? height * 0.45;
  const focusNX = Math.min(1, Math.max(0, focusX / Math.max(width, 1)));
  const focusNY = Math.min(1, Math.max(0, focusY / Math.max(height, 1)));

  // Base wash — graphite on dark, porcelain on light
  ctx.fillStyle = rgba(colors.ink, light ? 0.92 : 0.97);
  ctx.fillRect(0, 0, width, height);

  // Right-side horizontal Klein fields (elongated linear washes — not circles)
  const pullX = (focusNX - 0.68) * width * 0.06;
  const fieldA = ctx.createLinearGradient(width * 0.45 + pullX, 0, width, height * 0.2);
  fieldA.addColorStop(0, 'rgba(0,0,0,0)');
  fieldA.addColorStop(0.45, rgba(colors.klein, 0.18 * intensity));
  fieldA.addColorStop(1, rgba(colors.sky, 0.28 * intensity));
  ctx.fillStyle = fieldA;
  ctx.fillRect(0, 0, width, height);

  const fieldB = ctx.createLinearGradient(width * 0.55 + pullX, height, width, height * 0.35);
  fieldB.addColorStop(0, 'rgba(0,0,0,0)');
  fieldB.addColorStop(0.5, rgba(colors.sky, 0.12 * intensity));
  fieldB.addColorStop(1, rgba(colors.klein, 0.2 * intensity));
  ctx.fillStyle = fieldB;
  ctx.fillRect(0, 0, width, height);

  // Ultrathink shimmer — thin horizontal sweep; path biased by focusX
  const speed = preset.speed * (hovered ? 1.2 : 1);
  const basePos = ((time * speed) % 1.45) - 0.2;
  const pathBias = (focusNX - 0.5) * 0.2;
  const shimmerPos = basePos + pathBias;
  const bandW = width * (mode === 'idle' ? 0.14 : 0.22);
  const x0 = width * shimmerPos - bandW * 0.5;
  const bandLift = (focusNY - 0.5) * height * 0.1;

  const shimmer = ctx.createLinearGradient(x0, 0, x0 + bandW, 0);
  const peak = preset.peak * (opts.intensity ?? 1) * (hovered ? 1.15 : 1);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.35, rgba(colors.sky, peak * 0.35));
  shimmer.addColorStop(0.5, rgba(colors.mist, peak));
  shimmer.addColorStop(0.65, rgba(colors.klein, peak * 0.28));
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, bandLift * 0.25, width, height);

  // Sine thinking breath (horizontal only)
  const think = 0.5 + 0.5 * Math.sin(time * (0.5 + preset.breath * 0.35));
  const glow = ctx.createLinearGradient(width * 0.4, 0, width, 0);
  glow.addColorStop(0, 'rgba(255,255,255,0)');
  glow.addColorStop(0.55, rgba(colors.sky, (0.02 + think * 0.04) * intensity * preset.breath));
  glow.addColorStop(1, rgba(colors.klein, (0.03 + think * 0.05) * intensity * preset.breath));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Ref #5 feather — left readable zone (follows surface, not hardcoded night ink)
  const edgeWave = Math.sin(time * 0.45) * 0.015 + (focusNX - 0.5) * 0.02;
  const edge = 0.38 + edgeWave;
  const feather = ctx.createLinearGradient(0, 0, width * (edge + 0.16), 0);
  const featherInk = light ? colors.ink : ([10, 12, 18] as [number, number, number]);
  feather.addColorStop(0, rgba(featherInk, light ? 0.98 : 0.97));
  feather.addColorStop(0.5, rgba(featherInk, light ? 0.9 : 0.92));
  feather.addColorStop(0.78, rgba(featherInk, light ? 0.35 : 0.28));
  feather.addColorStop(1, rgba(featherInk, 0));
  ctx.fillStyle = feather;
  ctx.fillRect(0, 0, width, height);

  if (hovered && mode !== 'idle') {
    const hx = focusX;
    const band = ctx.createLinearGradient(hx - width * 0.16, 0, hx + width * 0.16, 0);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, light ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)');
    band.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, width, height);
  }

  // Bottom occlusion — softer on light studio
  const shade = ctx.createLinearGradient(0, height * 0.55, 0, height);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, light ? 'rgba(15, 23, 42, 0.06)' : 'rgba(0,0,0,0.26)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
}
