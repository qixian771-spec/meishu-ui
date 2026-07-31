import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardWorkspace } from '../DashboardWorkspace';
import { AccentThemeProvider } from '../../../theme/AccentThemeContext';

function renderDash() {
  return render(
    <AccentThemeProvider>
      <DashboardWorkspace />
    </AccentThemeProvider>,
  );
}

describe('DashboardWorkspace (reference #3)', () => {
  it('renders workspace shell with stats, timeline and smart detail', () => {
    renderDash();
    expect(screen.getByTestId('dashboard-workspace')).toBeInTheDocument();
    expect(screen.getByText('任务管理')).toBeInTheDocument();
    expect(screen.getByText('今日任务')).toBeInTheDocument();
    expect(screen.getByText('项目时间轴 · 2025 年 5 月')).toBeInTheDocument();
    expect(screen.getByTestId('smart-detail')).toBeInTheDocument();
    expect(screen.getByText('智能详情')).toBeInTheDocument();
    expect(screen.getByText('thinking')).toBeInTheDocument();
    expect(screen.getAllByTestId('ultrathink-strip').length).toBeGreaterThan(0);
  });

  it('exposes accent theme switcher', () => {
    renderDash();
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /白瓷/ }));
    expect(screen.getByRole('radio', { name: /白瓷/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('defaults focal eye to AI when selected task is in progress', () => {
    renderDash();
    expect(screen.getByTestId('dashboard-workspace')).toHaveAttribute('data-focal', 'ai');
    expect(screen.getByTestId('ai-focal').className).toContain('is-focal');
    expect(screen.getByTestId('smart-detail')).toHaveAttribute('data-surface', 'glass');
  });

  it('shifts focal eye to documents on doc hover with cinematic handoff', () => {
    renderDash();
    const docs = screen.getByLabelText('项目文档堆叠');
    const ai = screen.getByTestId('ai-focal');
    expect(ai.className).toContain('is-focal');
    expect(docs.className).toContain('is-dimmed');

    fireEvent.mouseEnter(docs);
    expect(screen.getByTestId('dashboard-workspace')).toHaveAttribute('data-focal', 'doc');
    expect(docs.className).toContain('is-focal');
    expect(ai.className).toContain('is-dimmed');
    expect(screen.getByTestId('smart-detail')).toHaveAttribute('data-surface', 'quiet');
  });

  it('updates smart detail when a task is selected', () => {
    renderDash();
    fireEvent.click(screen.getByText('信息架构梳理'));
    expect(screen.getByRole('heading', { level: 2, name: '信息架构梳理' })).toBeInTheDocument();
    expect(screen.getByText('Yolanda')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-workspace')).toHaveAttribute('data-focal', 'doc');
  });

  it('toggles accordion groups', () => {
    renderDash();
    const head = screen.getByRole('button', { name: /开发实现/ });
    expect(screen.queryByText('测试与验收准备')).not.toBeInTheDocument();
    fireEvent.click(head);
    expect(screen.getByText('测试与验收准备')).toBeInTheDocument();
  });
});
