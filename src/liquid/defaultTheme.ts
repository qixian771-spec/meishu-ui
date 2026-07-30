import type { LiquidTheme } from './types';

/** Default theme — reproduces liquid-demo.html's exact values. */
export const defaultTheme: LiquidTheme = {
  colors: ['#A78BFA', '#60A5FA', '#4ADE80', '#FB7185', '#F472B6'],
  base: '#0A0A0F',
  intensity: 0.9,
  speed: 0.05,
  warp: 2.0,
};

/** Warm alternate theme — proves runtime uniform-driven re-skin (no recompile). */
export const warmTheme: LiquidTheme = {
  colors: ['#F59E0B', '#FB7185', '#A78BFA', '#F472B6', '#60A5FA'],
  base: '#0A0A0F',
  intensity: 0.95,
  speed: 0.04,
  warp: 2.2,
};
