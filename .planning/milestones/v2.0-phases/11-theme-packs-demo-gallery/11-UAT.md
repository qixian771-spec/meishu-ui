---
status: passed
phase: 11-theme-packs-demo-gallery
source: [PLAN.md, 11-01-PLAN.md, 11-02-PLAN.md]
started: 2026-07-31T17:15:00Z
updated: 2026-07-31T17:15:00Z
mode: self-run
---

## Current Test

number: —
name: —
expected: —
awaiting: none

## Tests

### 1. ≥4 套色调 · 整页同色相
expected: 切换色调后壳/窗格/内嵌同色相家族
result: pass
notes: |
  自跑：七套色（含中国红 cinnabar）在 ThemeSwitcher 可见；washHue + accentThemes 测试绿；
  浏览器当前 theme=ref123；切包写 localStorage 验证通过。

### 2. wash 仅为同色相深浅
expected: soft/mid/deep/glow/chrome 同色相档位
result: pass
notes: `src/glass/tokens/__tests__/washHue.test.ts` pass

### 3. 选择可持久化
expected: localStorage `lingxi-accent-theme` 读写生效
result: pass
notes: 浏览器 Runtime.evaluate 写入 amber 成功并恢复

### 4. 示例组合叙事（非产品）
expected: 画廊首页非产品承诺；sample 路由有免责标注
result: pass
notes: |
  GalleryPage 文案「七套色」；SampleBanner「示例组合 · 仅演示…非产品功能」；
  gallery.test.tsx 覆盖 banner；首页无 sample-banner（正确）。

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0
