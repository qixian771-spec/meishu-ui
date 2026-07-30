---
phase: 05-liquid-element-differentiators-static-canvas-verification
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/liquid/liquidElements.css
  - src/components/liquid/navStyles.css
  - src/components/liquid/LiquidLogo.tsx
  - src/components/liquid/LiquidAvatar.tsx
  - src/components/liquid/LiquidButton.tsx
  - src/components/liquid/LiquidBadge.tsx
  - src/components/liquid/index.ts
  - src/App.tsx
  - src/components/liquid/ardotTokenMap.ts
  - src/components/liquid/__tests__/LiquidElements.test.tsx
autonomous: true
requirements:
  - DESIGN-03
  - DESIGN-04
  - DESIGN-05
user_setup: []

must_haves:
  truths:
    - "品牌 Logo 标记承载 135° 液态渐变签名与 drop-shadow 发光光晕，在全部 4 个界面（登录、仪表盘、列表详情、设置）保持视觉一致"
    - "激活态导航包含 350ms 签名「倾倒」微交互，主 CTA 按钮（每屏 1-2 个）使用高对比度 #0A0A0F 文本与液态渐变底纹，头像与状态胶囊具备液态签名"
    - "对照 Ardot 静态画布 (709534505401417) 完成 Token 属性映射，提供静态多层发光色团兜底 (.liquid-static-blobs) 解决截图后端渲染校验"
    - "遵循反特性护栏：密集的表格数据、代码块与长文本背后使用实色深色底纹 (#0A0A0F)，绝不铺设液态渐变"
  artifacts:
    - "src/components/liquid/liquidElements.css — 液态签名 CSS Token、主按钮、Logo、头像、胶囊样式"
    - "src/components/liquid/navStyles.css — 导航列表与激活态 .nav-active-liquid 倾倒 (pour) 动画样式"
    - "src/components/liquid/LiquidLogo.tsx — 135° 液态渐变 fill 与 drop-shadow 的品牌 Logo 组件"
    - "src/components/liquid/LiquidAvatar.tsx — 多段渐变边框环与状态指示点的头像组件"
    - "src/components/liquid/LiquidButton.tsx — 135° 液态渐变底色与 #0A0A0F 高对比度文字的主 CTA 按钮组件"
    - "src/components/liquid/LiquidBadge.tsx — 半透明深色质感与发光指示点的状态胶囊组件"
    - "src/components/liquid/ardotTokenMap.ts — Ardot 静态画布 (709534505401417) Token 映射与多层色团兜底 CSS"
    - "src/App.tsx — 整合全部 4 屏 UI 布局（登录、仪表盘、列表+详情、设置）与液态签名元素的 Dev Harness"
    - "src/components/liquid/__tests__/LiquidElements.test.tsx — 覆盖 DESIGN-03/04/05 的 Vitest 契约测试套件"
  key_links:
    - "var(--liquid-signature-gradient) 统一驱动 LiquidLogo, LiquidButton 与 LiquidAvatar 的 135° 调色板"
    - "LiquidButton 字体颜色严格限定为 var(--liquid-cta-text) (#0A0A0F)，通过 WCAG 1.4.3 Level AA 对比度校验 (>8.2:1)"
    - ".nav-active-liquid 使用 cubic-bezier(0.16, 1, 0.3, 1) 的 350ms transition 实现倾倒 (pour) 微交互"
    - "密集表格与正文容器使用 #0A0A0F 实色遮罩，符合反特性护栏要求"
---

<objective>
为「灵犀 Nexus」打造全套液态签名 UI 交互元素（Logo、激活态导航、主 CTA 按钮、头像、状态胶囊），整合至 4 屏 UI 场景（登录、仪表盘、列表详情、设置），并实现 Ardot 静态画布 Token 映射与多层发光色团兜底，完成静态层面的液态设计语言 (Phase 5: DESIGN-03, DESIGN-04, DESIGN-05)。

Purpose: 将 WebGL 液态渐变从系统级底纹延伸织入前台核心交互元素，打造高度识别性的液态美学；建立 WCAG 1.4.3 级高对比度护栏与反特性护栏；对齐 Ardot 静态画布与多层发光色团静态海报，保证截图后端恢复后的对照校验。

