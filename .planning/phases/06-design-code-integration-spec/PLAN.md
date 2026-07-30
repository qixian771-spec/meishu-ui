---
phase: 06-design-code-integration-spec
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/INTEGRATION_SPEC.md
  - src/liquid/handoffSpec.ts
  - src/liquid/index.ts
  - src/liquid/__tests__/handoffSpec.test.ts
autonomous: true
requirements:
  - HANDOFF-01
user_setup: []

must_haves:
  truths:
    - "分层 z-stack 模型已完整文档化并在代码中暴露 (海报 z:0 / canvas z:10 / UI z:30 / 弹层 z:50 / 提示 z:100)，含 backdrop-filter 根层叠上下文防破禁令规则"
    - "玻璃模糊预算已严格规定 (标准卡片 12px–16px、Hero 24px–26px、每屏 ≤2 个实时 backdrop-filter 面、@supports 实色兜底)"
    - "token→uniform 映射表与 CSS 变量绑定已规定 (LiquidTheme 5 色调色板映射至 u_color[5]/u_base/u_intensity/u_speed/u_warp，无 GLSL 重编译)，并在 handoffSpec.ts 中导出"
    - "海报资源管线已规范 (u_time=1.0s 锚定帧自动截取 → 1920x1080 WebP ≤80 KB)，含 T1↔T3 无缝衔接与零布局位移要求"
  artifacts:
    - "docs/INTEGRATION_SPEC.md — 包含 z-stack 模型、玻璃模糊预算、token→uniform 映射与海报管线的完整 Design→Code 集成规范文档"
    - "src/liquid/handoffSpec.ts — 导出 Z_INDEX_STACK, GLASS_BLUR_BUDGET, CSS_VARIABLE_MAP, POSTER_PIPELINE_SPEC 常量与契约校验 helper"
    - "src/liquid/index.ts — 重新导出 handoffSpec 契约常量与 helpers"
    - "src/liquid/__tests__/handoffSpec.test.ts — 验证 handoffSpec 常量、CSS 变量绑定与 blur 预算的 Vitest 契约测试套件"
  key_links:
    - "docs/INTEGRATION_SPEC.md Section 1 规范 z:0 至 z:100 的 5 层 z-stack 阶梯与根层叠上下文卫生禁令"
    - "docs/INTEGRATION_SPEC.md Section 2 规范 ≤16px 模糊上限与每屏 ≤2 个 backdrop-filter 面硬预算，搭配 @supports CSS 降级"
    - "handoffSpec.ts 导出 HANDOFF_SPEC 规范常量，与 themeBridge.ts 中的 themeToUniforms 1:1 对齐"
    - "handoffSpec.test.ts 契约测试全量校验 handoff 常量导出与 CSS 变量绑定的有效性"
---

<objective>
为「灵犀 Nexus」产出完整的 Design→Code 集成规范文档 (`docs/INTEGRATION_SPEC.md`) 与 TypeScript 契约导出模块 (`src/liquid/handoffSpec.ts`)，让工程师能忠实落地液态+玻璃系统：分层 z-stack 模型、玻璃模糊预算、token→uniform 映射、海报资源管线，并由完整的 Vitest 契约测试套件全量验证 (Phase 6: HANDOFF-01)。

Purpose: 建立设计系统到前端工程落地的单源真理 (Single Source of Truth)，规范 z-index 阶梯与层叠上下文卫生避免模糊失效，限定模糊半径与实时 glass 表面数量防止 GPU 热节流，统一 Hex-to-Uniform 映射保证 shader 与海报配色一致，规范 WebP 海报截取与 T1↔T3 零位移平滑降级。

