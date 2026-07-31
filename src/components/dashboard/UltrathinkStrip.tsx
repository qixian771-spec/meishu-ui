import { useEffect, useRef } from 'react';
import { clipRoundRect, paintUltrathink, type UltrathinkMode } from '../../liquid/ultrathink';
import { useAccentTheme } from '../../theme/AccentThemeContext';

/** Compact ultrathink aurora strip for AI / document surfaces */
export function UltrathinkStrip({
  className = '',
  radius = 12,
  mode = 'thinking',
  intensity = 1,
}: {
  className?: string;
  radius?: number;
  mode?: UltrathinkMode;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useAccentTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let time = 0;
    let visible = true;
    let hovered = false;
    const spot = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('mousemove', onMove);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.01 });
    observer.observe(wrap);

    const render = () => {
      if (visible) {
        time += 0.016;
        const w = wrap.clientWidth || 280;
        const h = wrap.clientHeight || 80;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (spot.x === 0) {
            spot.x = w * 0.68;
            spot.y = h * 0.45;
            target.x = spot.x;
            target.y = spot.y;
          }
        }
        spot.x += (target.x - spot.x) * 0.12;
        spot.y += (target.y - spot.y) * 0.12;

        ctx.clearRect(0, 0, w, h);
        ctx.save();
        clipRoundRect(ctx, w, h, radius);
        paintUltrathink(ctx, w, h, time, {
          mode: hovered && mode === 'idle' ? 'thinking' : mode,
          intensity,
          hovered,
          focusX: spot.x,
          focusY: spot.y,
          colors: theme.ultrathink,
          surface: theme.surface,
        });
        ctx.restore();
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('mousemove', onMove);
    };
  }, [radius, mode, intensity, theme]);

  return (
    <div ref={wrapRef} className={`ultrathink-strip-wrap ${className}`}>
      <canvas
        ref={canvasRef}
        className="ultrathink-strip"
        data-testid="ultrathink-strip"
        data-mode={mode}
        aria-hidden="true"
      />
    </div>
  );
}
