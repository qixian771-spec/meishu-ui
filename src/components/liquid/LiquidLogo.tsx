import './liquidElements.css';

export interface LiquidLogoProps {
  size?: number;
  className?: string;
  title?: string;
}

export function LiquidLogo({ size = 36, className = '', title = '灵犀 Nexus' }: LiquidLogoProps) {
  const markSize = size;
  const iconSize = Math.round(size * 0.55);

  return (
    <div className={`liquid-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div
        className="liquid-logo-mark"
        style={{ width: markSize, height: markSize }}
        aria-label="Liquid Brand Mark"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A0A0F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      {title && (
        <span style={{ fontSize: size * 0.5, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.5px' }}>
          {title}
        </span>
      )}
    </div>
  );
}
