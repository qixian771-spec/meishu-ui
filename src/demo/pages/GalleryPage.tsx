import { GlassInset, GlassPane } from '../../glass';
import { ThemeSwitcher } from '../../components/theme/ThemeSwitcher';
import { SpectraGlassCard } from '../../components/liquid/SpectraGlassCard';
import { useAccentTheme } from '../../theme/AccentThemeContext';

export function GalleryPage() {
  const { theme } = useAccentTheme();

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <GlassPane variant="hero" wash="glow" className="gallery-hero-pane">
          <div className="gallery-hero-kicker">meishu-ui · glass art system</div>
          <h1 className="gallery-hero-title">可复刻的玻璃美术</h1>
          <p className="gallery-hero-lede">
            token + 契约是真身；React/CSS 是第一个实现。满屏玻璃、玻璃套玻璃、一套色打到底。
          </p>
          <div className="gallery-hero-meta">
            <span>surface · {theme.surface}</span>
            <span>pack · {theme.label}</span>
          </div>
        </GlassPane>
      </section>

      <section className="gallery-section">
        <h2 className="gallery-section-title">原语</h2>
        <p className="gallery-section-sub">Atmosphere → Shell → Pane → Inset</p>
        <div className="gallery-primitive-grid" data-testid="gallery-primitives">
          <GlassPane wash="soft" className="gallery-primitive-card">
            <div className="gallery-primitive-name">GlassAtmosphere</div>
            <p>漂移台面。没有它，玻璃只是灰塑料。</p>
            <pre className="gallery-code">{`<GlassAtmosphere />`}</pre>
          </GlassPane>
          <GlassPane wash="mid" className="gallery-primitive-card">
            <div className="gallery-primitive-name">GlassShell</div>
            <p>透亮外壳 / 侧栏，默认不是哑面石墨。</p>
            <pre className="gallery-code">{`<GlassShell side={…}>`}</pre>
          </GlassPane>
          <GlassPane wash="deep" variant="quiet" className="gallery-primitive-card">
            <div className="gallery-primitive-name">GlassPane</div>
            <p>窗格：顶左 rim + wash + 可读内容区。</p>
            <pre className="gallery-code">{`<GlassPane wash="glow">`}</pre>
          </GlassPane>
          <GlassPane wash="chrome" className="gallery-primitive-card">
            <div className="gallery-primitive-name">GlassInset</div>
            <p>玻璃套玻璃；第三层起自动 tint-only。</p>
            <GlassInset as="row" wash="glow">
              Inset row
            </GlassInset>
            <pre className="gallery-code">{`<GlassInset as="row">`}</pre>
          </GlassPane>
        </div>
      </section>

      <section className="gallery-section">
        <h2 className="gallery-section-title">色调包</h2>
        <p className="gallery-section-sub">点击即切换整页 · 同色相深浅，不是彩虹</p>
        <ThemeSwitcher />
        <div className="gallery-theme-sample">
          <SpectraGlassCard
            id="gallery-sample"
            variant="quiet"
            wash="mid"
            ultrathink={false}
            tag={theme.label}
            title="同一窗格 · 七套色"
            subtitle="壳 / 窗格 / 内嵌跟着走"
            price="live"
            statusText="同步"
            height={180}
          />
        </div>
      </section>

      <section className="gallery-section">
        <h2 className="gallery-section-title">嵌套预算</h2>
        <p className="gallery-section-sub">真 blur ≤ 2 层 · 第 3 层 tint-only</p>
        <GlassPane wash="soft" className="gallery-nest-demo">
          <div className="gallery-nest-label">Pane · depth 1 · blur 24px · 悬停有手感</div>
          <GlassInset wash="mid">
            <div className="gallery-nest-label">Inset · depth 2 · blur 14px · 光随指针</div>
            <GlassInset wash="glow">
              <div className="gallery-nest-label gallery-nest-label--tint">
                Inset · depth 3 · tint-only · 悬停 / 按下试试
              </div>
            </GlassInset>
          </GlassInset>
        </GlassPane>
      </section>
    </div>
  );
}

export function SampleBanner() {
  return (
    <GlassInset className="sample-banner" data-testid="sample-banner">
      示例组合 · 仅演示美术组合方式，非产品功能
    </GlassInset>
  );
}
