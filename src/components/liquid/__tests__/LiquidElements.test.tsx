import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LiquidLogo } from '../LiquidLogo';
import { LiquidAvatar } from '../LiquidAvatar';
import { LiquidButton } from '../LiquidButton';
import { LiquidBadge } from '../LiquidBadge';

afterEach(() => {
  cleanup();
});

describe('Liquid Signature Elements', () => {
  it('renders LiquidLogo with SVG brand mark and signature title', () => {
    const { getByText, getByLabelText } = render(<LiquidLogo title="灵犀 Nexus" />);
    expect(getByText('灵犀 Nexus')).toBeInTheDocument();
    expect(getByLabelText('Liquid Brand Mark')).toBeInTheDocument();
  });

  it('renders LiquidAvatar with initials fallback and status dot', () => {
    const { getByText } = render(<LiquidAvatar name="Alex Chen" showStatus={true} />);
    expect(getByText('AL')).toBeInTheDocument();
  });

  it('renders LiquidButton with signature class', () => {
    const { getByRole } = render(<LiquidButton>新建任务</LiquidButton>);
    const button = getByRole('button');
    expect(button).toHaveTextContent('新建任务');
    expect(button).toHaveClass('liquid-button');
  });

  it('renders LiquidBadge with status text and dot', () => {
    const { getByText } = render(<LiquidBadge dotColor="#4ADE80">进行中</LiquidBadge>);
    expect(getByText('进行中')).toBeInTheDocument();
  });
});
