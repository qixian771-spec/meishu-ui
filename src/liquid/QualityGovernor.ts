export interface QualityGovernorOptions {
  /** Target max frame duration in ms (default 20ms = ~50 FPS). */
  targetMaxFrameMs?: number;
  /** Frame duration in ms considered fast enough to trigger recovery (default 12ms = ~83 FPS). */
  recoveryFrameMs?: number;
  /** Callback fired when quality scale level changes. */
  onQualityChange?: (qualityScale: number) => void;
}

export class QualityGovernor {
  private qualityScale = 1.0;
  private frameTimes: number[] = [];
  private readonly maxSamples = 60;
  private targetMaxFrameMs: number;
  private recoveryFrameMs: number;
  private onQualityChange?: (qualityScale: number) => void;
  private slowFrameCounter = 0;
  private fastFrameCounter = 0;

  constructor(opts?: QualityGovernorOptions) {
    this.targetMaxFrameMs = opts?.targetMaxFrameMs ?? 20;
    this.recoveryFrameMs = opts?.recoveryFrameMs ?? 12;
    this.onQualityChange = opts?.onQualityChange;
  }

  getQualityScale(): number {
    return this.qualityScale;
  }

  setQualityScale(scale: number): void {
    const clamped = Math.min(1.0, Math.max(0.5, scale));
    if (this.qualityScale !== clamped) {
      this.qualityScale = clamped;
      this.onQualityChange?.(this.qualityScale);
    }
  }

  /** Record a single frame's render duration in ms and evaluate potential scale adjustment. */
  recordFrameTime(frameMs: number): number {
    this.frameTimes.push(frameMs);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    const avgMs = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    // Check for sustained slow performance
    if (avgMs > this.targetMaxFrameMs) {
      this.slowFrameCounter++;
      this.fastFrameCounter = 0;
      if (this.slowFrameCounter >= 60 && this.qualityScale > 0.5) {
        this.slowFrameCounter = 0;
        const nextScale = this.qualityScale === 1.0 ? 0.75 : 0.5;
        this.setQualityScale(nextScale);
      }
    } else if (avgMs < this.recoveryFrameMs) {
      // Hysteresis recovery for sustained high performance
      this.fastFrameCounter++;
      this.slowFrameCounter = 0;
      if (this.fastFrameCounter >= 180 && this.qualityScale < 1.0) {
        this.fastFrameCounter = 0;
        const nextScale = this.qualityScale === 0.5 ? 0.75 : 1.0;
        this.setQualityScale(nextScale);
      }
    } else {
      this.slowFrameCounter = 0;
      this.fastFrameCounter = 0;
    }

    return this.qualityScale;
  }

  reset(): void {
    this.frameTimes = [];
    this.slowFrameCounter = 0;
    this.fastFrameCounter = 0;
    this.qualityScale = 1.0;
  }
}
