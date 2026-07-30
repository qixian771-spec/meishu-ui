---
phase: 07-cross-device-qa-reference-consistency
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/liquid/__tests__/crossDeviceQA.test.ts
  - docs/QA_REPORT.md
autonomous: true
requirements:
  - QA-01
must_haves:
  truths:
    - "Automated cross-device test suite verifies WebGL1/2 canary probing, precision fallback, tier transitions, and visibility pausing"
    - "Tier transitions T1->T2->T3 operate seamlessly with data-tier DOM observability and zero void background frames"
    - "Page Visibility API pause/resume cancels rAF loop on tab hide and resumes with accumulated time compensation"
    - "docs/QA_REPORT.md comprehensively documents Hardware Canary Matrix, Tier Transition E2E Drill Results, Performance & Thermal Audit, and Reference Alignment Audit"
    - "Full test suite (npx vitest run) and production build (npm run build) complete cleanly with zero errors"
  artifacts:
    - src/liquid/__tests__/crossDeviceQA.test.ts
    - docs/QA_REPORT.md
  key_links:
    - "crossDeviceQA.test.ts validates tierResolver.ts, LiquidCanvas.ts, QualityGovernor.ts, and LiquidBackground.tsx"
    - "docs/QA_REPORT.md summarizes milestone quality verification against reference imagery and performance budgets"
---

## Phase Goal

**As an** enterprise workspace desktop user, **I want to** verify the liquid + dark glass aesthetic system across target hardware profiles and reference designs with a seamless degradation fallback, **so that** the application runs reliably without GPU crashes or black frames on any hardware.

<objective>
Execute Phase 7 Cross-Device QA & Reference Consistency verification for 灵犀 Nexus (QA-01).

Purpose: Validate WebGL liquid engine and dark glassmorphism system across target hardware profiles (Desktop High-End, Integrated GPU, Mobile Canary WebGL1/mediump), exercise end-to-end degradation drills (T1 -> T2 -> T3), enforce performance and thermal frame budgets, and audit visual consistency against design reference imagery.
Output: Automated cross-device test suite (`src/liquid/__tests__/crossDeviceQA.test.ts`), milestone QA report (`docs/QA_REPORT.md`), and clean build verification (`npx vitest run && npm run build`).
</objective>

<execution_context>
@$HOME/.workbuddy/gsd-core/workflows/execute-plan.md
@$HOME/.workbuddy/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/phases/07-cross-device-qa-reference-consistency/RESEARCH.md
@docs/INTEGRATION_SPEC.md
@src/App.tsx
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create automated cross-device QA test suite (`crossDeviceQA.test.ts`)</name>
  <files>src/liquid/__tests__/crossDeviceQA.test.ts</files>
  <behavior>
    - Test 1: Hardware Canary Matrix Probing — verify tierResolver classifies WebGL2 multi-core systems as T1, reduced-motion as T2, and WebGL-unavailable as T3.
    - Test 2: WebGL1 mediump Shader Precision Fallback — verify shader compilation logic catches highp float link failure and falls back to mediump without console errors.
    - Test 3: Tier Transition E2E Drill — verify state changes between T1 (live rAF), T2 (frozen static frame), and T3 (PosterLayer fallback), ensuring data-tier attribute updates on root DOM element and zero black void frames.
    - Test 4: QualityGovernor Performance Downscaling & Recovery — verify scale downshifts from 1.0x to 0.75x/0.5x after 60 slow frames (>20ms) and recovers back to 0.75x/1.0x after 180 fast frames (<12ms).
    - Test 5: Page Visibility API Pause & Resume — verify document.hidden cancels requestAnimationFrame loop, records pausedAt duration, and resumes without u_time delta jumps.
  </behavior>
  <action>
    Create `src/liquid/__tests__/crossDeviceQA.test.ts` with comprehensive unit and component integration tests using Vitest and @testing-library/react.
    Ensure mocks properly handle WebGL contexts (`webgl2`, `webgl`), `matchMedia` (`prefers-reduced-motion`), `navigator.hardwareConcurrency`, `navigator.saveData`, `document.visibilityState`, and `requestAnimationFrame` cycles.
  </action>
  <verify>
    <automated>npx vitest run src/liquid/__tests__/crossDeviceQA.test.ts</automated>
  </verify>
  <done>
    `src/liquid/__tests__/crossDeviceQA.test.ts` passes all hardware matrix, precision fallback, tier transition, performance governor, and visibility pausing tests with 100% green status.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create comprehensive milestone QA report (`docs/QA_REPORT.md`)</name>
  <files>docs/QA_REPORT.md</files>
  <action>
    Create `docs/QA_REPORT.md` documenting the formal milestone QA results for Phase 7 (QA-01).

    Include the following structured sections per Phase 7 RESEARCH.md:
    1. **Executive Overview & Milestone Verification Status**: Summary of Phase 7 QA scope, tested hardware profiles, and overall compliance status.
    2. **Hardware Canary Matrix**: Detailed breakdown across Desktop High-End (M-series / discrete GPU), Integrated GPU (Intel Iris Xe / UHD), Mobile Canary (WebGL1 / mediump float), and Low-End / Constrained (T3 Poster).
    3. **Tier Transition E2E Drill Results**: Audit of T1 <-> T2 <-> T3 state transitions, zero-black-frame guarantees via `PosterLayer` at z:0, and `data-tier` DOM attribute observability.
    4. **Performance Budget & Thermal Audit**: Frame render duration benchmarks (<=16.6ms for 60 FPS), `QualityGovernor` resolution scaling behavior (1.0x -> 0.75x -> 0.5x), and Page Visibility 0.0% idle GPU consumption.
    5. **Reference Image & Visual Consistency Audit**: Alignment matrix for 4 core screens (Dashboard, Task List & Detail, Settings, Login) against reference imagery, including dark glassmorphism (`#0A0A0F`), emerald accent (`#4ADE80`), 5-color liquid gradient (`#A78BFA` -> `#60A5FA` -> `#4ADE80` -> `#FB7185` -> `#F472B6`), and documented rationale for static Ardot vs live shader differences and deferred Spectra light theme.
    6. **Automated Test Suite Summary**: Overview of Vitest test coverage across all liquid system modules.
  </action>
  <verify>
    <automated>test -f docs/QA_REPORT.md && grep -q "Hardware Canary Matrix" docs/QA_REPORT.md && grep -q "Tier Transition" docs/QA_REPORT.md && grep -q "Reference Alignment" docs/QA_REPORT.md</automated>
  </verify>
  <done>
    `docs/QA_REPORT.md` is authored with complete hardware matrix data, tier drill findings, thermal performance audit metrics, and reference visual alignment verification.
  </done>
