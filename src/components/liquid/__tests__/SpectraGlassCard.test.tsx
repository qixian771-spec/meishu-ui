import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpectraGlassCard } from '../SpectraGlassCard';

describe('SpectraGlassCard Unified UI System Component', () => {
  it('renders SpectraGlassCard with custom title, tag, price and status', () => {
    render(
      <SpectraGlassCard
        id="test-card"
        tag="01 // TEST HUD"
        title="测试仪表盘卡片"
        subtitle="3D 物理玻璃边缘高光"
        price="$128.00 USD"
        statusText="PASSED"
        statusColor="#4ADE80"
        accentColor="#38BDF8"
      />
    );

    expect(screen.getByText('01 // TEST HUD')).toBeInTheDocument();
    expect(screen.getByText('测试仪表盘卡片')).toBeInTheDocument();
    expect(screen.getByText('3D 物理玻璃边缘高光')).toBeInTheDocument();
    expect(screen.getByText('$128.00 USD')).toBeInTheDocument();
    expect(screen.getByText('PASSED')).toBeInTheDocument();
  });

  it('renders custom child elements inside glass container', () => {
    render(
      <SpectraGlassCard id="child-card" title="子组件测试">
        <div data-testid="custom-child">自定义图表区域</div>
      </SpectraGlassCard>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('自定义图表区域')).toBeInTheDocument();
  });

  it('enables ultrathink on hero cards by default', () => {
    render(
      <SpectraGlassCard
        id="think-card"
        variant="hero"
        tag="thinking"
        title="焦点卡片"
      />
    );

    expect(screen.getByText('焦点卡片')).toBeInTheDocument();
    expect(screen.getByTestId('glass-card-think-card')).toHaveAttribute('data-ultrathink', 'true');
    expect(screen.getByTestId('glass-card-think-card')).toHaveAttribute('data-mode', 'thinking');
  });

  it('keeps quiet cards on wash glass by default', () => {
    render(<SpectraGlassCard id="idle-card" variant="quiet" mode="idle" wash="soft" title="静卡" />);
    expect(screen.getByTestId('glass-card-idle-card')).toHaveAttribute('data-mode', 'idle');
    expect(screen.getByTestId('glass-card-idle-card')).toHaveAttribute('data-ultrathink', 'false');
    expect(screen.getByTestId('glass-card-idle-card')).toHaveAttribute('data-wash', 'soft');
  });

  it('switches canvas theme via themeId prop', () => {
    render(
      <SpectraGlassCard id="klein-card" themeId="klein" title="克莱因卡片" />
    );
    expect(screen.getByTestId('glass-card-klein-card')).toHaveAttribute('data-theme', 'klein');
  });

  it('supports hero and quiet variants for focal hierarchy', () => {
    const { rerender } = render(
      <SpectraGlassCard id="v-card" variant="hero" title="主卡" />
    );
    expect(screen.getByTestId('glass-card-v-card')).toHaveAttribute('data-variant', 'hero');

    rerender(<SpectraGlassCard id="v-card" variant="quiet" title="静卡" />);
    expect(screen.getByTestId('glass-card-v-card')).toHaveAttribute('data-variant', 'quiet');
  });
});
