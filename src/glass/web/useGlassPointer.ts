import { useEffect, type RefObject } from 'react';

export type GlassPointerIntensity = 'pane' | 'inset';

/**
 * Pointer-driven glass affordance: specular follows cursor, subtle tilt on hover,
 * press scale on active. Honors prefers-reduced-motion (no transform).
 */
export function useGlassPointer(
  ref: RefObject<HTMLElement | null>,
  opts: {
    enabled?: boolean;
    intensity?: GlassPointerIntensity;
  } = {},
): void {
  const enabled = opts.enabled ?? true;
  const intensity = opts.intensity ?? 'inset';

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tiltMax = intensity === 'pane' ? 3.2 : 2.4;
    const lift = intensity === 'pane' ? -4 : -3;
    const rimHover = intensity === 'pane' ? '0.42' : '0.48';
    const rimIdle = intensity === 'pane' ? '0.22' : '0.28';

    const setLight = (nx: number, ny: number, hovered: boolean) => {
      el.style.setProperty('--light-x', `${(50 + nx * 72).toFixed(1)}%`);
      el.style.setProperty('--light-y', `${(50 + ny * 72).toFixed(1)}%`);
      el.style.setProperty('--rim-strength', hovered ? rimHover : rimIdle);
    };

    const reset = () => {
      el.classList.remove('is-hovered', 'is-pressed');
      el.style.removeProperty('transform');
      setLight(0, -0.2, false);
    };

    const onEnter = () => {
      el.classList.add('is-hovered');
    };

    const onMove = (e: PointerEvent) => {
      const top = (e.target as Element | null)?.closest?.('.is-interactive');
      if (top !== el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
      setLight(nx, ny, true);
      if (!reduceMotion) {
        const tiltX = ny * -tiltMax;
        const tiltY = nx * tiltMax;
        el.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(${lift}px)`;
      }
    };

    const onLeave = () => {
      reset();
    };

    const onDown = (e: PointerEvent) => {
      const top = (e.target as Element | null)?.closest?.('.is-interactive');
      if (top !== el) return;
      el.classList.add('is-pressed');
    };

    const onUp = () => {
      el.classList.remove('is-pressed');
    };

    setLight(0, -0.2, false);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      reset();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [ref, enabled, intensity]);
}
