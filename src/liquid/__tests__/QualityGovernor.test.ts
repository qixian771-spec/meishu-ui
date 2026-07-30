import { describe, it, expect, vi } from 'vitest';
import { QualityGovernor } from '../QualityGovernor';

describe('QualityGovernor', () => {
  it('starts at qualityScale 1.0', () => {
    const governor = new QualityGovernor();
    expect(governor.getQualityScale()).toBe(1.0);
  });

  it('steps down from 1.0 -> 0.75 -> 0.5 when frame render duration > 20ms over sustained frames', () => {
    const onQualityChange = vi.fn();
    const governor = new QualityGovernor({ onQualityChange });

    // Simulate 60 frames at 25ms render time
    for (let i = 0; i < 65; i++) {
      governor.recordFrameTime(25);
    }
    expect(governor.getQualityScale()).toBe(0.75);
    expect(onQualityChange).toHaveBeenCalledWith(0.75);

    // Simulate another 65 slow frames
    for (let i = 0; i < 65; i++) {
      governor.recordFrameTime(25);
    }
    expect(governor.getQualityScale()).toBe(0.5);
    expect(onQualityChange).toHaveBeenCalledWith(0.5);
  });

  it('recovers with hysteresis from 0.5 -> 0.75 -> 1.0 when frame time < 12ms over sustained frames', () => {
    const governor = new QualityGovernor();
    governor.setQualityScale(0.5);

    // Simulate 185 fast frames at 5ms
    for (let i = 0; i < 185; i++) {
      governor.recordFrameTime(5);
    }
    expect(governor.getQualityScale()).toBe(0.75);

    // Simulate another 185 fast frames
    for (let i = 0; i < 185; i++) {
      governor.recordFrameTime(5);
    }
    expect(governor.getQualityScale()).toBe(1.0);
  });
});