Output: `liquidElements.css`, `navStyles.css`, `<LiquidLogo/>`, `<LiquidAvatar/>`, `<LiquidButton/>`, `<LiquidBadge/>`, `ardotTokenMap.ts`, 全功能 4 屏展示 Harness `App.tsx`，以及完整 Vitest 契约测试套件 `LiquidElements.test.tsx`。
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/05-liquid-element-differentiators-static-canvas-verification/RESEARCH.md
@src/liquid/defaultTheme.ts
@src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: 构建液态签名 CSS Token 体系与视觉基础样式 (liquidElements.css & navStyles.css)</name>
  <files>src/components/liquid/liquidElements.css, src/components/liquid/navStyles.css</files>
  <action>
    1. 创建 `src/components/liquid/liquidElements.css`：
       - 定义 `:root` 变量：`--liquid-signature-gradient` (`linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #4ADE80 100%)`)，`--liquid-signature-gradient-hover`，`--liquid-signature-gradient-active`。
       - 定义发光与光晕 Token：`--liquid-glow-purple` (`rgba(167, 139, 250, 0.45)`), `--liquid-glow-blue` (`rgba(96, 165, 250, 0.40)`), `--liquid-glow-green` (`rgba(74, 222, 128, 0.35)`), `--liquid-glow-combined`。
       - 定义表面与文字 Token：`--liquid-cta-text` (`#0A0A0F`), `--liquid-surface-dark` (`#0A0A0F`), `--liquid-surface-glass` (`rgba(255, 255, 255, 0.06)`), `--liquid-border-glass` (`rgba(255, 255, 255, 0.12)`)。
       - 定义动画曲线 Token：`--liquid-transition-pour` (`all 350ms cubic-bezier(0.16, 1, 0.3, 1)`)。
       - 编写 Logo 基础 CSS (`.liquid-logo`, `.liquid-logo-mark`, `.liquid-logo-text`)，含 hover 缩放与 drop-shadow 滤镜增强。
       - 编写主按钮 CSS (`.liquid-btn`, `.liquid-btn-sm`, `.liquid-btn-md`, `.liquid-btn-lg`)，包含 hover/active 缩放、发光阴影与 `:focus-visible` 3px outline。
       - 编写头像 CSS (`.liquid-avatar-container`, `.liquid-avatar-ring`, `.liquid-avatar-img`, `.liquid-avatar-status`)，包含渐变环与在线/忙碌状态点。
       - 编写胶囊 CSS (`.liquid-badge`, `.liquid-badge-dot`, 变体 `success`, `info`, `purple`, `warning`)。
       - 编写多层色团静态兜底 CSS (`.liquid-static-blobs`)，使用 3 重 radial-gradient 与 blur(40px) 模拟 WebGL 液态观感。
    2. 创建 `src/components/liquid/navStyles.css`：
       - 编写 `.nav-list` 与 `.nav-item` 规范。
       - 编写激活态 `.nav-item.nav-active-liquid`：浅紫半透明背景 (`rgba(167, 139, 250, 0.14)`)，左侧 3px `#4ADE80` 实体边缘，`box-shadow: 0 0 16px rgba(167, 139, 250, 0.20)`。
       - 使用 `::before` 伪元素实现 135° 渐变 border 描边与 `transition: var(--liquid-transition-pour)` 倾倒微交互。
  </action>
  <verify>
    <automated>test -f src/components/liquid/liquidElements.css && test -f src/components/liquid/navStyles.css</automated>
  </verify>
  <done>液态签名 CSS Token 与 nav 倾倒微交互样式定义完毕，包含完整的渐变、发光光晕与对比度 Token。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 实现 LiquidLogo 与 LiquidAvatar 组件 (DESIGN-03, DESIGN-04)</name>
  <files>src/components/liquid/LiquidLogo.tsx, src/components/liquid/LiquidAvatar.tsx</files>
  <behavior>
    - LiquidLogo 渲染 SVG 有机液态 Mark，使用 135° linearGradient (#A78BFA -> #60A5FA -> #4ADE80) fill，并施加 drop-shadow 发光
    - LiquidLogo 支持 sm (24px), md (32px), lg (44px) 尺寸与 showText 控制
    - LiquidAvatar 包含外层 135° 渐变 Padding Ring (box-shadow 绿色发光)，支持图片或文字 fallback
    - LiquidAvatar 包含可选 status 指示点 ('online' | 'away' | 'busy')，带有 #0A0A0F 隔离描边
  </behavior>
  <action>
    1. 创建 `src/components/liquid/LiquidLogo.tsx`：
       - 遵循 TypeScript 类型 `LiquidLogoProps` (`size?: 'sm' | 'md' | 'lg'`, `showText?: boolean`, `className?: string`)。
       - 使用内联 SVG 呈现有机流线 Shape，定义 `<linearGradient id="liquidLogoGrad">` 贯穿三色签名。
       - 添加 `data-testid="liquid-logo"` 便于自动化契约测试。
    2. 创建 `src/components/liquid/LiquidAvatar.tsx`：
       - 遵循 `LiquidAvatarProps` (`src?: string`, `alt?: string`, `fallbackText?: string`, `size?: number`, `status?: 'online' | 'away' | 'busy'`, `className?: string`)。
       - 外层 `.liquid-avatar-ring` 渲染 2px 签名渐变边框环与发光。
       - 右下角叠加 `.liquid-avatar-status` 节点，带有 `data-testid="avatar-status"`。
  </action>
  <verify>
    <automated>test -f src/components/liquid/LiquidLogo.tsx && test -f src/components/liquid/LiquidAvatar.tsx</automated>
  </verify>
  <done>LiquidLogo 与 LiquidAvatar 组件创建完成，精确呈现 135° 签名渐变 fill、发光 halo 与状态指示器。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 LiquidButton、LiquidBadge 组件与 Nav Active 倾倒微交互 (DESIGN-04)</name>
  <files>src/components/liquid/LiquidButton.tsx, src/components/liquid/LiquidBadge.tsx, src/components/liquid/index.ts</files>
  <behavior>
    - LiquidButton 采用 135° 液态渐变背景与 #0A0A0F 高对比度文字 (WCAG AAA > 7.5:1)
    - LiquidButton 支持 size ('sm' | 'md' | 'lg')，hover 缩放 1.02 与发光阴影，active 0.98 缩放，focus-visible 蓝环
    - LiquidBadge 渲染半透明磨砂质感胶囊，支持 'success' | 'info' | 'purple' | 'warning' 变体与发光指示点
    - index.ts 导出 LiquidLogo, LiquidButton, LiquidAvatar, LiquidBadge 及其类型
  </behavior>
  <action>
    1. 创建 `src/components/liquid/LiquidButton.tsx`：
       - 继承 `React.ButtonHTMLAttributes<HTMLButtonElement>`。
       - 包含 `size?: 'sm' | 'md' | 'lg'`, `icon?: React.ReactNode`。
       - 渲染 `className="liquid-btn liquid-btn-${size}"` 与 `data-testid="liquid-button"`。
    2. 创建 `src/components/liquid/LiquidBadge.tsx`：
       - 接收 `variant?: 'success' | 'info' | 'purple' | 'warning'`, `showDot?: boolean`。
       - 渲染 `data-testid="liquid-badge"`。
    3. 创建 `src/components/liquid/index.ts`：
       - 导出 `LiquidLogo`, `LiquidButton`, `LiquidAvatar`, `LiquidBadge` 及对应 Props 类型。
  </action>
  <verify>
    <automated>test -f src/components/liquid/LiquidButton.tsx && test -f src/components/liquid/LiquidBadge.tsx && test -f src/components/liquid/index.ts</automated>
  </verify>
  <done>LiquidButton 与 LiquidBadge 开发完毕，index.ts 统一暴露类型与组件 API。</done>
</task>

<task type="auto">
  <name>Task 4: 重构 App.tsx Harness 整合 4 屏 UI 场景与液态签名交互元素 (DESIGN-03, DESIGN-04)</name>
  <files>src/App.tsx</files>
  <action>
    1. 修改 `src/App.tsx`，将现有的调试 Harness 升级为支持 4 屏（登录、仪表盘、任务列表与详情、系统设置）视图切换的完整桌面 UI Harness。
    2. 侧边栏 Top：集成 `<LiquidLogo size="md" />`。
    3. 侧边栏 Navigation：呈现仪表盘、任务管理、系统设置、登录/注册 4 个导航项，点击切换视图，激活项包含 `.nav-active-liquid` 倾倒微交互。
    4. 侧边栏 Bottom：集成 `<LiquidAvatar fallbackText="张伟" status="online" size={38} />` 与架构师个人信息。
    5. 内容区 Top Bar：主 CTA 按钮 `<LiquidButton size="sm">+ 新建任务</LiquidButton>`（每屏仅 1-2 个，符合强调护栏）。
    6. 内容区 Main Grid：
       - Dashboard 屏：核心指标玻璃卡片 + 提交审核主 CTA + 状态胶囊。
       - Task List 屏：密集数据表格与任务 ID，**遵循反特性护栏**，表格与文本背后使用 `#0A0A0F` 实色遮罩底纹。
       - Settings 屏：主题切换 slider + 界面偏好选项。
       - Login 屏：登录卡片 + `<LiquidButton size="lg" style={{ width: '100%' }}>立即登录</LiquidButton>`。
  </action>
  <verify>
    <automated>npx vitest run</automated>
  </verify>
  <done>App.tsx 展现全站 4 屏真实 UI 交互，液态签名贯穿 Logo、导航、主按钮、头像与胶囊，且表格遮罩严禁铺设液态渐变。</done>
</task>

<task type="auto">
  <name>Task 5: 建立 Ardot 静态画布 Alignment Token 映射与多层色团兜底 (DESIGN-05)</name>
  <files>src/components/liquid/ardotTokenMap.ts</files>
  <action>
    1. 创建 `src/components/liquid/ardotTokenMap.ts`：
       - 定义 `ARDOT_CANVAS_ID = '709534505401417'`。
       - 导出 `ARDOT_TOKEN_MAPPINGS` 常量结构，列出 Ardot 画布节点属性 (Logo Fill, Primary CTA, Nav Fill, Avatar Stroke, Glass Card) 与 React CSS Tokens (`var(--liquid-signature-gradient)` 等) 的 1:1 映射。
       - 导出 `STATIC_BLOB_FALLBACK_CSS` 与 React 组件 `LiquidStaticBlobs`，在 WebGL 不可用或静态截图后端栅格化时提供 3 重径向渐变发光色团 (`#A78BFA`, `#60A5FA`, `#4ADE80`) 与 blur 效果，供静态画布对比校验。
  </action>
  <verify>
    <automated>test -f src/components/liquid/ardotTokenMap.ts</automated>
  </verify>
  <done>Ardot 静态画布 Token 映射映射文档与 LiquidStaticBlobs 静态色团兜底组件准备就绪。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 6: 编写 Phase 5 Vitest 契约测试套件 (LiquidElements.test.tsx) (SC1, SC2, SC4)</name>
  <files>src/components/liquid/__tests__/LiquidElements.test.tsx</files>
  <behavior>
    - 测试 LiquidLogo 在 DOM 中正确渲染 SVG fill 渐变与标题
    - 测试 LiquidButton 正确套用 liquid-btn-md 类名、拥有 #0A0A0F 暗色高对比度文本定义
    - 测试 Active Nav 能够接收 .nav-active-liquid 类名并触发倾倒 transition 规则
    - 测试 LiquidAvatar 渲染 135° 渐变 border ring 与指定状态指示点
    - 测试 LiquidBadge 依据 variant 渲染对应的 status 类名与点指示器
    - 测试反特性护栏（密集数据表格不包含 liquid-btn 或 liquid 渐变底纹）
  </behavior>
  <action>
    1. 创建 `src/components/liquid/__tests__/LiquidElements.test.tsx`：
       - 引入 `@testing-library/react` 与 `vitest`。
       - 编写 5 个 unit/DOM test 覆盖 DESIGN-03, DESIGN-04, DESIGN-05。
       - 验证 Logo, Button, Avatar, Badge 的渲染与属性。
       - 运行 `npx vitest run src/components/liquid/__tests__/LiquidElements.test.tsx` 确保测试全部通过。
  </action>
  <verify>
    <automated>npx vitest run src/components/liquid/__tests__/LiquidElements.test.tsx</automated>
  </verify>
  <done>Phase 5 Vitest 契约测试套件全量编写并 100% 通过。</done>
</task>

<task type="auto">
  <name>Task 7: Phase 5 综合门控校验 (Automated Contract Suite + Vite Build) (SC1, SC2, SC3, SC4)</name>
  <files>src/components/liquid/LiquidLogo.tsx, src/components/liquid/LiquidButton.tsx, src/components/liquid/LiquidAvatar.tsx, src/components/liquid/LiquidBadge.tsx, src/App.tsx</files>
  <action>
    1. 运行 `npx vitest run` 验证所有契约测试 100% 通过。
    2. 运行 `npm run build` 验证 TypeScript 类型与 Vite 构建零错误零警告。
    3. 逐项核对 Phase 5 Success Criteria:
       - SC1: 品牌 Logo 标记承载液态渐变签名，在 4 个界面保持一致。
       - SC2: 激活态导航（倾倒微交互）、主 CTA 按钮（每屏 1-2 个）、头像、状态胶囊承载液态签名。
       - SC3: 静态 Ardot 画布 Token 映射与多层发光色团版 (LiquidStaticBlobs) 就绪。
       - SC4: 反特性护栏生效，密集表格/正文后无液态渐变。
  </action>
  <verify>
    <automated>npx vitest run && npm run build</automated>
  </verify>
  <done>Phase 5 全部代码、样式、组件、Harness、测试与 Vite 构建顺利通过校验。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| User Props → SVG/DOM Attributes | Untrusted dynamic props (e.g. `fallbackText`, `className`) passed to liquid UI elements. |
| Contrast Ratio Boundary | Text color over bright liquid gradients MUST maintain WCAG AA contrast (≥ 4.5:1, targeted ≥ 7.5:1). |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-05-01 | Usability / Accessibility Violation | `LiquidButton` | High | mitigate | Enforce solid dark text (`#0A0A0F`) on 135° liquid gradient background (`var(--liquid-cta-text)`), providing >8.2:1 contrast ratio (WCAG AAA). |
| T-05-02 | Visual Fatigue / Low Readability | Table / Text Cards in `App.tsx` | High | mitigate | Anti-feature guard: Enforce solid `#0A0A0F` dark floor behind dense data tables, logs, and body text. |
| T-05-03 | Cross-Site Scripting (XSS) | `LiquidAvatar` / `LiquidLogo` | Medium | mitigate | React jsx escape guarantees text props (`fallbackText`, `children`) are sanitized; CSS classes checked against internal allowlist. |
| T-05-04 | Visual Discrepancy on Static Export | `LiquidStaticBlobs` | Low | mitigate | Provide multi-layer radial gradient fallback CSS (`.liquid-static-blobs`) with blur(40px) matching Ardot static canvas token mapping. |
</threat_model>

<verification>
运行全量契约测试套件与 Vite 构建校验：
```bash
npx vitest run
npm run build
```
</verification>

<success_criteria>
1. 品牌 Logo 标记承载液态渐变签名，在全部 4 个界面保持一致
2. 激活态导航（含签名「倾倒」微交互）、主 CTA 按钮（每屏 1–2 个）、头像、状态胶囊均承载液态签名
3. 截图后端恢复后，静态 Ardot 画布液态观感对照参考图校验，必要时上多层发光色团版
4. 液态仅作强调保留（不铺在密集数据表格或正文文字背后），符合反特性护栏
</success_criteria>

<output>
Create `.planning/phases/05-liquid-element-differentiators-static-canvas-verification/PLAN.md`
</output>
