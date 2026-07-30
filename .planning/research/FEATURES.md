# Feature Research

**Domain:** Liquid-gradient productivity/task-management desktop web UI (enterprise)
**Researched:** 2026-07-30
**Confidence:** HIGH

> Context: 灵犀 Nexus — dark glassmorphism desktop web-app for enterprise employees.
> Signature visual: WebGL dynamic liquid gradient as a **system-wide motif** (not a single decoration).
> 4 core screens: login/register, dashboard, task list+detail, settings/profile.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. For an enterprise productivity tool, these are non-negotiable — the liquid aesthetic is the differentiator, but it must sit on top of a fully functional base.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Stats/KPI cards** | Every productivity dashboard shows at-a-glance metrics (tasks completed, open count, overdue, hours logged) | LOW | Glass cards with liquid-tinted backdrop. Limit to 4–6 visible cards; more = visual noise. Each card: metric + delta + mini-trend. |
| **Task list with filtering & sorting** | Users must find/reorder tasks by priority, assignee, due date, status | MEDIUM | Filter panel (left sidebar or top bar) + sortable table. Saveable filter presets are table-stakes for enterprise. Row height must be consistent for scannability. |
| **Task detail drawer/panel** | Clicking a task must show full context without leaving the list | MEDIUM | Slide-in right drawer (not full-page navigation) preserves list context. Glass panel over liquid background reinforces the motif. |
| **Upcoming deadlines / schedule widget** | Calendar-adjacent view showing what's due today/this week | MEDIUM | Mini calendar or timeline strip. Deadlines are the backbone of task management; missing this = tool feels incomplete. |
| **Dark mode (primary)** | The project is dark-first; this IS the default | LOW | Already established. Dark glass tokens: `rgba(255,255,255,0.06–0.12)`, blur 12px, `brightness(1.1)` to avoid muddy shadows. |
| **Search (global + scoped)** | Enterprise users expect Cmd+K / quick-search across tasks | MEDIUM | Omnibar with keyboard shortcut. Liquid-glass command palette overlay is both table-stakes AND differentiator. |
| **User profile / settings** | Avatar, preferences, account info | LOW | Standard settings screen. Liquid-tinted avatar ring is the differentiator layer on top. |
| **Keyboard navigation** | Power users expect tab/enter/escape to work everywhere | MEDIUM | Focus rings must be visible against liquid backgrounds — use opaque 2px accent ring, not blurred glass ring. |
| **Empty states** | No tasks / no data screens must be designed, not accidental | LOW | Liquid-themed illustration or subtle animated gradient in empty state. Don't leave blank. |
| **Loading states / skeleton screens** | Perceived performance — users need feedback during data fetch | MEDIUM | Skeleton shimmer uses liquid gradient sweep. Avoid infinite spinners (vestibular concern). |
| **Responsive layout (desktop-first, tablet-aware)** | Enterprise users resize windows; tablets used in meetings | MEDIUM | Desktop-first, but layout must gracefully degrade. Kanban columns → horizontal scroll; timelines → simplified list. |

### Differentiators (Competitive Advantage — From the Liquid Aesthetic)

