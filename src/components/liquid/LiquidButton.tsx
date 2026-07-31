import React from 'react';
import './liquidElements.css';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export function LiquidButton({
  children,
  variant = 'primary',
  icon,
  className = '',
  style,
  ...props
}: LiquidButtonProps) {
  if (variant === 'secondary') {
    return (
      <button
        className={`liquid-button-secondary ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--accent-primary-border, rgba(167, 139, 250, 0.35))',
          color: 'var(--text-primary, #FFFFFF)',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 20px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          ...style,
        }}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }

  return (
    <button className={`liquid-button ${className}`} style={style} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
