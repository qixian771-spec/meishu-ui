import { useEffect, useRef } from 'react';
import { clipRoundRect, paintUltrathink, type UltrathinkMode } from '../../liquid/ultrathink';
import { paintGlassWash, type GlassWashId } from '../../liquid/glassWash';
import { useAccentTheme } from '../../theme/AccentThemeContext';

export type GlassCardVariant = 'quiet' | 'hero';

export interface SpectraGlassCardProps {
  id?: string;
  tag?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  statusText?: string;
  statusColor?: string;
  accentColor?: string;
  themeId?: string;
  variant?: GlassCardVariant;
  ultrathink?: boolean;
  /** Tonal glass role inside the active accent theme */
  wash?: GlassWashId;
  /** idle ≈ still · thinking · active (focal eye) */
  mode?: UltrathinkMode;
  shimmerText?: boolean;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function SpectraGlassCard({
  id = 'glass-card',
  tag,
  title,
  subtitle,
  price,
  statusText,
  statusColor,
  accentColor,
  themeId,
  variant = 'quiet',
  ultrathink,
  wash = 'chrome',
  mode,
  shimmerText,
  height = 'auto',
  className = '',
  style = {},
  children,
  onClick,
}: SpectraGlassCardProps) {
  const { themeId: accentThemeId, theme: accentTheme } = useAccentTheme();
  const resolvedThemeId = themeId ?? accentThemeId;
  const resolvedStatus = statusColor ?? accentTheme.primary;
  const resolvedAccent = accentColor ?? accentTheme.primary;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isHero = variant === 'hero';
  const useUltrathink = ultrathink ?? isHero;
  const resolvedMode: UltrathinkMode = mode ?? (isHero ? 'thinking' : 'idle');
  const useShimmerText = shimmerText ?? isHero;

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const shadow = shadowRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !card || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let heightPx = canvas.height;
    let time = 0;

    const spot = { x: width * 0.68, y: heightPx * 0.42 };
    const targetSpot = { x: width * 0.68, y: heightPx * 0.42 };

    let rafId: number;
    let isVisible = true;
    let isHovered = false;

    const resetLight = () => {
      if (shadow) {
        shadow.style.transform = '';
        shadow.style.filter = '';
        shadow.style.opacity = '';
      }
      card.style.setProperty('--light-x', '28%');
      card.style.setProperty('--light-y', '16%');
      card.style.setProperty('--rim-strength', isHero ? '0.38' : '0.28');
    };

    const driveLight = (nx: number, ny: number, hovered: boolean) => {
      const reach = isHero ? 28 : 22;
      const shadowX = -nx * reach;
      const shadowY = (hovered ? 6 : 0) + Math.max(0, ny) * 10;
      const scaleX = (hovered ? 1.12 : 1) + Math.abs(nx) * 0.12;
      const scaleY = hovered ? 1.05 : 0.85;
      const blur = hovered ? 16 : 10;
      const opacity = hovered ? 1 : 0.85;

      if (shadow) {
        shadow.style.transform = `translate(${shadowX.toFixed(1)}px, ${shadowY.toFixed(1)}px) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
        shadow.style.filter = `blur(${blur}px)`;
        shadow.style.opacity = String(opacity);
      }

      card.style.setProperty('--light-x', `${(50 + nx * 78).toFixed(1)}%`);
      card.style.setProperty('--light-y', `${(50 + ny * 78).toFixed(1)}%`);
      card.style.setProperty('--rim-strength', hovered ? (isHero ? '0.58' : '0.45') : isHero ? '0.38' : '0.28');
    };

    const setHover = (hovered: boolean) => {
      isHovered = hovered;
      stage.classList.toggle('is-hovered', hovered);
      card.classList.toggle('is-hovered', hovered);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      targetSpot.x = localX;
      targetSpot.y = localY;

      const nx = localX / Math.max(rect.width, 1) - 0.5;
      const ny = localY / Math.max(rect.height, 1) - 0.5;
      const tiltX = ny * (isHero ? -6 : -4.5);
      const tiltY = nx * (isHero ? 6 : 4.5);
      const lift = isHero ? -14 : -10;
      card.style.transform = `perspective(850px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${lift}px)`;
      driveLight(nx, ny, true);
    };

    const handleMouseEnter = () => setHover(true);

    const handleMouseLeave = () => {
      setHover(false);
      targetSpot.x = width * 0.68;
      targetSpot.y = heightPx * 0.42;
      card.style.transform = 'perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      resetLight();
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observer.observe(card);

    const render = () => {
      if (isVisible) {
        time += 0.016;

        const currentW = canvas.clientWidth || 380;
        const currentH = canvas.clientHeight || 210;
        if (canvas.width !== currentW || canvas.height !== currentH) {
          canvas.width = currentW;
          canvas.height = currentH;
          width = currentW;
          heightPx = currentH;
        }

        ctx.clearRect(0, 0, width, heightPx);
        ctx.save();
        clipRoundRect(ctx, width, heightPx, 18);

        spot.x += (targetSpot.x - spot.x) * 0.14;
        spot.y += (targetSpot.y - spot.y) * 0.14;

        if (useUltrathink) {
          paintUltrathink(ctx, width, heightPx, time, {
            mode: isHovered && resolvedMode === 'idle' ? 'thinking' : resolvedMode,
            hovered: isHovered,
            focusX: spot.x,
            focusY: spot.y,
            colors: accentTheme.ultrathink,
            surface: accentTheme.surface,
          });
        } else {
          paintGlassWash(ctx, width, heightPx, time, wash, {
            intensity: isHovered ? 1 : 0.88,
            focusX: spot.x,
            focusY: spot.y,
            themeId: accentThemeId,
            surface: accentTheme.surface,
            palette: accentTheme.washes[wash],
          });
        }

        ctx.restore();
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      stage.classList.remove('is-hovered');
      card.classList.remove('is-hovered');
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHero, useUltrathink, resolvedMode, wash, accentThemeId, accentTheme]);

  return (
    <div
      ref={stageRef}
      className={`glass-stage glass-stage--${variant} ${className}`}
      style={{ height, ...style }}
      data-testid={`glass-card-${id}`}
      data-theme={resolvedThemeId}
      data-accent-theme={accentThemeId}
      data-wash={wash}
      data-variant={variant}
      data-ultrathink={useUltrathink ? 'true' : 'false'}
      data-mode={resolvedMode}
    >
      <div ref={shadowRef} className="glass-cast-shadow" aria-hidden="true" />

      <div
        ref={cardRef}
        className={`glass-container glass-container--${variant} glass-container--wash-${wash}`}
        onClick={onClick}
      >
        <div className="glass-rim-arc" />
        <canvas ref={canvasRef} className="spectra-card-full-canvas" />

        {title && (
          <div className="spectra-card-header">
            <div>
              {tag && (
                <div className="hud-tag">
                  <span className="hud-dot" style={{ background: resolvedAccent }} />
                  <span className={useShimmerText ? 'ultrathink-text ultrathink-text--soft' : undefined}>
                    {tag}
                  </span>
                </div>
              )}
              <div className={`card-title-lg ${useShimmerText ? 'ultrathink-text' : ''}`}>{title}</div>
              {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
            {isHero && <div className="spectra-action-btn">→</div>}
          </div>
        )}

        {children && <div className="spectra-card-body">{children}</div>}

        {price && (
          <div className="spectra-card-footer">
            <div className={`price-tabular ${useShimmerText ? 'ultrathink-text ultrathink-text--soft' : ''}`}>
              {price}
            </div>
            {statusText && (
              <div
                className="status-badge-pill"
                style={{
                  background: `${resolvedStatus}18`,
                  borderColor: `${resolvedStatus}40`,
                }}
              >
                <span className="status-dot-green" style={{ background: resolvedStatus }} />
                <span className="status-text-green" style={{ color: resolvedStatus }}>
                  {statusText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
