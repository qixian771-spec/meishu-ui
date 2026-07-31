---
phase: 04-accessibility-no-webgl-fallback
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/liquid/tierResolver.ts
  - src/liquid/LiquidBackground.tsx
  - src/liquid/PosterLayer.tsx
  - src/liquid/LiquidCanvas.ts
  - src/liquid/types.ts
  - src/liquid/index.ts
  - src/App.tsx
  - src/liquid/__tests__/reducedMotion.test.ts
  - src/liquid/__tests__/contextLoss.test.ts
  - src/liquid/__tests__/observability.test.tsx
  - src/liquid/__tests__/shaderPrecision.test.ts
autonomous: true
requirements:
  - VISUAL-04
user_setup: []

must_haves:
  truths:
    - "开启 prefers-reduced-motion 时液态仅渲染一帧静态画面并停止动画循环（无持续运动），且偏好变化时实时响应"
    - "无 WebGL（或 WebGL 上下文丢失）的设备/浏览器上展示主题化静态海报（T3），无黑屏、无破画布伪影"
    - "降级链路端到端可观测（T1 动画 → T2 冻结 → T3 海报），DOM 元素标注 data-tier，每一级均非黑且配色一致"
    - "shader 精度安全处理（尝试 highp，失败回退 mediump GLSL 重新链接），老旧/移动 GPU 不黑屏"
  artifacts:
    - "src/liquid/tierResolver.ts — 增强版初始 Tier 解析器（集成 prefers-reduced-motion 检测）"
    - "src/liquid/LiquidBackground.tsx — 包含 matchMedia 实时监听与 context loss 的降级 Tier 控制组件"
    - "src/liquid/PosterLayer.tsx — 支持 data-tier 属性的可观测静态海报层"
    - "src/liquid/LiquidCanvas.ts — WebGL1 highp->mediump 精度回退与 context lost 事件处理"
    - "src/App.tsx — 支持 reduced motion 模拟与 data-tier Badge 的开发者 Harness"
    - "src/liquid/__tests__/*.test.ts(x) — Phase 4 完整 Vitest 契约测试套件"
  key_links:
    - "window.matchMedia('(prefers-reduced-motion: reduce)') 触发 LiquidBackground 中的 activeTier 动态切换 (T1 <-> T2)"
    - "webglcontextlost 事件与 WebGL 创建失败捕获后触发 LiquidBackground handleContextError，将 activeTier 设为 T3 并卸载 canvas"
    - "PosterLayer 与 Portal canvas DOM 节点均标注 data-tier={activeTier}，并触发 onTierChange 回调"
    - "LiquidCanvas.initProgram() 在 WebGL1 编译/链接失败时，自动将 highp 替换为 mediump 并重新链接"
---

<objective>
为 `LiquidCanvas` WebGL 引擎、`tierResolver.ts` 与 `<LiquidBackground/>` 生产组件实现无障碍与无 WebGL / Context Loss 优雅降级 (Phase 4: VISUAL-04)。

**Purpose:** 满足 WCAG 2.2.2 规范，尊重系统 `prefers-reduced-motion` 运动偏好并在偏好切换时实时响应；在 WebGL 不可用或运行期 GPU context lost 时优雅降级至主题化静态海报 (T3) 并且卸载 Canvas，保证零黑屏、零破画布伪影；暴露端到端 DOM 可观测性 (`data-tier`)；保障老旧/移动 GPU Shader 精度安全 (`highp` -> `mediump`)。