Features that set 灵犀 Nexus apart. These are where the WebGL liquid gradient earns its place. Each leverages the system-wide motif to create a premium, "alive" feel that flat/SaaS competitors cannot match.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **WebGL liquid background (system-wide)** | The signature. A continuously flowing, domain-warped noise gradient that breathes behind every screen — makes the app feel alive, not static | HIGH | Fragment shader + simplex domain-warp noise. Must be a reusable component (canvas behind z-index content). Cursor-driven distortion optional. This is the foundation all other differentiators build on. |
| **Liquid-gradient logo mark** | Brand identity reinforced — the logo itself flows with the same liquid aesthetic, not a static SVG | MEDIUM | Animate the gradient inside the logo mark (rotating conic/linear gradient with liquid palette). Idle state: slow drift. Active/hover: accelerate. Use CSS animation (cheap) not WebGL for the small mark. |
| **Liquid active-state navigation** | The currently-selected nav item uses a liquid-glass pill that flows/shifts, making wayfinding tactile and premium | MEDIUM | Active tab: semi-transparent liquid glass background with subtle gradient shift. Transition between active items = animated liquid "pour" (translateX + morph). Distinct from flat highlight boxes competitors use. |
| **Liquid-border primary buttons** | CTAs feel premium with an animated rotating gradient border — draws the eye without being garish | MEDIUM | Rotating gradient border (conic-gradient + mask technique) or shader-powered button. Hover: accelerate rotation. Click: ripple feedback. Must respect prefers-reduced-motion (static gradient fallback). Don't use on every button — reserve for primary CTAs only. |
| **Liquid-gradient avatar ring** | User avatars have an animated gradient ring (brand palette) — status and identity become visually distinct | LOW | Conic/linear gradient border on avatar, rotation animation. Hover: glow (blurred duplicate, opacity 0→0.7). Active/online status can modulate the gradient color. Cheap, high visual payoff. |
| **Liquid-tinted data visualization** | Charts and progress bars use the liquid palette with smooth gradient fills — data viz feels part of the ecosystem, not a bolted-on chart library | HIGH | Chart backgrounds blend with page liquid background (transparency gradient). Data highlighted via local opacity shifts. Smooth transition animations on data change. Requires custom chart theming, not default library skins. |
| **Liquid glass command palette (Cmd+K)** | Quick-search overlay uses full glassmorphism over the liquid background — premium feel for a power-user feature | MEDIUM | Glass panel with backdrop-filter blur over liquid bg. Results highlight with liquid tint. Differentiates from flat/boxy command palettes. |
| **Light theme variant (Spectra direction)** | The "Spectra" reference (light + pastel liquid) as an alternate theme — broadens appeal beyond dark-first | HIGH | Light glass tokens: `rgba(255,255,255,0.15–0.18)`, blur 16px, border 0.2–0.36. Liquid palette shifts to pastel. Must re-verify all contrast ratios. High complexity — requires full token-system dual-mode. Defer to v1.x. |
| **Cursor-reactive liquid distortion** | The liquid background subtly responds to cursor movement — creates a sense that the app is aware of the user | HIGH | TouchTexture class records cursor → shader distortion. pointer-events: none on content layer to pass through to canvas. Premium feel but GPU-intensive — gate behind performance check. |
| **Liquid morph transitions (screen-to-screen)** | Route transitions use liquid "pour/melt" effects instead of standard fade/slide | HIGH | View transitions with liquid-glass morph. Very high "wow" factor but high implementation risk. Reserve for v2. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems — especially in a liquid/glassmorphism context. Document to prevent scope creep.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Glassmorphism on every element** | "Make everything glassy for consistency" | backdrop-filter is GPU-intensive — stacking 10+ glass cards + glass nav + glass modal tanks frame rate on mid-range devices. Also reduces readability when everything is translucent (nothing reads as "in focus"). Eye fatigue. | Reserve glass for 3–4 key elements per viewport (nav bar, modals/overlays, command palette, hero cards). Use solid dark surfaces for dense data (tables, forms, task lists). |
| **Animated liquid on data tables / dense text** | "Apply the liquid flow to the task table background too" | Backdrop-filter blur + animated background behind small text = WCAG contrast failures as background shifts. Scanning dense rows over moving liquid is cognitively exhausting. | Solid or near-solid surface for tables/lists. Liquid visible in card gutters, headers, and empty space — not behind text. |
| **Full-screen WebGL on every route** | "The liquid should be everywhere, full-bleed" | Continuous WebGL render loop on every screen = constant GPU draw even when idle. Battery drain on laptops. Some enterprise IT policies flag high-GPU tabs. | Pause WebGL when tab is hidden (Page Visibility API). Reduce frame rate when idle (throttle to 2-4fps or static frame). Consider static gradient snapshot for low-power contexts. |
| **Parallax liquid on scroll** | "Make the liquid move differently as you scroll for depth" | Parallax is a top vestibular trigger (motion sickness, nausea). Directly conflicts with the accessibility requirement. Anti-pattern for an enterprise tool used 8 hours/day. | Subtle parallax only if prefers-reduced-motion is no-preference, and even then keep delta < 5px. Better: no parallax; let the liquid breathe independently of scroll. |
| **Real-time collaborative cursors** | "Show other users' cursors on the liquid background" | Out of scope — PROJECT.md explicitly excludes backend/auth. Real-time collab requires WebSocket infra, presence system, conflict resolution. Massive scope creep. | Static assignee avatars on tasks. Defer real-time collab to a future full-stack milestone. |
| **Fully custom chart engine (liquid-powered)** | "Build charts from scratch with liquid shaders" | Enormous effort for marginal gain. Custom charting = no accessibility (ARIA), no tooltips/legends/axes for free. Reinvents what chart libraries do well. | Theme an existing chart library (ECharts/Recharts/Chart.js) with liquid palette + gradient fills. Get liquid feel without the engine cost. |
| **Notifications/toasts with WebGL liquid** | "Make notification toasts liquid-glass animated" | Toasts are transient — users see them for 3-5 seconds. Investing WebGL in ephemeral elements is low ROI. Over-animation of toasts is distracting in an 8h workday. | Glass toast with static liquid-tinted gradient (CSS only, no shader). Subtle slide-in + fade. |
| **Haptic/3D-tilt card effects** | "Cards tilt in 3D following the mouse" | Gimmicky for enterprise. Causes vestibular issues. Distracts from the data the card is supposed to communicate. | Flat glass cards with subtle hover-lift (translateY -2px + shadow). Liquid lives in the background, not in card physics. |

