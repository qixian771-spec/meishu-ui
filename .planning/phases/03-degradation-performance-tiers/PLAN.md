---
phase: 03-degradation-performance-tiers
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/liquid/PosterLayer.tsx
  - src/liquid/LiquidCanvas.ts
  - src/liquid/QualityGovernor.ts
  - src/liquid/tierResolver.ts
  - src/liquid/LiquidBackground.tsx
  - src/liquid/types.ts
  - src/liquid/index.ts
  - src/App.tsx
  - src/liquid/__tests__/PosterLayer.test.tsx
  - src/liquid/__tests__/visibility.test.ts
  - src/liquid/__tests__/QualityGovernor.test.ts
  - src/liquid/__tests__/tierResolver.test.ts
  - src/liquid/__tests__/LiquidBackground.test.tsx
autonomous: true
requirements:
  - VISUAL-03
user_setup: []

must_haves:
  truths:
    # SC1
    - "在低端/集成 GPU 上液态能根据渲染耗时自动缩放分辨率 (DPR 上限 ≤ 1.5, qualityScale 1.0 → 0.75 → 0.5)，避免 GPU 过热节流"
    # SC2
    - "标签页隐藏 (visibilitychange) 时 rAF 循环立即取消，恢复时使用 accumulatedPauseTime 计算时间偏移，连续平滑恢复动画且无时间跳变伪影"
    # SC3
    - "z:0 层始终挂载由 LiquidTheme 驱动的 PosterLayer 静态海报底图，在 WebGL 上下文丢失或降级至 T3 时永远不出现黑色空洞与布局位移"
    # SC4
    - "LiquidBackground 组件基于运行时能力检测 (WebGL 可用性、saveData、hardwareConcurrency) 自动解析并初始化质量分级 (T1 / T2 / T3)"
  artifacts:
    - "src/liquid/PosterLayer.tsx — 主题驱动的 z:0 静态海报兜底组件"
    - "src/liquid/QualityGovernor.ts — 基于 60 帧滑动窗口与滞后 (hysteresis) 的自适应质量调优引擎"
    - "src/liquid/tierResolver.ts — 纯函数运行时能力检测与初始分级解析器"
    - "src/liquid/LiquidCanvas.ts — 增强版 WebGL 引擎，包含 visibility 监听、时间偏移恢复与 setQualityScale 分辨率缩放"
    - "src/liquid/LiquidBackground.tsx — 整合 PosterLayer、QualityGovernor 与 T1/T2/T3 级联控制的 React 生产组件"
    - "src/App.tsx — 更新后的开发者 Harness，包含分级手动切换与 GPU 延迟/Visibility 模拟控制"
    - "src/liquid/__tests__/*.test.ts(x) — Phase 3 完整契约单元与组件测试套件"
  key_links:
    - "PosterLayer 以 fixed z:0 始终置底于 LiquidCanvas (z:10) 下方"
    - "LiquidCanvas 响应 visibilitychange 事件计算 accumulatedPauseTime"
    - "QualityGovernor 触发 setQualityScale 回调调整 gl.viewport 与 u_res uniform"
    - "tierResolver 评估 WebGL/saveData/hardwareConcurrency 返回 T1/T2/T3"
---

<objective>
为 `LiquidCanvas` WebGL 引擎与 `<LiquidBackground/>` 生产组件建立完整的多级性能降级、帧率门控与海报兜底机制 (Phase 3: VISUAL-03)。

**Purpose:** 保障液态动态背景在低端 GPU、集成显卡以及后台标签页中流畅高效运行，防止设备发热节流与电池过度消耗；在 WebGL 不可用或上下文丢失时，以主题化静态海报 (z:0) 保证画面永不出黑屏空洞。