**Output:** `tierResolver.ts` (集成 reduced motion 检测)、`LiquidBackground.tsx` (集成 `matchMedia` 监听与 WebGL Context Error 兜底)、`PosterLayer.tsx` (支持 `data-tier` DOM 属性)、`LiquidCanvas.ts` (Shader 精度安全降级与 context lost 处理)、`App.tsx` (新增 reduced motion 模拟切换与 data-tier 徽章)，以及全新的 4 个 Vitest 契约测试文件。
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-accessibility-no-webgl-fallback/RESEARCH.md
@src/liquid/LiquidCanvas.ts
@src/liquid/LiquidBackground.tsx
@src/liquid/tierResolver.ts
@src/liquid/PosterLayer.tsx
@src/liquid/types.ts
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 集成 prefers-reduced-motion 初始检测与动态 matchMedia 监听器 (SC1)</name>
  <files>src/liquid/tierResolver.ts, src/liquid/LiquidBackground.tsx, src/liquid/__tests__/reducedMotion.test.ts</files>
  <behavior>
    - resolveInitialTier() 检测 window.matchMedia('(prefers-reduced-motion: reduce)').matches，为 true 时初始返回 'T2'，满足 WCAG 2.2.2
    - LiquidBackground 增加 useEffect 动态订阅 window.matchMedia('(prefers-reduced-motion: reduce)') 的 change 事件
    - 当 matches == true 时，设置 activeTier = 'T2'，动画停止，渲染 1 帧静态画面（0% 持续 CPU/GPU 开销）
    - 当 matches == false 时，恢复 activeTier = resolveInitialTier()
    - 若显式传入 tier prop 覆写，matchMedia 监听器不覆盖 prop 设定
    - 兼容 addEventListener/removeEventListener 与 Safari/旧引擎 addListener/removeListener
  </behavior>
  <action>
    1. 修改 `src/liquid/tierResolver.ts`：在 `resolveInitialTier()` 中加入 `prefers-reduced-motion` 匹配检查，命中时返回 `'T2'`。
    2. 修改 `src/liquid/LiquidBackground.tsx`：在组件中添加 `useEffect` 监听 `(prefers-reduced-motion: reduce)`。包含辅助分支，兼容 `addEventListener` 与 `addListener`。当 `tierProp === undefined` 时，根据 `e.matches` 动态更新 `setActiveTier('T2')` 或 `setActiveTier(resolveInitialTier())`。
    3. 编写 `src/liquid/__tests__/reducedMotion.test.ts`：使用 Vitest 模拟 `window.matchMedia` matches 为 true，断言 `resolveInitialTier()` 返回 `'T2'`；模拟 change 事件触发，断言 `LiquidBackground` 内部 `activeTier` 在 T1 与 T2 之间切换。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/reducedMotion.test.ts</automated>
  </verify>
  <done>prefers-reduced-motion 初始与动态切换能精准控制 Tier (T1 <-> T2)，停止动画循环且零 CPU/GPU 开销，通过自动化测试。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: 实现 WebGL 创建失败与 webglcontextlost 自动降级至 T3 并安全卸载 Canvas (SC2)</name>
  <files>src/liquid/LiquidCanvas.ts, src/liquid/LiquidBackground.tsx, src/liquid/__tests__/contextLoss.test.ts</files>
  <behavior>
    - LiquidCanvas 在 WebGL 上下文丢失事件 webglcontextlost 触发时，执行 preventDefault() 并调用 onError?.(new Error('WebGL context lost'))
    - LiquidBackground 捕获 handleContextError 与 WebGL 初始化失败，将 activeTier 设为 'T3'
    - 当 activeTier === 'T3' 时，LiquidBackground 自动调用 engine.dispose() 并把 WebGL canvas DOM 节点从 DOM 中卸载
    - 始终保留 PosterLayer 在 z:0 层展现主题化静态海报底图，保证画面永不黑屏、永无破坏性伪影
  </behavior>
  <action>
    1. 检查与完善 `src/liquid/LiquidCanvas.ts`：确保 `onContextLost` 回调调用 `this.stop()` 与 `this.onError?.(new Error('WebGL context lost'))`；在 `dispose()` 中清除监听器并销毁 GL 资源。
    2. 完善 `src/liquid/LiquidBackground.tsx`：`handleContextError` 被触发时，同时调用 `onError?.(e)` 并将 `setActiveTier('T3')`；确保在 `activeTier === 'T3'` 时 canvas 节点被卸载，同时 `PosterLayer` 依然渲染。
    3. 编写 `src/liquid/__tests__/contextLoss.test.ts`：测试 WebGL 不可用或创建上下文返回 null 时，`LiquidBackground` 优雅渲染 PosterLayer 且 canvas 节点不存在（T3 模式）；测试运行期触发 `webglcontextlost` 事件时，`onError` 被调用且 `activeTier` 转换为 `'T3'`，canvas 节点被移除。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/contextLoss.test.ts</automated>
  </verify>
  <done>WebGL 上下文丢失或创建失败时组件自动降级至 T3，PosterLayer 无缝兜底永不黑屏，Canvas 被安全卸载。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 建立端到端降级链路可观测性 (data-tier DOM 属性与 onTierChange 回调) (SC3)</name>
  <files>src/liquid/PosterLayer.tsx, src/liquid/LiquidBackground.tsx, src/liquid/__tests__/observability.test.tsx</files>
  <behavior>
    - PosterLayer 接收 optional tier?: QualityTier 属性（默认 'T3'），并将其渲染为 DOM 节点的 data-tier={tier} 属性
    - LiquidBackground 将当前的 activeTier (T1 | T2 | T3) 传递给 PosterLayer
    - 若 activeTier !== 'T3'，挂载在 body 的 canvas 节点同样标注 data-tier={activeTier}
    - LiquidBackground 在 activeTier 发生变化时始终触发 onTierChange?.(activeTier) 回调
    - 测试套件与 DOM 检查工具可以直接通过 element.getAttribute('data-tier') 读取当前系统的质量层级
  </behavior>
  <action>
    1. 修改 `src/liquid/PosterLayer.tsx`：在 `PosterLayerProps` 中新增 `tier?: QualityTier`；在根 div 节点上添加 `data-tier={tier}` 属性。
    2. 修改 `src/liquid/LiquidBackground.tsx`：将 `tier={activeTier}` 传给 `<PosterLayer theme={theme} className={className} tier={activeTier} />`；在 Portal 渲染的 canvas 节点上添加 `data-tier={activeTier}`。
    3. 编写 `src/liquid/__tests__/observability.test.tsx`：渲染 `LiquidBackground` 处于 T1、T2、T3 等不同层级，断言 DOM 中的 `data-tier` 属性与其严格一致；验证 `onTierChange` 回调在层级切换时被正确调用并传回最新的 `QualityTier`。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/observability.test.tsx</automated>
  </verify>
  <done>PosterLayer 和 Canvas DOM 节点包含 data-tier 标记，onTierChange 准确分发，降级链路完全透明可观测。</done>
