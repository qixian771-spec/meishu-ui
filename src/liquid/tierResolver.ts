import type { QualityTier } from './types';

/**
 * Evaluates browser capabilities and device hints to resolve initial QualityTier:
 * - T3: No WebGL support, WebGL context lost, or saveData enabled.
 * - T2: prefers-reduced-motion requested, low hardware concurrency (<= 2 cores).
 * - T1: Healthy GPU / multi-core system.
 */
export function resolveInitialTier(): QualityTier {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'T3';
  }

  // Check prefers-reduced-motion (WCAG 2.2.2 compliance)
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return 'T2';
    }
  } catch {
    // ignore matchMedia error
  }

  // Check WebGL availability
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'T3';
  } catch {
    return 'T3';
  }

  // Check Save-Data header hint
  const nav = navigator as unknown as { connection?: { saveData?: boolean }; hardwareConcurrency?: number };
  if (nav.connection?.saveData) {
    return 'T3';
  }

  // Check Hardware Concurrency hint (low-end CPUs)
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) {
    return 'T2';
  }

  return 'T1';
}