Output: `docs/INTEGRATION_SPEC.md` (完整 Hand-off 规范文档), `src/liquid/handoffSpec.ts` (规范常量与 helper), `src/liquid/index.ts` (导出更新), 以及 `src/liquid/__tests__/handoffSpec.test.ts` (Vitest 契约测试套件)。
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/06-design-code-integration-spec/RESEARCH.md
@src/liquid/types.ts
@src/liquid/themeBridge.ts
@src/components/liquid/ardotTokenMap.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: 创建 docs/INTEGRATION_SPEC.md Section 1 (Z-Stack Model & Stacking Context Rules) 与 Section 2 (Glassmorphism Blur Budget & CSS @supports fallbacks)</name>
  <files>docs/INTEGRATION_SPEC.md</files>
  <action>
    1. 创建 `docs/INTEGRATION_SPEC.md`，撰写 Title、Executive Overview 与 Visual Contract 基础章节（深色玻璃 #0A0A0F 基底 + 翠绿 #4ADE80 强调色）。
    2. 撰写 Section 1: Layering Z-Stack Model
       - 详细说明 5 层 z-index 阶梯表：`z:0` PosterLayer (Theme Base Floor), `z:10` LiquidCanvas (Fixed Fullscreen WebGL), `z:30` Main UI & Glass Panels, `z:50` Modals & Overlays, `z:100` Toasts & Tooltips。
       - 详细规范祖先 Stacking Context 卫生规则：严禁 `html`, `body`, `#root` 或 canvas 任何祖先元素设置 `transform` (!=none), `opacity` (<1), `will-change`, `filter`/`backdrop-filter`, `perspective`, `contain`, `isolation: isolate`, `mix-blend-mode`。记录破坏性后果（导致 child backdrop-filter 无法采样 z:10 canvas 而是采样黑洞/透明底）。
       - 记录 DEV 模式下 `StackingGuard` (`checkStackingContext(canvas)`) 运行时自动扫描与控制台报警机制。
    3. 撰写 Section 2: Glassmorphism Blur Budget
       - 模糊半径预算表：标准应用卡片 12px–16px (默认 16px)，Hero/Login 卡片 24px–26px (默认 24px，限每屏 ≤1 个)，微型 UI 元素 8px–10px。
       - 实时玻璃面硬预算：每屏 Viewport 内活跃 `backdrop-filter` 卡片数量 ≤ 2。详细阐述 GPU 重描与 Gaussian Blur 离屏纹理开销原理。超量规则：第 3+ 个容器必须退化为实色半透明背景 (`background: rgba(18, 18, 26, 0.75)`)。
       - 实色兜底模式：给出原生的 CSS `@supports (backdrop-filter: blur(1px))` 代码规范，保证在低端设备或不支持 backdrop-filter 的浏览器中降级为高可读性实色背景。
  </action>
  <verify>
    <automated>test -f docs/INTEGRATION_SPEC.md</automated>
  </verify>
  <done>docs/INTEGRATION_SPEC.md 建立，Section 1 (Z-Stack & Stacking Context) 与 Section 2 (Glass Blur Budget & @supports) 完整文档化。</done>
</task>

<task type="auto">
  <name>Task 2: 撰写 docs/INTEGRATION_SPEC.md Section 3 (Design Tokens to Uniform Mapping Contract & CSS Variable Bindings)</name>
  <files>docs/INTEGRATION_SPEC.md</files>
  <action>
    1. 在 `docs/INTEGRATION_SPEC.md` 中追加 Section 3: Design Tokens -> Uniform Mapping Spec。
    2. 详细规范 `LiquidTheme` 结构体到 WebGL `LiquidUniforms` 的映射转换规则 (`themeToUniforms(theme)` in `src/liquid/themeBridge.ts`)：
       - 5 色调色板 `colors`: `[string, string, string, string, string]` 映射至 GLSL `uniform vec3 u_color[5]`（15 个 Float32 归一化 RGB 值）。
       - 深色基底 `base`: `string` 映射至 GLSL `uniform vec3 u_base`（3 个 Float32 归一化 RGB 值，默认 `#0A0A0F`）。
       - 强度 `intensity`: `number` 映射至 GLSL `uniform float u_intensity` (clamp `[0.0, 1.0]`)。
       - 速度 `speed`: `number` 映射至 GLSL `uniform float u_speed` (clamp `>= 0.0`)。
       - 扭曲 `warp`: `number` 映射至 GLSL `uniform float u_warp` (clamp `> 0.0`)。
    3. 规范 CSS Custom Properties 接口 (`--liquid-color-1..5`, `--liquid-base`, `--liquid-intensity`, `--liquid-speed`, `--liquid-warp`, `--liquid-signature-gradient`)。
    4. 规范 Zero GLSL Recompilation 契约：主题切换时通过 `gl.uniform3fv` / `gl.uniform1f` 直接更新 Uniform 内存缓存，零 GLSL 重新编译，零卡顿。
  </action>
  <verify>
    <automated>grep -q "Design Tokens" docs/INTEGRATION_SPEC.md || grep -q "Section 3" docs/INTEGRATION_SPEC.md</automated>
  </verify>
  <done>Section 3 撰写完成，详细规范了 Token 到 Uniform 的转换算法、CSS 变量绑定与零重编译契约。</done>
</task>

