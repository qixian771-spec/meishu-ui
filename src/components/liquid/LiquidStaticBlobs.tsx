import { ARDOT_TOKEN_MAP } from './ardotTokenMap';

export interface LiquidStaticBlobsProps {
  className?: string;
}

/**
 * Static multi-layer radial gradient blob fallback for Ardot canvas & screenshot alignment (DESIGN-05).
 */
export function LiquidStaticBlobs({ className = '' }: LiquidStaticBlobsProps) {
  const { violet, blue, green } = ARDOT_TOKEN_MAP.brandColors;

  return (
    <div
      className={`liquid-static-blobs ${className}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${violet}aa 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          right: '-5%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${blue}aa 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${green}88 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
