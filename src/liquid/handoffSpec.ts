/**
 * Engineering Hand-off Specification Constants & Helper Utilities.
 * Exported for code reuse across components, design system tokens, and QA gates.
 */

export const Z_INDEX_STACK = {
  POSTER_FLOOR: 0,
  WEBGL_CANVAS: 10,
  UI_GLASS_PANELS: 30,
  MODALS_OVERLAYS: 50,
  TOASTS_TOOLTIPS: 100,
} as const;

export const GLASS_BLUR_BUDGET = {
  STANDARD_CARD_BLUR_PX: 14,
  MAX_CARD_BLUR_PX: 16,
  HERO_CARD_BLUR_PX: 26,
  MAX_ACTIVE_SURFACES_PER_SCREEN: 2,
  SOLID_FALLBACK_COLOR: 'rgba(15, 15, 22, 0.92)',
} as const;

export const CSS_VARIABLE_MAP = {
  color1: '--liquid-color-1',
  color2: '--liquid-color-2',
  color3: '--liquid-color-3',
  color4: '--liquid-color-4',
  color5: '--liquid-color-5',
  base: '--liquid-base',
  intensity: '--liquid-intensity',
  speed: '--liquid-speed',
  warp: '--liquid-warp',
  signatureGradient: '--liquid-signature-gradient',
} as const;

export const POSTER_PIPELINE_SPEC = {
  anchorTimeSeconds: 1.0,
  targetFormat: 'image/webp',
  maxFileSizeBytes: 81920, // 80 KB
  aspectRatio: '16:9',
} as const;

/**
 * Validates whether a proposed blur radius stays within standard performance budget.
 */
export function isValidBlurRadius(radiusPx: number, isHeroCard = false): boolean {
  if (typeof radiusPx !== 'number' || !Number.isFinite(radiusPx) || radiusPx < 0) {
    return false;
  }
  const maxAllowed = isHeroCard ? GLASS_BLUR_BUDGET.HERO_CARD_BLUR_PX : GLASS_BLUR_BUDGET.MAX_CARD_BLUR_PX;
  return radiusPx <= maxAllowed;
}

/**
 * Generates style object for glass panels with standard fallback behavior.
 */
export function getBackdropFilterCSS(blurPx = GLASS_BLUR_BUDGET.STANDARD_CARD_BLUR_PX): React.CSSProperties {
  const safeBlur = isValidBlurRadius(blurPx) ? blurPx : GLASS_BLUR_BUDGET.STANDARD_CARD_BLUR_PX;
  return {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: `blur(${safeBlur}px)`,
    WebkitBackdropFilter: `blur(${safeBlur}px)`,
    border: '1px solid rgba(255, 255, 255, 0.12)',
  };
}
