# 灵犀 Nexus — 设计到代码集成规范 (Design-to-Code Integration Spec)

> **版本 (Version):** 1.0  
> **适用对象 (Target):** 前端架构师、UI 工程师、组件库维护者  
> **核心目标:** 规范 WebGL 动态液态与毛玻璃 UI 的层叠模型、性能预算、主题映射与降级管线，保障生产落地忠实度与帧率稳定。

---

## 目录 (Table of Contents)

1. [分层 Z-Stack 模型与层叠上下文卫生指南](#1-分层-z-stack-模型与层叠上下文卫生指南)
2. [毛玻璃 (Glassmorphism) 模糊预算与 @supports 降级](#2-毛玻璃-glassmorphism-模糊预算与-supports-降级)
3. [设计 Token 到 WebGL Uniform 映射契约](#3-设计-token-到-webgl-uniform-映射契约)
4. [静态海报资源管线与 T1 ↔ T3 降级衔接](#4-静态海报资源管线与-t1--t3-降级衔接)
5. [TypeScript 契约导出与组件集成范例](#5-typescript-契约导出与组件集成范例)

---

## 1. 分层 Z-Stack 模型与层叠上下文卫生指南

为了确保毛玻璃面板 (`backdrop-filter: blur()`) 能够正确采样并透出底层 WebGL 液态 Shader 动画，必须严格遵守五层 z-index 分层架构：

### 1.1 五层 Z-Stack 规范

| 层级名称 | `z-index` | DOM 节点 / 组件 | 描述与职责 |
|---|---|---|---|
| **Poster Floor** | `0` | `<PosterLayer/>` | 始终挂载的 CSS 5-radial-gradient 主题底层，保证零黑屏空洞 |
| **WebGL Canvas** | `10` | `<canvas class="liquid-canvas">` | 挂载至 `document.body` 根节点，`position: fixed; inset: 0; pointer-events: none` |
| **App UI & Glass Panels** | `30` | 页面 Shell、侧边栏、毛玻璃卡片 | 应用主界面与卡片，承载 `backdrop-filter: blur(12px-16px)` |
| **Modals & Overlays** | `50` | 对话框、抽屉、全局遮罩 | 弹出层 UI，浮于主界面之上 |
| **Toasts & Tooltips** | `100` | 全局通知、浮动提示、右键菜单 | 最顶层交互与消息提醒 |

### 1.2 层叠上下文 (Stacking Context) 卫生规则

> 🔴 **阻断级警示 (Critical Constraint)**:  
> WebGL Canvas 必须作为 `document.body` 的**直接子节点**挂载。在 Canvas 与 `body` 之间的祖先链条上，**绝对禁止**应用创建新层叠上下文的 CSS 属性，否则会导致 `backdrop-filter` 采样失效或被静默裁切。

必须拦截的 context-creating 属性列表：
- `transform` (非 `none`)
- `opacity` (小于 `1.0`)
- `will-change` (包含 `transform`/`opacity` 等)
- `filter` / `backdrop-filter` (非 `none`)
- `mask` / `clip-path`
- `perspective`
- `contain` (`paint`/`strict`/`content`)
- `isolation: isolate`
- `mix-blend-mode` (非 `normal`)

开发阶段引入 `checkStackingContext(canvas)` 自动守卫，如检测到违反上述规则的祖先节点，将在控制台抛出警告。

---

## 2. 毛玻璃 (Glassmorphism) 模糊预算与 @supports 降级

由于 `backdrop-filter: blur()` 需要对底层动态 WebGL 画布进行逐帧离屏采样，过高的模糊半径与过多重叠表面会引发集成 GPU 的严重性能衰减。

### 2.1 模糊半径与表面数量预算 (Blur Budget)

1. **标准卡片/面板**: 模糊半径上限为 **`12px` ~ `16px`**（默认推荐 `14px`）。
2. **Hero/登录焦点卡片**: 全屏单卡场景下允许提高至 **`24px` ~ `26px`**。
3. **单屏激活表面上限**: 每屏同时可见的 `backdrop-filter` 表面数量**不得超过 2 个**。超出部分必须回退为高透明度实色背景 (`rgba(15, 15, 22, 0.85)`)。
4. **禁止玻璃重叠**: 严禁将一个毛玻璃卡片嵌套在另一个毛玻璃容器内部。

### 2.2 CSS `@supports` 兜底方案

针对不支持 `backdrop-filter` 的旧版浏览器或低性能模式，必须提供实色兜底：

```css
/* 默认实色兜底 */
.glass-panel {
  background: rgba(15, 15, 22, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* 支持 backdrop-filter 时启用毛玻璃 */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
}
```

---

## 3. 设计 Token 到 WebGL Uniform 映射契约

全站调色板统一采用 CSS Custom Properties 与 TypeScript 对象联动管理，确保 Shader 热换肤时不发生 GLSL 重新编译。

### 3.1 Token 映射表

| 设计 Token (CSS Variable) | 类型 | 说明 | WebGL Uniform 映射 |
|---|---|---|---|
| `--liquid-color-1` | `#RRGGBB` | 色彩 1 (默认 紫 `#A78BFA`) | `u_color[0]` (`vec3`) |
| `--liquid-color-2` | `#RRGGBB` | 色彩 2 (默认 蓝 `#60A5FA`) | `u_color[1]` (`vec3`) |
| `--liquid-color-3` | `#RRGGBB` | 色彩 3 (默认 绿 `#4ADE80`) | `u_color[2]` (`vec3`) |
| `--liquid-color-4` | `#RRGGBB` | 色彩 4 (默认 珊瑚 `#FB7185`) | `u_color[3]` (`vec3`) |
| `--liquid-color-5` | `#RRGGBB` | 色彩 5 (默认 粉 `#F472B6`) | `u_color[4]` (`vec3`) |
| `--liquid-base` | `#RRGGBB` | 底色 (默认 `#0A0A0F`) | `u_base` (`vec3`) |
| `--liquid-intensity` | `0.0 - 1.0` | 色彩强度 (默认 `0.9`) | `u_intensity` (`float`) |
| `--liquid-speed` | `>= 0.0` | 动画速度 (默认 `0.05`) | `u_speed` (`float`) |
| `--liquid-warp` | `> 0.0` | 域扭曲强度 (默认 `2.0`) | `u_warp` (`float`) |

### 3.2 热换肤更新机制

通过 `themeToUniforms(theme)` 将 `#RRGGBB` 十六进制字符串转换为 0.0–1.0 的 `Float32Array`，通过 `gl.uniform3fv` 与 `gl.uniform1f` 直接更新 GPU 内存：
- **无 Shader 重编译**：不调用 `compileShader` / `linkProgram`。
- **热路径零开销**：`hexToVec3` 仅在主题属性变更时触发，每帧渲染循环内无任何字符串解析。

---

## 4. 静态海报资源管线与 T1 ↔ T3 降级衔接

为应对无 WebGL 支持、移动端低功耗模式或 `webglcontextlost` 上下文丢失场景，建立静态海报兜底管线：

1. **锚定帧截取 (Anchor Frame Capture)**:
   - WebGL Shader 在 `u_time = 1.0s` 时截取确定性静态帧，作为主题海报底图源文件。
2. **海报资源规格**:
   - 格式：WebP（质量 85%）
   - 分辨率：1920 × 1080
   - 文件体积上限：**`≤ 80 KB`**
3. **T1 ↔ T3 无缝衔接**:
   - `PosterLayer` 始终挂载在 `z:0`，层级与配色与 WebGL 画布保持 100% 视觉一致。
   - 当从 T1 (Full WebGL) 降级至 T3 (Poster) 时，Canvas 节点被卸载，`PosterLayer` 无缝暴露，画面**无跳变、无闪烁、无黑屏**。

---

## 5. TypeScript 契约导出与组件集成范例

生产代码中导出统一的常量与契约辅助工具 `src/liquid/handoffSpec.ts`：

```typescript
import {
  Z_INDEX_STACK,
  GLASS_BLUR_BUDGET,
  isValidBlurRadius,
  getBackdropFilterCSS,
} from './liquid';

// 组件集成示例
const glassPanelStyle = {
  position: 'relative' as const,
  zIndex: Z_INDEX_STACK.UI_GLASS_PANELS, // z: 30
  ...getBackdropFilterCSS(GLASS_BLUR_BUDGET.STANDARD_CARD_BLUR_PX), // 14px blur with @supports fallback
};
```