**Output:** `PosterLayer.tsx` (海报底图)、`QualityGovernor.ts` (滑动窗口调优器)、`tierResolver.ts` (能力检测解析器)、增强的 `LiquidCanvas.ts` 与 `<LiquidBackground/>`，以及完整的 Vitest 契约测试与 Dev Harness 控制面板。
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/03-degradation-performance-tiers/RESEARCH.md
@src/liquid/LiquidCanvas.ts
@src/liquid/LiquidBackground.tsx
@src/liquid/types.ts
@src/liquid/themeBridge.ts
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 实现主题驱动的 Persistent PosterLayer (z:0 Floor) 组件</name>
  <files>src/liquid/PosterLayer.tsx, src/liquid/types.ts, src/liquid/index.ts, src/liquid/__tests__/PosterLayer.test.tsx</files>
  <behavior>
    - PosterLayer 接受 LiquidTheme 属性，以 fixed fixed inset:0 z:0 渲染静态 HTML/CSS 结构
    - 使用 theme.base 作为 backgroundColor，并基于 theme.colors (5色) 生成多层 radial-gradient CSS 背景
    - 在零 WebGL 支持或组件挂载初期即刻渲染，确保视觉底面永远非黑且零布局位移
  </behavior>
  <action>
    1. 在 `src/liquid/types.ts` 中补充 `PosterLayerProps` 接口类型。
    2. 创建 `src/liquid/PosterLayer.tsx` 组件：
       - 设置样式 `position: 'fixed'`, `inset: 0`, `zIndex: 0`, `pointerEvents: 'none'`, `backgroundColor: theme.base`。
       - 从 `theme.colors` 提取 5 个配色，构建 5 个柔和径向渐变 (`radial-gradient`) 光团 (匹配 `LiquidTheme` 调色板)，混合模式为 `screen`。
       - 包含 class 类名 `liquid-poster-floor`。
    3. 在 `src/liquid/index.ts` 中导出 `PosterLayer` 组件与其类型。
    4. 编写 `src/liquid/__tests__/PosterLayer.test.tsx` 单元测试，校验样式注入、z-index 0 属性与渐变生成。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/PosterLayer.test.tsx</automated>
  </verify>
  <done>PosterLayer 组件能根据 LiquidTheme 属性渲染 z:0 径向渐变静态海报，无 WebGL 依赖，并通过自动化测试。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: LiquidCanvas rAF Page Visibility 门控与无缝时间偏移恢复</name>
  <files>src/liquid/LiquidCanvas.ts, src/liquid/__tests__/visibility.test.ts</files>
  <behavior>
    - 绑定 document visibilitychange 事件监听
    - 当 document.hidden 为 true 时自动调用 pauseAnimation() 取消 rAF 循环并记录 pausedAt 时间戳
    - 当 document.hidden 为 false 时调用 resumeAnimation()，计算 accumulatedPauseTime += performance.now() - pausedAt
    - 在 renderOnce() 计算动画时间 t = (now - startT - accumulatedPauseTime) / 1000.0，避免标签页恢复时产生瞬移跳变
  </behavior>
  <action>
    1. 在 `LiquidCanvas.ts` 中新增内部私有变量：`pausedAt: number = 0`，`accumulatedPauseTime: number = 0`。
    2. 实现 `bindVisibilityListener()` 与 `unbindVisibilityListener()` 方法，并在构造函数与 `dispose()` 中挂载/解绑 `visibilitychange` 事件监听。
    3. 实现 `pauseAnimation()` 与 `resumeAnimation()`：
       - `pauseAnimation()`: 记录 `pausedAt = performance.now()` 并执行 `stop()`。
       - `resumeAnimation()`: 校验 `pausedAt > 0`，累加 `accumulatedPauseTime += (performance.now() - pausedAt)`，清空 `pausedAt` 并重启 `start()`。
    4. 更新 `renderOnce(time?: number)`:
       - 动画有效时间计算公式更新为 `const t = time ?? (performance.now() - this.startT - this.accumulatedPauseTime) / 1000.0`。
    5. 编写 `src/liquid/__tests__/visibility.test.ts` 测试，模拟 `visibilitychange` 事件触发并断言时间偏移连续性与 rAF 取消。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/visibility.test.ts</automated>
  </verify>
  <done>LiquidCanvas 在切后台时立即停止 rAF，在���回前台时平滑恢复动画且无 noise 时间跳变伪影。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现 60 帧滑动窗口 QualityGovernor 引擎与动态分辨率缩放</name>
  <files>src/liquid/QualityGovernor.ts, src/liquid/LiquidCanvas.ts, src/liquid/types.ts, src/liquid/__tests__/QualityGovernor.test.ts</files>
  <behavior>
    - QualityGovernor 维护 60 帧的滑动渲染耗时采样数组
    - 当平均每帧渲染耗时 > 20ms 且持续超过 2000ms 时，逐步降低 qualityScale (1.0 -> 0.75 -> 0.5)
    - 在 qualityScale 已为 0.5 且耗时依然 > 25ms 时，触发 onDowngradeTier('T2') 降级回调
    - 带有 5000ms 持续 < 12ms 的滞后 (hysteresis) 回升机制，防止频率震荡
    - LiquidCanvas.setQualityScale(scale) 计算渲染缓冲区尺寸 w = clientW * dpr * qualityScale，并更新 gl.viewport 与 u_res uniform
  </behavior>
  <action>
    1. 在 `src/liquid/types.ts` 中定义 `QualityGovernorOptions` 接口。
    2. 创建 `src/liquid/QualityGovernor.ts`:
       - 实现 `recordFrame(now: number)` 收集帧间隔 delta。
       - 计算 60 帧平均耗时 `avgDelta`。
       - 如果 `avgDelta > 20ms` 且持续 2 秒，触发 `stepQuality(0.75)` 或 `stepQuality(0.5)`；若在 0.5 仍过载，触发 `onDowngradeTier('T2')`。
       - 如果 `avgDelta < 12ms` 且持续 5 秒，允许回升 `qualityScale`。
    3. 扩展 `src/liquid/LiquidCanvas.ts`:
       - 添加 `qualityScale` 字段 (默认 1.0)。
       - 实现 `setQualityScale(scale: number)` 方法，限制在 [0.5, 1.0] 范围内，变更时重新计算 canvas 画布分辨率 `w = clientW * dpr * scale` 并调用 `gl.viewport(0, 0, w, h)` 与 `u_res` uniform 更新。
    4. 编写 `src/liquid/__tests__/QualityGovernor.test.ts` 单元测试，验证滑动窗口阶梯降级与 hysteresis 恢复逻辑。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/QualityGovernor.test.ts</automated>
  </verify>
  <done>QualityGovernor 准确监控渲染性能并在低端 GPU 上平滑降低质量与分辨率，带滞后保护且可触发 T2 降级。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: 运行时能力检测 tierResolver 与整合型 LiquidBackground 质量控制器</name>
  <files>src/liquid/tierResolver.ts, src/liquid/LiquidBackground.tsx, src/liquid/types.ts, src/liquid/index.ts, src/liquid/__tests__/tierResolver.test.ts, src/liquid/__tests__/LiquidBackground.test.tsx</files>
  <behavior>
    - tierResolver.ts 提供 resolveInitialTier() 纯函数，检测 WebGL 上下文、navigator.connection.saveData 与 navigator.hardwareConcurrency (<= 2) 确定初始 T1/T2/T3
    - LiquidBackground 整合 PosterLayer (z:0) 与 LiquidCanvas (z:10)，持久挂载 z:0 底图
    - 当 tier 为 T1 时开启全量动画与 QualityGovernor 动态调优
    - 当 tier 为 T2 时仅调用 LiquidCanvas.renderOnce(1.0) 绘制单帧冻结画面并关闭 rAF
    - 当 tier 为 T3 时卸载 WebGL Canvas，仅由 PosterLayer 兜底
    - WebGL 初始化失败或 context lost 时自动优雅降级至 T3
  </behavior>
  <action>
    1. 在 `src/liquid/types.ts` 中定义 `QualityTier = 'T1' | 'T2' | 'T3'` 及增强版 `LiquidBackgroundProps`。
    2. 创建 `src/liquid/tierResolver.ts`:
       - 检查 WebGL 是否支持 / saveData 模式 -> 返回 'T3'。
       - 检查 `hardwareConcurrency <= 2` -> 返回 'T2'。
       - 默认健康硬件 -> 返回 'T1'。
    3. 重构 `src/liquid/LiquidBackground.tsx`:
       - 管理 `tier` state (`forcedTier ?? resolveInitialTier()`)。
       - 永远渲染 `<PosterLayer theme={theme} />` 于底层 z:0。
       - 仅在 `tier !== 'T3'` 时通过 Portal 挂载 `<canvas>` 于 z:10。
       - `T1` 模式下创建 `QualityGovernor` 并在每帧通过 engine.setQualityScale 驱动缩放。
       - `T2` 模式下创建 engine，执行 `renderOnce(1.0)` 后保持停止，0% CPU/GPU 循环开销。
       - 捕捉 `onError` 与 `webglcontextlost` 事件，自动将状态降级为 `T3`。
    4. 导出 `tierResolver` 与类型于 `src/liquid/index.ts`。
    5. 编写 `src/liquid/__tests__/tierResolver.test.ts` 与 `src/liquid/__tests__/LiquidBackground.test.tsx` 组件集成测试。
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/tierResolver.test.ts src/liquid/__tests__/LiquidBackground.test.tsx</automated>
  </verify>
  <done>LiquidBackground 端到端支持 T1/T2/T3 级联降级、能力检测、海报兜底与 Context Loss 降级防护。</done>
