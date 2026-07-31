# Phase 8 Research: SPECTRA Glass Liquid Card System

## Research Focus
对齐用户最新上传的两张参考图 (`image#1: Clipboard_Screenshot.png` 与 `image#2: 微信图片_20260730071836_144_120.png`) 的核心视觉诉求：
1. **摒弃旧版 t1 全屏深色液态底纹**：参考图并非全屏深色背景跑 WebGL，而是以极简、高质感浅色/微光 Studio 环境（`#F7F7FA`）为基础。
2. **补充 3D 玻璃边缘高光（Specular Rim Glow）**：卡片边缘缺乏高质感光学高光。需运用顶部 1.5px 高折射白描边 + 双重内发光（Inner Glow）+ 柔和悬浮阴影（Ambient Elevation Shadow），完全还原 3D 精细玻璃材质。
3. **卡片内嵌式 WebGL 动态液态（Card-Enclosed WebGL Liquid）**：液态渐变不能铺在整页底部，必须包裹在具体的 SPECTRA 胶囊卡片（Pill Card）内部，呈现为有机漫延、流体力学 Swirl/Domain Warp 的色彩场，并在卡片左侧与文字层相接处实现柔和渐变遮罩消隐（Soft Alpha Masking）。
4. **六大 SPECTRA 色彩主题矩阵**：
   - KLEIN（克莱因蓝 + 深深蓝墨旋涡，匹配放大卡片参考图 1）
   - ORIGINAL（柔橘粉 + 阳光黄）
   - OCEAN（皇家蓝 + 湖蓝 + 湛蓝）
   - ULTRAVIOLET（紫罗兰 + 浅紫 + 柠檬绿）
   - CHROME（钛银 + 深灰烟雾）
   - PLUS（珊瑚红 + 暖琥珀 + 亮金）

## Architecture Decision
- **`SpectraCard.tsx`**：封装单个 SPECTRA 胶囊卡片，内含 Left Glass Typographic Overlay + Right WebGL Fluid Canvas + Glass Edge Specular Highlight overlay。
- **`cardShader.ts`**：专为卡片小尺寸（~380x110）设计的 GLSL 3D Simplex FBM Domain Warp 着色器，具备 4 色调色板 + 左侧 Alpha blend 渐变遮罩。
- **`spectraGlass.css`**：精准定义 3D Glass Specular Rim（`box-shadow: inset 1px 1px 1px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(0,0,0,0.05), 0 16px 40px -10px rgba(0,0,0,0.08)`）。
- **`spectra-demo.html`**：自包含的原生 WebGL2/WebGL1 SPECTRA 6-Card Studio 展示页，供用户通过 `present_files` 立即预览校验。