</task>

<task type="auto">
  <name>Task 4: 更新 App.tsx 开发者 Harness (包含 reduced motion 模拟开关与 data-tier 视觉徽章) (SC1, SC2, SC3)</name>
  <files>src/App.tsx</files>
  <action>
    1. 修改 `src/App.tsx`：在状态中新增 `simulateReducedMotion: boolean` 模拟开关。
    2. 当 `simulateReducedMotion` 为 true 时，向 `<LiquidBackground/>` 传递 `tier="T2"` 或模拟偏好生效。
    3. 在浮动控制面板的 Quality Tier 行旁更新视觉 Badge，显示当前 `activeTier` (T1 / T2 / T3) 以及 `data-tier` 状态。
    4. 增加 "Simulate Context Loss / WebGL Error" 模拟测试按钮（通过 `tierOverride="T3"` 或触发 error）。
    5. 更新副标题说明："Phase 4 Accessibility & No-WebGL Fallback · prefers-reduced-motion 冻结单帧 · WebGL Context Loss 降级 · data-tier 可观测"。
  </action>
  <verify>
    <automated>npx vitest run</automated>
  </verify>
  <done>App.tsx 包含直观的 Phase 4 调试开关（Reduced Motion 模拟、Context Loss 模拟）与 data-tier 指示徽章。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 5: 编写 WebGL1 highp -> mediump 精度安全回退与 Phase 4 Vitest 契约测试套件 (SC1, SC2, SC3, SC4)</name>
  <files>src/liquid/LiquidCanvas.ts, src/liquid/__tests__/shaderPrecision.test.ts</files>
  <behavior>
    - LiquidCanvas 在 initProgram() 中，首先尝试使用带有 precision highp float; 的 fragment shader 编译链接
    - 如果在 WebGL1 环境下 link() 返回 null 或失败，提取 fragSrc 并进行字符串替换 .replace('precision highp float;', 'precision mediump float;') 重新编译链接
    - 若重新链接成功，继续运行引擎（老旧/移动端 WebGL1 设备不黑屏）；若仍失败则触发 onError 并进入 T3
  </behavior>
  <action>
    1. 检查并补全 `src/liquid/LiquidCanvas.ts` 中的 `highp` -> `mediump` 回退逻辑：确认在 `!prog && !this.isWebGL2` 分支下执行 `precision mediump float;` 替换与 `link(vs, fsMed)`。
    2. 编写 `src/liquid/__tests__/shaderPrecision.test.ts`：使用 Vitest 模拟 `gl.getProgramParameter(prog, gl.LINK_STATUS)` 第一次返回 false (highp 失败)，第二次返回 true (mediump 成功)；断言 `LiquidCanvas` 在 WebGL1 下成功自动尝试降级为 `mediump` 并完成链接；模拟两次均失败，断言触发 `onError` 回调。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/shaderPrecision.test.ts</automated>
  </verify>
  <done>WebGL1 Shader 精度安全降级机制由测试全量覆盖，保证移动端/老旧 GPU 永远不呈现黑屏。</done>
