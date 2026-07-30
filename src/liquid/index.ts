export { LiquidBackground } from './LiquidBackground';
export type { LiquidBackgroundProps } from './LiquidBackground';
export { PosterLayer } from './PosterLayer';
export type { PosterLayerProps } from './PosterLayer';
export { mountLiquidBackground } from './mount';
export type { MountResult } from './mount';
export { LiquidCanvas } from './LiquidCanvas';
export { QualityGovernor } from './QualityGovernor';
export type { QualityGovernorOptions } from './QualityGovernor';
export { resolveInitialTier } from './tierResolver';
export { defaultTheme, warmTheme } from './defaultTheme';
export { themeToUniforms, hexToVec3 } from './themeBridge';
export type { LiquidTheme, LiquidUniforms, LiquidCanvasOptions, QualityTier } from './types';
export {
  Z_INDEX_STACK,
  GLASS_BLUR_BUDGET,
  CSS_VARIABLE_MAP,
  POSTER_PIPELINE_SPEC,
  isValidBlurRadius,
  getBackdropFilterCSS,
} from './handoffSpec';