</task>

<task type="auto">
  <name>Task 3: Final milestone verification & clean build gate</name>
  <files>package.json</files>
  <action>
    Execute full Vitest suite run (`npx vitest run`) to verify all unit, component, and cross-device QA tests pass cleanly across the codebase.
    Execute production build (`npm run build`) to ensure zero TypeScript compilation errors or bundling issues.
  </action>
  <verify>
    <automated>npx vitest run && npm run build</automated>
  </verify>
  <done>
    Full test suite passes 100% green across all test files and `npm run build` generates a clean production distribution in `dist/`.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client Browser -> WebGL GPU Context | Untrusted hardware capabilities, GLSL precision limits, and context loss events. |
| Page Visibility -> rAF Render Loop | Background tab state transitions triggering potential animation delta jumps. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-07-01 | Denial of Service | `LiquidCanvas.ts` | High | mitigate | `QualityGovernor` downscales canvas resolution (1.0x -> 0.75x -> 0.5x) when frame time exceeds 20ms over 60 samples; `dprCap` clamps max DPR to 2.0. |
| T-07-02 | Tampering | `PosterLayer.tsx` | Medium | mitigate | Persistent `PosterLayer` at `z:0` guarantees Zero Void Floor, avoiding black screen flashes during context loss or T3 fallback. |
| T-07-03 | Denial of Service | Page Visibility API | Low | mitigate | Tab visibility change listener cancels rAF loop on tab hide and applies `accumulatedPauseTime` on restore to prevent `u_time` delta spikes. |
</threat_model>

<verification>
Execute the following verification steps:
1. `npx vitest run src/liquid/__tests__/crossDeviceQA.test.ts` (Automated cross-device test suite)
2. `test -f docs/QA_REPORT.md` (QA report artifact exists)
3. `npx vitest run` (Full test suite regression check)
4. `npm run build` (Production build gate)
</verification>

<success_criteria>
1. `src/liquid/__tests__/crossDeviceQA.test.ts` exists and passes all tests for hardware matrix, precision fallback, tier drills, performance governor, and page visibility.
2. `docs/QA_REPORT.md` exists and contains complete document sections for Hardware Canary Matrix, Tier Transition E2E Drill Results, Performance & Thermal Audit, and Reference Alignment Audit.
3. `npx vitest run` passes 100% across all test suites in the repository.
4. `npm run build` compiles cleanly without TypeScript errors or build failures.
</success_criteria>

<output>
Create `.planning/phases/07-cross-device-qa-reference-consistency/PLAN.md` when done
</output>