</task>

<task type="auto">
  <name>Task 6: Phase 4 综合门控校验 (Automated Contract Suite + Vite Build) (SC1, SC2, SC3, SC4)</name>
  <files>src/liquid/tierResolver.ts, src/liquid/LiquidBackground.tsx, src/liquid/PosterLayer.tsx, src/liquid/LiquidCanvas.ts, src/App.tsx</files>
  <action>
    1. 运行 `npx vitest run` 验证全量 13 个 Vitest 测试套件全部 100% 通过（包含 Phase 4 新建的 4 个测试文件）。
    2. 运行 `npm run build` 验证 TypeScript 类型检查与 Vite 打包顺利通过，无报错无警告。
    3. 对照 SC1 ~ SC4 逐项确认：
       - SC1: prefers-reduced-motion 启用时仅渲染 1 帧 T2 并停止动画，matchMedia 动态切换实时响应。
       - SC2: 无 WebGL 或 WebGL context lost 时展示 T3 主题化静态海报，无黑屏无破画布。
       - SC3: 降级链路全过程由 DOM data-tier 属性与 onTierChange 回调可观测。
       - SC4: WebGL1 highp 失败时自动降级为 mediump 重链 Shader，不黑屏。
  </action>
  <verify>
    <automated>npx vitest run && npm run build</automated>
  </verify>
  <done>Phase 4 所有的功能开发、契约测试、安全降级与 Vite 构建均完美通过 verification gate。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| OS Accessibility Settings → Component State | Untrusted OS/browser animation preference changes crossing via matchMedia API. |
| GPU Driver State → WebGL Canvas Context | Hardware GPU context loss, driver crash, or memory exhaustion events. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-04-01 | Denial of Service / Accessibility Violation | `LiquidBackground` & `tierResolver` | High | mitigate | `window.matchMedia('(prefers-reduced-motion: reduce)')` forces activeTier to 'T2', halting continuous rAF loop (0% ongoing CPU/GPU). |
| T-04-02 | Denial of Service / Black Void on Context Loss | `LiquidCanvas` & `PosterLayer` | High | mitigate | `webglcontextlost` event triggers `onError` -> `setActiveTier('T3')`, unmounting `<canvas>` while persistent `<PosterLayer/>` at z:0 guarantees seamless themed floor rendering. |
| T-04-03 | Information Disclosure / Lack of Test Observability | `PosterLayer` & `<canvas>` DOM nodes | Low | mitigate | Annotate DOM nodes with `data-tier="T1"|"T2"|"T3"` attribute and invoke `onTierChange` callback. |
| T-04-04 | Denial of Service / Mobile GPU Black Screen | `LiquidCanvas.initProgram()` | Medium | mitigate | Fallback string replace from `precision highp float;` to `precision mediump float;` on WebGL1 link failure. |
</threat_model>

<verification>
运行全量契约测试套件与 Vite 构建校验：
```bash
npx vitest run
npm run build
```
</verification>

<success_criteria>
1. 开启 prefers-reduced-motion 时液态仅渲染一帧静态画面并停止动画循环（无持续运动），且偏好变化时实时响应
2. 无 WebGL（或 WebGL 上下文丢失）的设备/浏览器上展示主题化静态海报（T3），无黑屏、无破画布伪影
3. 降级链路端到端可观测（T1 动画 → T2 冻结 → T3 海报），DOM 元素标注 data-tier，每一级均非黑且配色一致
4. shader 精度安全处理（尝试 highp，失败回退 mediump GLSL 重新链接），老旧/移动 GPU 不黑屏
</success_criteria>

<output>
Create `.planning/phases/04-accessibility-no-webgl-fallback/PLAN.md`
</output>