</task>

<task type="auto">
  <name>Task 5: 更新 Demo Harness Control Panel (App.tsx) 支持 Phase 3 分级与模拟调试</name>
  <files>src/App.tsx</files>
  <action>
    1. 在 `src/App.tsx` 的浮动玻璃面板中添加 Phase 3 调试面板 controls：
       - Tier 切换按钮组: `Auto (Default)`, `T1 Full WebGL`, `T2 Frozen Frame`, `T3 Static Poster`。
       - 性能与降级状态指示器: 实时显示当前 Tier (`T1`/`T2`/`T3`) 与质量比例 (`qualityScale`)。
       - 模拟功能按钮: "模拟 GPU 卡顿/延迟" (在后台运行耗时任务) 与 "模拟标签页切后台 (Visibility Hide/Show)"。
    2. 绑定 `LiquidBackground` 的 `forcedTier` 与 `onTierChange` 回调。
    3. 确保 App 界面在任何 Tier 下均美观可用，且控制面板与背景层级隔离开。
  </action>
  <verify>
    <automated>npx vitest run</automated>
  </verify>
  <done>App.tsx 提供直观的 Phase 3 降级与性能分级调试控制面板。</done>
</task>

<task type="auto">
  <name>Task 6: Phase 3 完整契约单元与组件测试套件</name>
  <files>src/liquid/__tests__/PosterLayer.test.tsx, src/liquid/__tests__/visibility.test.ts, src/liquid/__tests__/QualityGovernor.test.ts, src/liquid/__tests__/tierResolver.test.ts, src/liquid/__tests__/LiquidBackground.test.tsx</files>
  <action>
    1. 完善并运行 Phase 3 所有的 Vitest 契约测试用例。
    2. 校验补齐边界用例：
       - `PosterLayer.test.tsx`: 检验 z:0 渐变渲染、主题色彩传递。
       - `visibility.test.ts`: 检验 visibilitychange 取消/重启 rAF，时间戳差值累加无跳变。
       - `QualityGovernor.test.ts`: 检验 60 帧滑动窗口计算、1.0 -> 0.75 -> 0.5 降级、T2 降级触发及滞后恢复。
       - `tierResolver.test.ts`: 检验 WebGL 丢失、saveData、低核心 CPU 各种条件分支。
       - `LiquidBackground.test.tsx`: 检验 T1/T2/T3 组件渲染分支与 WebGL 异常优雅降级。
  </action>
  <verify>
    <automated>npx vitest run</automated>
  </verify>
  <done>Vitest 全套测试用例通过率 100%，覆盖 Phase 3 的所有性能与降级分支。</done>
