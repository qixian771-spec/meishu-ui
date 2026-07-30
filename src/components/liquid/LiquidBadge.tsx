import './liquidElements.css';

export interface LiquidBadgeProps {
  children: React.ReactNode;
  dotColor?: string;
  className?: string;
}

export function LiquidBadge({ children, dotColor, className = '' }: LiquidBadgeProps) {
  return (
    <span className={`liquid-badge ${className}`}>
      <span
        className="liquid-badge-dot"
        style={dotColor ? { background: dotColor, boxShadow: `0 0 6px ${dotColor}` } : undefined}
      />
      {children}
    </span>
  );
}