<task type="auto">
  <name>Task 3: 撰写 docs/INTEGRATION_SPEC.md Section 4 (Poster Asset Pipeline & Tier Transition Contract)</name>
  <files>docs/INTEGRATION_SPEC.md</files>
  <action>
    1. 在 `docs/INTEGRATION_SPEC.md` 中追加 Section 4: Poster Asset Pipeline & Section 5: Degradation Tiers & Integration Code Examples。
    2. 详细规范海报资源管线 (Poster Asset Pipeline)：
       - 静态海报截取策略：在确定性时间戳 `u_time = 1.0` 秒（Anchor Frame 锚定帧）截取 WebGL Canvas 画面。
       - WebP 资源规格：1920x1080 像素分辨率，Lossy WebP (quality: 85)，单张海报文件大小 ≤ 80 KB。
       - 存放路径规范：`public/posters/liquid-poster-default.webp` 与 `public/posters/liquid-poster-warm.webp`。
    3. 详细规范 Tier 降级与平滑过渡契约：
       - 降级层级定义：T1 (Animated WebGL, 60fps) -> T2 (Frozen Single Frame, 0% CPU/GPU rAF) -> T3 (Static WebP Poster, z:0)。
       - 无缝视觉衔接与零布局位移保障：`PosterLayer` 在 DOM `z:0` 保持常驻挂载；进入 T3 时 WebGL canvas 卸载但 PosterLayer 无缝接管背景，配色 100% 一致，无视觉颠簸与布局重排。
       - 端到端 DOM 可观测性 (`data-tier="T1"|"T2"|"T3"` 属性与 `onTierChange` 回调)。
    4. 撰写 Section 5 & 6: TypeScript 契约接口定义与代码集成示例 (`<LiquidBackground />`, `<LiquidLogo />`, `<LiquidButton />`)。
  </action>
  <verify>
    <automated>grep -q "Poster Asset Pipeline" docs/INTEGRATION_SPEC.md || grep -q "Section 4" docs/INTEGRATION_SPEC.md</automated>
  </verify>
  <done>docs/INTEGRATION_SPEC.md 全文撰写完成，涵盖 Z-Stack、Blur 预算、Uniform 映射、海报管线与集成代码示例。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: 创建 TypeScript 集成契约模块 src/liquid/handoffSpec.ts 并更新 index.ts 导出</name>
  <files>src/liquid/handoffSpec.ts, src/liquid/index.ts</files>
  <behavior>
    - 导出 Z_INDEX_STACK 常量 ({ POSTER: 0, CANVAS: 10, MAIN_UI: 30, OVERLAYS: 50, TOASTS: 100 })
    - 导出 GLASS_BLUR_BUDGET 常量 ({ STANDARD_MAX_PX: 16, HERO_MAX_PX: 26, MICRO_MAX_PX: 10, MAX_ACTIVE_SURFACES_PER_SCREEN: 2 })
    - 导出 POSTER_PIPELINE_SPEC 常量 ({ ANCHOR_TIME_SEC: 1.0, MAX_FILE_SIZE_KB: 80, TARGET_RESOLUTION: { width: 1920, height: 1080 }, FORMAT: 'webp', QUALITY: 0.85 })
    - 导出 CSS_VARIABLE_MAP 常量列出全部 --liquid-* CSS 变量键名
    - 导出 helper 函数: isValidBlurRadius(radiusPx, surfaceType), isWithinActiveSurfaceBudget(activeCount), getBackdropFilterCSS(blurPx, opacity)
    - 在 src/liquid/index.ts 中重新导出 handoffSpec 模块
  </behavior>
  <action>
    1. 创建 `src/liquid/handoffSpec.ts`：
       - 定义并导出 `Z_INDEX_STACK` as const。
       - 定义并导出 `GLASS_BLUR_BUDGET` as const。
       - 定义并导出 `POSTER_PIPELINE_SPEC` as const。
       - 定义并导出 `CSS_VARIABLE_MAP` as const。
       - 编写 pure helper 函数：`isValidBlurRadius(radiusPx: number, surfaceType?: 'standard' | 'hero' | 'micro'): boolean`；`isWithinActiveSurfaceBudget(count: number): boolean`；`getBackdropFilterCSS(blurPx: number, fallbackBg?: string): string`。
    2. 修改 `src/liquid/index.ts`：增加 `export * from './handoffSpec';`。
  </action>
  <verify>
    <automated>test -f src/liquid/handoffSpec.ts</automated>
  </verify>
  <done>src/liquid/handoffSpec.ts 常量与 helper 创建完成，并在 src/liquid/index.ts 中成功导出。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 5: 编写 handoffSpec Vitest 契约测试套件 (src/liquid/__tests__/handoffSpec.test.ts)</name>
  <files>src/liquid/__tests__/handoffSpec.test.ts</files>
  <behavior>
    - 验证 Z_INDEX_STACK 各层级数值严格匹配 0, 10, 30, 50, 100 契约
    - 验证 GLASS_BLUR_BUDGET 模糊半径上限 (16px / 26px / 10px) 与活跃面上限 (2)
    - 验证 POSTER_PIPELINE_SPEC 锚定帧时间 (1.0s) 与文件上限 (80 KB)
    - 验证 isValidBlurRadius 对 Standard (≤16), Hero (≤26), Micro (≤10) 的校验逻辑
    - 验证 isWithinActiveSurfaceBudget 对 ≤2 返回 true，>2 返回 false
    - 验证 getBackdropFilterCSS 生成正确的 @supports CSS 降级文本
  </behavior>
  <action>
    1. 创建 `src/liquid/__tests__/handoffSpec.test.ts`：
       - 引入 `vitest` (`describe`, `it`, `expect`) 与 `handoffSpec` 导出。
       - 编写测试用例覆盖 `Z_INDEX_STACK`, `GLASS_BLUR_BUDGET`, `POSTER_PIPELINE_SPEC`, `CSS_VARIABLE_MAP` 常量。
       - 编写测试用例覆盖 `isValidBlurRadius`, `isWithinActiveSurfaceBudget`, `getBackdropFilterCSS` 校验函数。
       - 运行 `npx vitest run src/liquid/__tests__/handoffSpec.test.ts` 验证 100% 通过。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/handoffSpec.test.ts</automated>
  </verify>
  <done>src/liquid/__tests__/handoffSpec.test.ts 编写完成，所有 Hand-off 契约测试 100% 通过。</done>