</task>

<task type="auto">
  <name>Task 7: Phase 3 综合门控校验 (Automated Suite + Visual QA)</name>
  <files>src/liquid/LiquidCanvas.ts, src/liquid/LiquidBackground.tsx, src/liquid/PosterLayer.tsx, src/liquid/QualityGovernor.tsx, src/App.tsx</files>
  <action>
    1. 运行 `npx vitest run` 验证全量单元测��与组件测试无遗漏且 100% 通过。
    2. 运行 `npm run build` 确保 TypeScript 编译无类型报错，Vite 构建产物无警告。
    3. 执行 VISUAL-03 4 项成功标准（Success Criteria）校验：
       - SC1: 低端 GPU 上 DPR 限制 ≤ 1.5 且 qualityScale (1.0->0.75->0.5) 正常缩放。
       - SC2: 切换标签页隐藏时 rAF 暂停，切回时连续平滑恢复，无动画跳变。
       - SC3: z:0 PosterLayer 静态底图持续存在，降级到 T3 或 Context Loss 时黑屏率 0%。
       - SC4: 基于运行时能力的初始 Tier 自动解析机制精准运作。
  </action>
  <verify>
    <automated>npx vitest run && npm run build</automated>
  </verify>
  <done>Phase 3 降级与性能分级策略全量验证完毕，契约套件与 Vite 构建全部顺利通过。</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser Runtime → WebGL Canvas Context | Untrusted GPU driver state, potential context loss or memory limit breaches. |
