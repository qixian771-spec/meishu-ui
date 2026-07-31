/** Nest-depth blur budget (Shell→Pane→Inset). Card caps → liquid `CARD_BLUR_BUDGET`. */
export const BLUR_BUDGET = {
  maxBlurDepth: 2,
  radius: { 1: 24, 2: 14, 3: 0 } as Record<number, number>,
} as const;

export function resolveBlurForDepth(depth: number): { blur: number; tintOnly: boolean } {
  const d = Math.max(1, Math.floor(depth));
  if (d > BLUR_BUDGET.maxBlurDepth) {
    return { blur: 0, tintOnly: true };
  }
  const blur = BLUR_BUDGET.radius[d] ?? BLUR_BUDGET.radius[BLUR_BUDGET.maxBlurDepth];
  return { blur, tintOnly: false };
}