---

## Feature Dependencies

```
[WebGL Liquid Background (system-wide)]
    │
    ├──requires──> [Performance & Degradation Strategy]
    │                  └──requires──> [prefers-reduced-motion handling]
    │                  └──requires──> [Page Visibility / idle throttle]
    │
    ├──enables──> [Liquid-gradient logo mark]
    ├──enables──> [Liquid active-state navigation]
    ├──enables──> [Liquid-tinted data visualization]
    └──enables──> [Cursor-reactive liquid distortion]

[Design Token System (dark/light)]
    ├──requires──> [Glassmorphism token set (--glass-bg, --glass-blur, etc.)]
    └──enables──> [Light theme variant (Spectra)]

[Task Data Model]
    ├──enables──> [Task list + filtering]
    ├──enables──> [Task detail drawer]
    ├──enables──> [Kanban view]  ──same-data──> [List view]  ──same-data──> [Timeline view]
    └──enables──> [Stats/KPI cards] (aggregates from task data)

[Liquid-border primary buttons] ──conflicts──> [Glassmorphism on every element]
    (buttons must be RESERVED accent, not ubiquitous)

[Stats/KPI cards] ──enhances──> [Liquid-tinted data visualization]
[Liquid active-state nav] ──enhances──> [Liquid glass command palette]
```

### Dependency Notes

- **WebGL Liquid Background requires Performance & Degradation Strategy:** The background is the foundation of every differentiator. It cannot ship without a degradation path — a WebGL canvas that crashes on low-end GPUs or ignores prefers-reduced-motion is a liability, not a feature. This dependency is the single most important ordering constraint.
- **All liquid-element differentiators require the background:** Logo, nav, buttons, avatars, data viz all derive their palette and motion language from the system-wide liquid background. Building them before the background component exists = inconsistent results.
- **Design Token System enables theming (dark/light):** The light "Spectra" variant cannot be built without a token system that swaps glass values at the `:root` / `[data-theme]` level. Hardcoded values = manual re-skinning of every component.
- **Kanban / List / Timeline share the same task data model:** They are views of one data source, not separate features. Build the data model once; views are presentation layers. Instant switching with no reconfiguration is the enterprise standard.
- **Liquid-border buttons conflict with ubiquitous glass:** If everything is glass, the liquid button loses its accent value. The differentiator depends on restraint — reserve liquid-glass for primary CTAs only.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the liquid-aesthetic productivity concept.