| rAF Loop → Main UI Thread | High frame render cost can block main thread, cause thermal throttling and battery drain. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-03-01 | Denial of Service (GPU/Battery Exhaustion) | `LiquidCanvas` rAF loop | High | mitigate | Implement `visibilitychange` listener to immediately cancel rAF when tab is hidden. |
| T-03-02 | Denial of Service (Thermal Throttling) | `LiquidCanvas` Viewport | High | mitigate | `QualityGovernor` monitors 60-frame rolling window and dynamically scales `qualityScale` down to 0.5 with DPR capping. |
| T-03-03 | Denial of Service (Black Hole Void on Context Loss) | Canvas DOM Container | Medium | mitigate | Persistent `PosterLayer` at z:0 driven by theme tokens guarantees instant themed background if WebGL fails or context is lost. |
</threat_model>

<verification>
运行全量测试套件与 Vite 构建校验：
```bash
npx vitest run
npm run build
```
</verification>

<success_criteria>
1. 低端/集成 GPU 上自动缩放分辨率 (DPR 上限 ≤1.5，qualityScale 1.0→0.75→0.5)，无热节流崩溃。
2. 标签页隐藏时 (visibilitychange) rAF 循环被取消，恢复时使用累加时间偏移恢复，无时间跳变伪影。
3. z:0 始终存在主题化静态海报 PosterLayer，canvas 关闭/降级/Context Loss 时不出现黑色空洞且无布局位移。
4. 质量分级基于运行时能力检测 (GPU/WebGL 分级 / save-data / 硬件核心数) 自动选择初始 Tier (T1/T2/T3)。
</success_criteria>

<output>
Create `.planning/phases/03-degradation-performance-tiers/PLAN.md`
</output>
