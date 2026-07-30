import './liquidElements.css';

export interface LiquidAvatarProps {
  src?: string;
  name?: string;
  size?: number;
  showStatus?: boolean;
  statusColor?: string;
  className?: string;
}

export function LiquidAvatar({
  src,
  name = 'User',
  size = 40,
  showStatus = true,
  statusColor = '#4ADE80',
  className = '',
}: LiquidAvatarProps) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className={`liquid-avatar-container ${className}`}>
      <div className="liquid-avatar-ring" style={{ width: size, height: size }}>
        {src ? (
          <img
            src={src}
            alt={name}
            className="liquid-avatar-img"
            style={{ width: size - 4, height: size - 4, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="liquid-avatar-img"
            style={{
              width: size - 4,
              height: size - 4,
              background: '#0A0A0F',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round((size - 4) * 0.4),
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
        )}
      </div>
      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, Math.round(size * 0.25)),
            height: Math.max(8, Math.round(size * 0.25)),
            borderRadius: '50%',
            background: statusColor,
            border: '2px solid #0A0A0F',
            boxShadow: '0 0 6px ' + statusColor,
          }}
        />
      )}
    </div>
  );
}