- [ ] **WebGL liquid background component** — the signature; without it, the project has no identity. Must include degradation + prefers-reduced-motion from day one.
- [ ] **Dark glassmorphism design token system** — `--glass-bg`, `--glass-blur`, `--glass-border`, `--text-strong`, `--accent` (翠绿 #4ADE80). Foundation for all components.
- [ ] **Dashboard: stats/KPI cards + task list + schedule strip** — the home screen. Glass cards over liquid bg. 4–6 stat cards, today's task list, upcoming deadlines.
- [ ] **Task list + filtering + detail drawer** — core workflow. Filter panel, sortable table, slide-in detail drawer (glass panel).
- [ ] **Liquid active-state navigation** — wayfinding must feel premium from first use. Liquid-glass pill on active nav item.
- [ ] **Liquid-gradient logo mark** — brand identity in the top-left of every screen. CSS-animated gradient, not WebGL.
- [ ] **Liquid-border primary CTAs** — reserved for the 1–2 most important actions per screen. Login button, "Create Task", etc.
- [ ] **Login/register screen** — first impression. Full liquid background + glass form panel.
- [ ] **Settings/profile** — basic but complete. Liquid-gradient avatar ring.
- [ ] **prefers-reduced-motion degradation** — static gradient frame fallback. Non-negotiable for v1.
- [ ] **@supports fallback for backdrop-filter** — solid dark surface for browsers without support.

### Add After Validation (v1.x)

Features to add once the core liquid experience is working and validated.

- [ ] **Light theme variant (Spectra)** — trigger: user research confirms demand for light mode. High effort (full token re-skin + contrast re-audit).
- [ ] **Cursor-reactive liquid distortion** — trigger: performance budget confirmed on target hardware. Adds "alive" feel.
- [ ] **Liquid glass command palette (Cmd+K)** — trigger: power-user feedback. High value, medium effort.
- [ ] **Liquid-tinted data visualization** — trigger: dashboard analytics mature beyond basic stat cards. Requires custom chart theming.
- [ ] **Kanban + Timeline views** — trigger: enterprise teams need workflow-stage visualization. List view is sufficient for v1; additional views are enhancement.
- [ ] **Saveable filter presets** — trigger: enterprise users with recurring filter needs.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Liquid morph screen transitions** — high "wow" but high risk. View Transitions API + liquid-glass morph. Only after core flows are stable.
- [ ] **Custom liquid-powered chart engine** — only if existing themed libraries prove insufficient.
- [ ] **Real-time collaboration** — requires backend (out of current scope entirely). Future full-stack milestone.
- [ ] **Liquid-themed notification system** — low ROI for ephemeral elements.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| WebGL liquid background | HIGH | HIGH | P1 |
| Dark glassmorphism token system | HIGH | MEDIUM | P1 |
| Stats/KPI cards (glass) | HIGH | LOW | P1 |
| Task list + filtering + detail drawer | HIGH | MEDIUM | P1 |
| Liquid active-state navigation | HIGH | MEDIUM | P1 |
| Liquid-gradient logo mark | MEDIUM | LOW | P1 |
| Liquid-border primary CTAs | MEDIUM | MEDIUM | P1 |
| Login/register (liquid + glass) | HIGH | MEDIUM | P1 |
| Settings/profile + avatar ring | MEDIUM | LOW | P1 |
| prefers-reduced-motion degradation | HIGH | MEDIUM | P1 |
| @supports backdrop-filter fallback | HIGH | LOW | P1 |
| Search/command palette | MEDIUM | MEDIUM | P2 |
| Light theme (Spectra) | MEDIUM | HIGH | P2 |
| Cursor-reactive distortion | MEDIUM | HIGH | P2 |
| Liquid-tinted data viz | MEDIUM | HIGH | P2 |
| Kanban view | MEDIUM | MEDIUM | P2 |
| Timeline view | LOW | HIGH | P3 |
| Liquid morph transitions | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Linear / Notion (flat SaaS) | Apple Liquid Glass (iOS/macOS) | 灵犀 Nexus (Our Approach) |
|---------|-----------------------------|-------------------------------|--------------------------|
| Background aesthetic | Solid/flat or subtle gradient | System glass (OS-level blur) | WebGL liquid gradient (custom shader, domain-warped noise) — more dynamic than either |
| Card surfaces | Solid white/dark cards | Frosted glass (backdrop-filter) | Dark glass over liquid — glass + animated liquid = unique depth |
| Active nav state | Flat highlight / underline | Liquid glass pill (OS-native) | Liquid-glass pill with gradient flow — matches Apple's language but custom-tuned |
| Primary buttons | Solid accent fill | Glass with blur | Liquid-border rotating gradient — more premium than solid, more intentional than OS glass |
| Data visualization | Themed chart library | System widget charts | Liquid-tinted gradients on chart fills — theming an existing library, not custom engine |
| Theming | Light/dark via tokens | System appearance | Token-based dark-first + deferred light "Spectra" variant |
| Motion/accessibility | Standard transitions | OS honors reduce-motion | WebGL pause + static frame; CSS duration tokens collapse to near-zero |
| Desktop focus | Web-first responsive | OS-native (not web) | Desktop web-first (enterprise), tablet-aware |

---

## Liquid Motif Application Guide

How the "liquid" visual motif is typically and should be applied across interactive elements, with complexity notes:

| Element | Liquid Application | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Logo mark** | Animated gradient inside logo shape (rotating conic/linear, liquid palette). Idle: slow drift 8s. Hover: accelerate 3s. | LOW | CSS animation only (no WebGL for small mark). Must be crisp at small sizes — test at 24px. |
| **Active nav state** | Liquid-glass pill: `rgba` translucent fill + `backdrop-filter` blur + subtle gradient shift. Transition between items = animated translateX morph. | MEDIUM | The "pour" transition between active items is the signature micro-interaction. Keep transition < 400ms. |
| **Primary buttons** | Rotating gradient border (conic-gradient + mask) OR shader-powered surface. Hover: accelerate. Click: ripple. | MEDIUM | Reserve for 1–2 CTAs per screen. Secondary buttons = solid glass, no liquid border. |
| **Avatars** | Animated gradient ring (conic, brand palette). Rotation 8s linear infinite. Hover: blurred glow (opacity 0→0.7). Online status modulates ring color. | LOW | Pure CSS. High visual payoff per effort. |
| **Status capsules/badges** | Liquid-tinted gradient fill (static, not animated — badges are read, not watched). | LOW | Use liquid palette colors but keep static for readability. |
| **Data viz (charts)** | Gradient fills using liquid palette. Chart bg blends with page via transparency. Data highlights via local opacity shifts. Smooth transitions on data change. | HIGH | Theme existing library (ECharts/Recharts). Custom theming, not custom engine. |
| **Background (system-wide)** | WebGL fragment shader: domain-warped simplex noise, multiple color centers, continuous flow. Optional cursor distortion. | HIGH | The foundation. Pause on tab hidden, throttle when idle, static frame for reduced-motion. |
| **Modals/overlays** | Full glassmorphism panel over liquid bg. backdrop-filter blur creates separation. | MEDIUM | Standard glass recipe — this is where glassmorphism works best (clear fg/bg separation). |
| **Toasts/notifications** | Glass surface with static liquid-tinted gradient (CSS only). Slide-in + fade. | LOW | No shader. Ephemeral — keep it simple. |
| **Loading/skeleton** | Liquid gradient sweep shimmer across skeleton shapes. | MEDIUM | Use liquid palette for the shimmer sweep. Avoid infinite spinners. |

---

## Sources

- web.dev — prefers-reduced-motion: Sometimes less movement is more (HIGH confidence)
- MDN — prefers-reduced-motion CSS media feature (HIGH confidence)
- cssshowcase.com — prefers-reduced-motion implementation guide (HIGH confidence)
- neelnetworks.com — Glassmorphism Web Design: How to Use It (and When to Avoid It) (HIGH confidence)
- zenixtools.com — Mastering Glassmorphism: Modern CSS Design Trend (HIGH confidence)
- framerwebsites.com — Glassmorphism in Web Design: A Complete Guide (HIGH confidence)
- ramotion.com — What is Glassmorphism: Principles, Practices & Examples (MEDIUM confidence)
- nineproo.com — CSS Glassmorphism: The Definitive Developer's Guide 2026 (HIGH confidence)
- axonixtools.com — Is Glassmorphism Still Cool? Complete CSS Guide for 2026 (HIGH confidence)
- studiolimb.com — Glassmorphism CSS Tutorial: Frosted Glass UI (HIGH confidence)
- oakleydye.com — Glassmorphism: A Practical Guide for Developers (MEDIUM confidence)
- juejin.cn — iOS 26 Liquid Glass design and CSS UI implementation (MEDIUM confidence)
- framer.com — Liquid AnimateButton / Liquid Metal Button components (MEDIUM confidence)
- designyff.com — Creating an Avatar with Animated Rotating Border (MEDIUM confidence)
- madebybeings.com — Interactive liquid gradient background with Three.js tutorial (MEDIUM confidence)
- taskopad.com — When to Use Kanban, Gantt, List, or Calendar Views (HIGH confidence)
- ones.com — Visual Design of Project Management Dashboard UI: 4 Key Layouts (HIGH confidence)
- jestor.com — Visual process management: when to use kanban, table or timeline (HIGH confidence)
- fluorine.app — Kanban vs List vs Calendar: Choosing the Right Task View (MEDIUM confidence)
- PROJECT.md — 灵犀 Nexus project context and validated requirements (HIGH confidence)

---
*Feature research for: liquid-gradient productivity/task-management desktop web UI*
*Researched: 2026-07-30*