</task>

<task type="auto">
  <name>Task 6: Phase 6 综合门控校验 (Automated Contract Suite + Vite Build)</name>
  <files>docs/INTEGRATION_SPEC.md, src/liquid/handoffSpec.ts, src/liquid/__tests__/handoffSpec.test.ts</files>
  <action>
    1. 运行 `npx vitest run` 验证项目中所有 14 个测试套件 100% 通过。
    2. 运行 `npm run build` 验证 TypeScript 编译与 Vite 构建零报错零警告。
    3. 逐项核对 Phase 6 Success Criteria:
       - SC1: 分层 z-stack 模型已文档化（海报 z:0 / canvas z:10 / UI z:30 / 弹层 z:50 / 提示 z:100），含 backdrop-filter 层叠上下文规则。
       - SC2: 玻璃模糊预算已规定（模糊半径上限 ~12–16px、每屏 ≤2 个实时 backdrop-filter 面、@supports 实色兜底）。
       - SC3: token→uniform 映射已规定（哪些主题 token 喂给 u_color/u_base/u_intensity/u_speed/u_warp），保证 shader 与海报同配色。
       - SC4: 海报资源管线已定义（从 shader 锚定帧自动截取 → 主题化 WebP ≤80 KB），含 T1↔T3 无缝衔接要求。
  </action>
  <verify>
    <automated>npx vitest run && npm run build</automated>
  </verify>
  <done>Phase 6 全部文档、代码常量模块、契约测试与 Vite 构建顺利通过综合校验。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Design Tokens → Uniforms Conversion Boundary | Transformed hex strings must be validated to prevent malformed values in uniform buffers. |
| Specification Rules → Client CSS Execution Boundary | Runtime CSS variable declarations and blur budget values applied in browser renderer. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-06-01 | Performance / GPU Overdraw | Glassmorphism Blur Budget | High | mitigate | Enforce ≤16px blur radius cap and max 2 active backdrop-filter surfaces per screen, documented in spec and checked via `isWithinActiveSurfaceBudget()`. |
| T-06-02 | Visual / Stacking Context Sampling Failure | Layering Z-Stack Model | High | mitigate | Document strict 5-tier z-index ladder (z:0..100) and ancestor stacking context prohibitions, enforced runtime via `StackingGuard`. |
| T-06-03 | Visual Discrepancy / Fallback Black Screen | Poster Asset Pipeline | Medium | mitigate | Specify u_time=1.0s anchor frame capture for WebP posters (≤80 KB) and persistent PosterLayer at z:0 for zero layout shift T1↔T3 transitions. |
| T-06-04 | Engineering Misinterpretation / Type Mismatch | TypeScript Handoff Contract | Low | mitigate | Export frozen spec constants and validation helper functions in `src/liquid/handoffSpec.ts` with 100% Vitest contract test coverage. |
</threat_model>

<verification>
运行全量契约测试套件与 Vite 构建校验：
```bash
npx vitest run
npm run build
```
</verification>

<success_criteria>
1. 分层 z-stack 模型已文档化（海报 z:0 / canvas z:10 / UI z:30+ / 弹层 z:50），含 backdrop-filter 层叠上下文规则
2. 玻璃模糊预算已规定（模糊半径上限 ~12–16px、每屏 ≤2 个实时 backdrop-filter 面、@supports 实色兜底）
3. token→uniform 映射已规定（哪些主题 token 喂给 u_color/u_base/u_intensity/u_speed/u_warp），保证 shader 与海报同配色
4. 海报资源管线已定义（从 shader 锚定帧自动截取 → 主题化 WebP ≤80 KB），含 T1↔T3 无缝衔接要求
</success_criteria>

<output>
Create `.planning/phases/06-design-code-integration-spec/PLAN.md`
</output>
