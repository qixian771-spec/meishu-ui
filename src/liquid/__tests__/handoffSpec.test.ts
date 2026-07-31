import { describe, it, expect } from 'vitest';
import {
  Z_INDEX_STACK,
  CARD_BLUR_BUDGET,
  GLASS_BLUR_BUDGET,
  CSS_VARIABLE_MAP,
  POSTER_PIPELINE_SPEC,
  isValidBlurRadius,
  getBackdropFilterCSS,
} from '../handoffSpec';
import { NEST_BLUR_BUDGET } from '../index';

describe('Engineering Hand-off Spec Contracts', () => {
  it('validates 5-tier Z-Index ladder values', () => {
    expect(Z_INDEX_STACK.POSTER_FLOOR).toBe(0);
    expect(Z_INDEX_STACK.WEBGL_CANVAS).toBe(10);
    expect(Z_INDEX_STACK.UI_GLASS_PANELS).toBe(30);
    expect(Z_INDEX_STACK.MODALS_OVERLAYS).toBe(50);
    expect(Z_INDEX_STACK.TOASTS_TOOLTIPS).toBe(100);
  });

  it('enforces card blur budget limits', () => {
    expect(CARD_BLUR_BUDGET).toBe(GLASS_BLUR_BUDGET);
    expect(isValidBlurRadius(14)).toBe(true);
    expect(isValidBlurRadius(16)).toBe(true);
    expect(isValidBlurRadius(20)).toBe(false); // exceeds standard max 16px
    expect(isValidBlurRadius(26, true)).toBe(true); // hero card exception allows 26px
    expect(isValidBlurRadius(-1)).toBe(false);
  });

  it('keeps nest blur budget distinct from card caps', () => {
    expect(NEST_BLUR_BUDGET.maxBlurDepth).toBeGreaterThan(0);
    expect('STANDARD_CARD_BLUR_PX' in NEST_BLUR_BUDGET).toBe(false);
  });

  it('generates compliant backdropFilter style object', () => {
    const style = getBackdropFilterCSS(14);
    expect(style.backdropFilter).toBe('blur(14px)');
    expect(style.WebkitBackdropFilter).toBe('blur(14px)');
  });

  it('exports CSS variable maps & poster pipeline specs', () => {
    expect(CSS_VARIABLE_MAP.signatureGradient).toBe('--liquid-signature-gradient');
    expect(POSTER_PIPELINE_SPEC.maxFileSizeBytes).toBe(81920);
  });
});
