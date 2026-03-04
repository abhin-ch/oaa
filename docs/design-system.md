# OBJECTIVE Design System

> OAA's brand is black, white, grey, Akkurat, geometric, and serious. We take that DNA and make it warm, approachable, and alive — a tool architects actually enjoy using.

---

## 1. Design Philosophy

### The Problem With Existing Tools

The current OBJECTIVE (TEUI4) and OAA calculators feel like spreadsheets bolted onto web pages — Bootstrap grids, Material Design blue buttons, dense forms with 50+ inputs visible at once. They work. They don't feel good.

### Our North Star

**"Complex science, simple experience."**

We're building for architects — visual thinkers who care about aesthetics. The UI itself should feel like good architecture: considered proportions, generous whitespace, purposeful materiality, nothing extraneous. Think of the gap between a government tax form and the Stripe dashboard. We're building the Stripe dashboard of building energy.

### Design Principles (Ranked)

1. **Clarity over density** — If a screen feels busy, it has too much. Remove, don't reorganize.
2. **Show the impact, not the input** — Every screen leads with "what changed" (energy visualization), not "what to type" (form fields).
3. **Progressive trust** — Start with the simplest possible thing (address + area = instant TEUI). Earn the right to ask harder questions.
4. **Tactile feedback** — Inputs feel physical. Sliders have weight. Numbers animate when they change. Charts breathe.
5. **Quiet confidence** — No flashy gradients, no gratuitous animations. Understated, precise, architectural.

---

## 2. Color System

### Foundation: OAA Brand DNA

OAA uses black, white, and greys with Akkurat grotesque. We preserve that restraint but add **functional warmth** — accent colors that mean something (energy = amber, good = teal, warning = red).

### Light Mode (Default)

```
Background Layers:
  --bg-base:        #FAFAFA     ← Page background (warm near-white, not sterile #FFF)
  --bg-surface:     #FFFFFF     ← Cards, panels, inputs
  --bg-raised:      #F5F5F4     ← Hover states, secondary surfaces (stone-50)
  --bg-sunken:      #EDEDEB     ← Inset areas, disabled fields

Text:
  --text-primary:   #1C1917     ← Headings, primary content (stone-900, near-black)
  --text-secondary: #57534E     ← Descriptions, labels (stone-600)
  --text-tertiary:  #A8A29E     ← Placeholders, hints (stone-400)
  --text-inverse:   #FAFAF9     ← Text on dark backgrounds

Borders:
  --border-default: #E7E5E4     ← Card borders, dividers (stone-200)
  --border-strong:  #D6D3D1     ← Focused input borders (stone-300)
  --border-subtle:  #F5F5F4     ← Very light separators (stone-100)
```

### Dark Mode

```
Background Layers:
  --bg-base:        #0C0A09     ← Page background (stone-950)
  --bg-surface:     #1C1917     ← Cards, panels (stone-900)
  --bg-raised:      #292524     ← Hover states (stone-800)
  --bg-sunken:      #0C0A09     ← Inset areas (stone-950)

Text:
  --text-primary:   #FAFAF9     ← Headings (stone-50)
  --text-secondary: #A8A29E     ← Labels (stone-400)
  --text-tertiary:  #78716C     ← Hints (stone-500)
  --text-inverse:   #1C1917     ← Text on light backgrounds

Borders:
  --border-default: #292524     ← Dividers (stone-800)
  --border-strong:  #44403C     ← Focused inputs (stone-700)
  --border-subtle:  #1C1917     ← Subtle separators (stone-900)
```

### Semantic Colors (Same Both Modes, Adjusted Saturation)

```
Energy / Primary Action (Amber — energy is warm, fire, heat):
  --energy-50:      #FFFBEB
  --energy-100:     #FEF3C7
  --energy-200:     #FDE68A
  --energy-400:     #FBBF24     ← Primary accent, CTAs, active states
  --energy-500:     #F59E0B     ← Strong emphasis
  --energy-600:     #D97706     ← Dark mode primary accent
  --energy-900:     #78350F

Performance / Success (Teal — efficiency, cool, optimized):
  --success-50:     #F0FDFA
  --success-100:    #CCFBF1
  --success-400:    #2DD4BF     ← Good performance indicators
  --success-500:    #14B8A6
  --success-600:    #0D9488
  --success-900:    #134E4A

Warning / Heat Loss (Rose — danger, heat escaping, attention):
  --warning-50:     #FFF1F2
  --warning-100:    #FFE4E6
  --warning-400:    #FB7185     ← Poor performance, over-budget
  --warning-500:    #F43F5E
  --warning-600:    #E11D48
  --warning-900:    #881337

Info / Reference (Slate Blue — neutral, reference, code-minimum):
  --info-50:        #F8FAFC
  --info-100:       #E2E8F0
  --info-400:       #94A3B8     ← Reference model, benchmarks
  --info-500:       #64748B
  --info-600:       #475569
  --info-900:       #0F172A
```

### Color Meaning Map (Critical for Accessibility)

| Color | Meaning                                   | Where Used                              |
| ----- | ----------------------------------------- | --------------------------------------- |
| Amber | Energy, primary action, "do this"         | CTAs, sliders, active wizard step, TEUI |
| Teal  | Good performance, under target            | TEUI below benchmark, efficient systems |
| Rose  | Poor performance, heat loss, over target  | TEUI above benchmark, losses in Sankey  |
| Slate | Reference/baseline, neutral info          | Code-min model, benchmark lines         |
| Stone | Everything structural (backgrounds, text) | All UI chrome                           |

**Rule**: Color is NEVER the sole indicator. Always pair with icons, labels, or patterns.

---

## 3. Typography

### Font Choice: Geist Sans

OAA uses [Akkurat](https://lineto.com/typefaces/akkurat) — a Swiss grotesque, clean, accessible. Akkurat is a commercial font (~$300+), so we use **Geist Sans** by Vercel as our primary typeface:

- **Why Geist**: It's the closest open-source match to Akkurat's character — clean grotesque, excellent readability at small sizes, designed for interfaces, includes tabular figures (critical for our number-heavy UI), and ships with Next.js. Free.
- **Fallback**: `"Geist Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Monospace: Geist Mono

For numbers, code, and calculation displays:

- Tabular figures ensure columns of numbers align
- `"Geist Mono", "IBM Plex Mono", "SF Mono", "Consolas", monospace`

### Type Scale

```
--text-xs:    0.75rem / 1rem      (12px — fine print, badges)
--text-sm:    0.875rem / 1.25rem  (14px — labels, descriptions, table cells)
--text-base:  1rem / 1.5rem       (16px — body text, inputs)
--text-lg:    1.125rem / 1.75rem  (18px — section labels)
--text-xl:    1.25rem / 1.75rem   (20px — card titles)
--text-2xl:   1.5rem / 2rem       (24px — page headings)
--text-3xl:   1.875rem / 2.25rem  (30px — dashboard hero numbers)
--text-4xl:   2.25rem / 2.5rem    (36px — big metric display)
--text-5xl:   3rem / 1            (48px — hero TEUI number on results)
```

### Font Weights

```
--font-normal:    400   ← Body text, descriptions
--font-medium:    500   ← Labels, nav items, sub-headings
--font-semibold:  600   ← Card titles, emphasis
--font-bold:      700   ← Page headings, big numbers
```

### Typography Rules

- **Body text**: 16px minimum. Never smaller for readable content.
- **Big numbers** (TEUI result, GHGI): Use `text-5xl font-bold font-mono tabular-nums` — these are the hero moments.
- **Labels**: `text-sm font-medium text-secondary` — quiet, not competing with values.
- **Units**: Render units (`kWh/m²/yr`) in `text-sm text-tertiary` next to the value, not same size.
- **Line height**: Generous — 1.5 for body, 1.25 for headings. Let text breathe.

---

## 4. Spacing & Layout

### Spacing Scale (Tailwind default, extended)

```
0.5:  2px      ← Tight internal spacing (icon gap)
1:    4px      ← Badge padding
1.5:  6px      ← Compact input padding
2:    8px      ← Inline element gaps
3:    12px     ← Input padding, tight card padding
4:    16px     ← Default card padding, section gaps
5:    20px     ← Comfortable input padding
6:    24px     ← Card padding (desktop)
8:    32px     ← Section spacing
10:   40px     ← Major section breaks
12:   48px     ← Page-level vertical rhythm
16:   64px     ← Hero section padding
20:   80px     ← Top-level page padding (desktop)
```

### Layout Grid

- **Max content width**: `max-w-6xl` (1152px) — prevents line lengths from becoming unreadable
- **Mobile**: Single column, 16px horizontal padding
- **Tablet** (768px+): Two-column where appropriate (input + preview side-by-side)
- **Desktop** (1024px+): Sidebar navigation (240px) + main content. Wizard steps left, results right.
- **Wide** (1440px+): Three-panel: nav + inputs + live results

### The Golden Rule of Layout

**Results/visualizations take 60% of the viewport, inputs take 40%.** The energy impact is always the hero, not the form fields. On mobile this means results sit _above_ or are accessible via a sticky bottom sheet, not buried below a long form.

---

## 5. Component Design

### Cards

The primary container. Every distinct section lives in a card.

```
Surface card:
  background: var(--bg-surface)
  border: 1px solid var(--border-default)
  border-radius: 12px
  padding: 24px
  shadow: none (light mode) / none (dark mode)

Hover card (clickable):
  + transition: all 150ms ease
  + hover:border-color: var(--border-strong)
  + hover:shadow: 0 1px 3px rgba(0,0,0,0.04)

Elevated card (modals, popovers):
  shadow: 0 4px 24px rgba(0,0,0,0.08)
  border: 1px solid var(--border-default)
```

**No heavy shadows.** The OAA aesthetic is flat and precise. Depth comes from borders and background color shifts, not drop shadows.

### Buttons

```
Primary (amber):
  bg: var(--energy-400)
  text: var(--text-primary) [dark text on amber]
  border-radius: 8px
  padding: 10px 20px
  font-weight: 500
  transition: all 150ms
  hover: brightness(1.05), slight lift (translateY -1px)
  active: brightness(0.95)
  focus: ring-2 ring-energy-400 ring-offset-2

Secondary (outlined):
  bg: transparent
  border: 1px solid var(--border-strong)
  text: var(--text-primary)
  hover: bg var(--bg-raised)

Ghost (text only):
  bg: transparent
  text: var(--text-secondary)
  hover: text var(--text-primary), bg var(--bg-raised)

Destructive (rose):
  bg: var(--warning-500)
  text: white
  hover: var(--warning-600)
```

**Minimum touch target: 44px height.** No exceptions.

### Inputs

```
Default:
  bg: var(--bg-surface)
  border: 1px solid var(--border-default)
  border-radius: 8px
  padding: 10px 14px
  font-size: 16px (prevents iOS zoom)
  transition: border-color 150ms, box-shadow 150ms

Focus:
  border-color: var(--energy-400)
  box-shadow: 0 0 0 3px var(--energy-100)
  outline: none

Error:
  border-color: var(--warning-500)
  box-shadow: 0 0 0 3px var(--warning-100)

Label:
  Above input, not floating
  font-size: 14px
  font-weight: 500
  color: var(--text-secondary)
  margin-bottom: 6px
```

**Labels are always visible** — never placeholder-only. Placeholder text is supplementary (e.g., "e.g. 1,500").

### Sliders (Critical Component)

Sliders are how architects will explore "what-if" scenarios. They must feel physical.

```
Track:
  height: 6px
  bg: var(--bg-sunken)
  border-radius: 3px

Filled portion:
  bg: var(--energy-400) → gradient to var(--energy-500)

Thumb:
  width: 20px, height: 20px
  bg: white
  border: 2px solid var(--energy-400)
  border-radius: 50%
  shadow: 0 1px 3px rgba(0,0,0,0.15)
  transition: transform 100ms
  hover: transform scale(1.15)
  active: transform scale(1.1), shadow enlarges

Value tooltip:
  Appears above thumb on hover/drag
  bg: var(--bg-surface), border, rounded
  Shows current value + unit in real-time
```

### Wizard Steps Indicator

```
Horizontal on desktop, bottom bar on mobile.

Step states:
  Completed:  filled circle (teal) + teal line
  Current:    filled circle (amber) + pulsing ring
  Upcoming:   hollow circle (grey) + grey line

Step labels visible on desktop, icon-only on mobile.
Each step tap-navigable (not just sequential).
```

---

## 6. Data Visualization

### The TEUI Hero Number

The single most important element in the app. When a user finishes entering data, they see:

```
┌──────────────────────────────────────────┐
│                                          │
│              123.4                        │
│         kWh/m²/yr                        │
│                                          │
│    ██████████████░░░░░░  62% of code max │
│                                          │
│    ▼ 18% better than average             │
│                                          │
└──────────────────────────────────────────┘

Number: text-5xl font-bold font-mono, color based on performance:
  - Teal if below target
  - Amber if near target
  - Rose if above target
Unit: text-lg text-tertiary, below the number
Progress bar: thin (4px), shows position relative to code maximum
Context line: text-sm, with trend arrow icon
```

The number **animates** (counts up/down) when the value changes. Spring animation, not linear.

### Sankey Diagram Style

```
Energy flows from left (sources) to right (uses/losses):

Source nodes (left):     Amber shades
  Electricity            --energy-400
  Natural Gas            --energy-500
  Renewables             --success-400

Flow paths:              Semi-transparent (0.3 opacity), colored by source
                         Width proportional to energy value
                         Curved bezier paths, not straight

Sink nodes (right):      Categorized by type
  Heating demand         --warning-400 (loss)
  Cooling demand         --info-400
  Lighting               --energy-200
  Equipment              --energy-300
  Losses (envelope)      --warning-300 (lighter = less critical)
  Losses (ventilation)   --warning-500 (darker = more critical)

Interaction:
  Hover a flow → highlight path, dim others, show tooltip with kWh value
  Click a node → expand breakdown
  Animate flows on data change (paths morph to new widths)
```

### Benchmark Comparison Chart

```
Horizontal bar chart, stacked context:

Your building    ████████████░░░░░░░░░░░░░  123 kWh/m²
Code maximum     ████████████████████████░░  198 kWh/m²
National average ██████████████████░░░░░░░░  167 kWh/m²
Passive House    ████░░░░░░░░░░░░░░░░░░░░░   45 kWh/m²

Colors:
  Your building: amber (or teal if best-in-class)
  Code max: slate
  Average: slate lighter
  Passive House: teal

Values right-aligned. Your building bar is always topmost and visually dominant.
```

### Mini Sparklines (In Wizard Steps)

Each wizard step shows a small impact indicator:

```
"Envelope R-value: R-24  →  TEUI impact: -12.3 kWh/m²  ↓"

Tiny inline sparkline (50px wide × 20px) showing how this parameter
affects the total TEUI curve. Visual gut-check, not precision.
```

---

## 7. Motion & Animation

### Principles

- **Purposeful only** — Animation communicates state change, not decoration
- **Fast** — 150ms for micro-interactions, 300ms for layout shifts, 500ms max for page transitions
- **Respect `prefers-reduced-motion`** — All animations disable entirely when this media query matches

### Specific Animations

| Element          | Trigger       | Animation                                   | Duration |
| ---------------- | ------------- | ------------------------------------------- | -------- |
| TEUI number      | Value changes | Count up/down (spring ease)                 | 400ms    |
| Sankey flows     | Data changes  | Paths morph width (ease-out)                | 500ms    |
| Wizard step      | Navigate      | Slide + fade (direction-aware)              | 250ms    |
| Card             | Appears       | Fade in + slight translateY(8px→0)          | 200ms    |
| Slider thumb     | Drag          | Scale + shadow increase                     | 100ms    |
| Toast            | Appears       | Slide up from bottom + fade                 | 200ms    |
| Toast            | Dismisses     | Fade out + slide down                       | 150ms    |
| Results panel    | Recalculates  | Subtle pulse border glow (amber)            | 300ms    |
| Chart bars       | Value changes | Width transition (ease-out)                 | 400ms    |
| Button           | Click         | Scale(0.98) → scale(1)                      | 100ms    |
| Bottom tab       | Tap           | Icon pill scale-in + color shift            | 200ms    |
| Bottom sheet     | Swipe         | Spring physics (damping 0.8, stiffness 300) | ~400ms   |
| Header           | Scroll down   | SlideY up (hide)                            | 200ms    |
| Header           | Scroll up     | SlideY down (show)                          | 200ms    |
| Offline banner   | Appears       | Slide down from header                      | 250ms    |
| Content sections | Swipe L/R     | Direction-aware slide + fade                | 250ms    |
| Project card     | Long press    | Scale(1.02) + shadow lift                   | 150ms    |

### Loading States

- **Skeleton screens**, not spinners. Skeletons match the shape of content being loaded.
- **Calculation in progress**: Subtle shimmer on the results panel (not a blocking spinner). The amber border glow pulses gently.
- **First load**: Content fades in section by section (staggered 50ms), not all at once.

---

## 8. Responsive Breakpoints & Mobile Strategy

### Breakpoints

```
sm:   640px    ← Large phones
md:   768px    ← Tablets portrait
lg:   1024px   ← Tablets landscape, small laptops
xl:   1280px   ← Standard desktops
2xl:  1536px   ← Wide monitors
```

### Mobile Layout (< 768px) — Native App Feel

The mobile experience must be **indistinguishable from a native iOS/Android app**. No browser chrome feel, no "website on a phone" energy. This is a PWA that lives on the home screen.

#### System-Level Native Behaviors

```
PWA Manifest:
  display: "standalone"           ← No browser URL bar
  orientation: "portrait"         ← Lock portrait (optional landscape for charts)
  theme_color: "#FAFAFA"          ← Status bar matches app (light)
  theme_color (dark): "#0C0A09"   ← Status bar matches app (dark)
  background_color: "#FAFAFA"     ← Splash screen background
  scope: "/"
  start_url: "/"

iOS-specific meta tags:
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  ← "default" = dark text on light bg (matches our light mode)
  ← "black-translucent" for dark mode

Viewport:
  <meta name="viewport" content="width=device-width, initial-scale=1,
    maximum-scale=1, user-scalable=no, viewport-fit=cover">
  ← viewport-fit=cover for edge-to-edge behind notch/safe areas
  ← user-scalable=no prevents accidental zoom (inputs are 16px+ so no iOS zoom)
```

#### Safe Areas & Edge-to-Edge

```css
/* Respect notch, home indicator, rounded corners */
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}

/* Header extends behind status bar with blur */
.mobile-header {
  padding-top: calc(var(--safe-top) + 8px);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(250, 250, 250, 0.8); /* semi-transparent */
}

/* Bottom nav sits above home indicator */
.bottom-nav {
  padding-bottom: calc(var(--safe-bottom) + 8px);
}
```

#### Screen Layout

```
┌──────────────────────────┐
│▓▓▓▓▓▓ status bar ▓▓▓▓▓▓▓│  ← OS status bar (time, battery)
├──────────────────────────┤
│  OBJECTIVE    🌗  FR  ···│  ← Frosted glass header (blur-through)
├──────────────────────────┤
│                          │
│                          │
│  [Current wizard step    │  ← Full-width, scrollable content area
│   content — inputs,      │     Overscroll bounce (iOS rubber-band)
│   cards, sliders]        │
│                          │
│                          │
│                          │
│                          │
├──────────────────────────┤
│  ╔════════════════════╗  │  ← Results pill (floating, above bottom nav)
│  ║ TEUI  123.4  ▲     ║  │     Tap ▲ → pull-up full results sheet
│  ╚════════════════════╝  │     Swipe up → snap to half/full screen
├──────────────────────────┤
│  🏠    📐    ⚡    📊   │  ← Bottom tab bar (4 tabs, not 7)
│ Home  Build  Energy  Results│     Fixed, always visible
│▓▓▓▓▓▓ home indicator ▓▓▓│  ← Safe area padding
└──────────────────────────┘
```

#### Bottom Tab Bar (Not Wizard Steps)

On mobile, 7 wizard steps don't fit as bottom tabs. Instead, we use **4 primary tabs** that group the wizard steps logically. Within each tab, the wizard sub-steps scroll vertically or swipe horizontally.

```
Tab 1: Home       → Project list, create new, settings
Tab 2: Building   → Steps 1-2 (Project Setup + Building Basics) as sections
Tab 3: Energy     → Steps 3-6 (Bills + Envelope + Systems + Renewables) as sections
Tab 4: Results    → Step 7 (Dashboard, Sankey, benchmarks)

Tab bar specs:
  height: 52px + safe-area-bottom
  background: var(--bg-surface) with frosted glass blur
  border-top: 1px solid var(--border-subtle)

  Each tab:
    Icon: 24px, centered
    Label: 10px, font-medium, below icon
    Tap target: full tab width × 52px (well above 48px minimum)

  Active tab:
    Icon + label: var(--energy-500)
    Subtle filled background pill behind icon (energy-50, 32px × 32px rounded)

  Inactive tab:
    Icon + label: var(--text-tertiary)

  Transition:
    Icon color: 150ms ease
    Background pill: scale(0→1) + fade, 200ms spring
```

#### Haptic Feedback System

Use the `navigator.vibrate()` API and (where available) the experimental Vibration API patterns. iOS PWAs support haptics via CSS `@media (hover: none)` touch events.

```typescript
// src/lib/haptics.ts — Centralized haptic feedback utility

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

const patterns: Record<HapticStyle, number | number[]> = {
  light: 10, // Tab switch, toggle, minor interaction
  medium: 15, // Button press, step completion
  heavy: 25, // Delete, destructive action
  selection: 5, // Picker change, slider snap
  success: [10, 50, 15], // Project saved, calculation complete
  warning: [15, 30, 15], // Validation error
  error: [20, 40, 20, 40, 20], // Failed action
};

function haptic(style: HapticStyle): void {
  if (typeof navigator === 'undefined') return;
  if (!navigator.vibrate) return;

  // Respect user preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  navigator.vibrate(patterns[style]);
}
```

**Where haptics fire:**

| Interaction                              | Haptic      | Feels Like                                                      |
| ---------------------------------------- | ----------- | --------------------------------------------------------------- |
| Tab bar tap                              | `light`     | iOS tab switch                                                  |
| Button press                             | `medium`    | Confirming an action                                            |
| Slider snap to preset value              | `selection` | Detent/notch (like Apple Crown)                                 |
| Slider continuous drag                   | None        | Smooth, no buzz                                                 |
| Wizard step completed (all fields valid) | `success`   | Satisfying double-tap                                           |
| Validation error on "Next"               | `warning`   | Gentle "nope"                                                   |
| Delete project (after confirm)           | `heavy`     | Weighty, irreversible feel                                      |
| Pull-to-refresh release                  | `medium`    | Elastic snap                                                    |
| Toggle switch flip                       | `light`     | Crisp click                                                     |
| Results number changes                   | None        | Visual-only, haptics would be annoying during rapid slider drag |

#### Results Bottom Sheet

The floating results pill expands into a **native-feel bottom sheet** with three snap points:

```
Snap points:
  Collapsed (default):  56px visible — just the pill showing TEUI number
  Half:                 50vh — shows TEUI hero + benchmark bars
  Full:                 calc(100vh - header - safe-top) — full results + Sankey

Behavior:
  - Drag handle: 36px × 4px rounded pill, centered, var(--text-tertiary)
  - Swipe up from collapsed → snaps to half
  - Swipe up from half → snaps to full
  - Swipe down from full → snaps to half
  - Swipe down from half → snaps to collapsed
  - Tap pill when collapsed → snaps to half
  - Tap outside sheet when full → snaps to half

Physics:
  - Spring animation (damping: 0.8, stiffness: 300)
  - Velocity-aware: fast swipe overshoots slightly then settles
  - Rubber-band resistance when pulling beyond top snap
  - Background dims (overlay 0→0.3 opacity) as sheet rises

Backdrop:
  - Sheet has var(--bg-surface) background
  - Top border-radius: 16px (matches iOS sheet style)
  - Subtle shadow: 0 -4px 24px rgba(0,0,0,0.08)
  - Frosted glass optional: backdrop-filter blur on the sheet itself
```

#### Touch Gestures

```
Swipe left/right on content area:
  → Navigate between sub-sections within a tab
  → Direction-aware slide animation (250ms)
  → Haptic: light on swipe threshold
  → Elastic resistance at first/last section
  → Cancel if vertical scroll intent detected (>15° angle)

Pull-to-refresh (project list / results):
  → Custom pull indicator (not browser default)
  → Animated refresh icon: rotate 360° on release
  → Haptic: medium on release threshold
  → Content stays in place, indicator pulls down from top

Long press on project card:
  → Context menu (rename, duplicate, delete)
  → Haptic: heavy on activation
  → Card slightly lifts (scale 1.02, shadow increases)

Pinch-to-zoom on Sankey/charts:
  → Allow zoom on visualizations only
  → Double-tap to reset zoom
```

#### iOS/Android-Specific Polish

```
iOS:
  - Overscroll bounce (elastic) on all scroll containers — don't disable it
  - Status bar: light-content in dark mode, dark-content in light mode
  - Use -webkit-touch-callout: none on interactive elements (no callout menus)
  - Use -webkit-tap-highlight-color: transparent (we provide our own feedback)
  - Add apple-touch-icon (180×180) for home screen
  - Splash screens for all device sizes via apple-touch-startup-image

Android:
  - Material You dynamic color support via theme-color meta
  - Navigation bar color matches bottom nav background
  - Use maskable icons in manifest for adaptive icon support
  - beforeinstallprompt event → custom install banner

Both:
  - Touch targets: 48px minimum, 56px preferred
  - No hover-dependent interactions — everything works on tap
  - No 300ms tap delay (already handled by modern browsers with viewport meta)
  - Passive touch listeners for scroll performance
  - will-change: transform on animated elements
  - CSS contain: layout on heavy components (Sankey, charts)
```

#### Mobile Header (Frosted Glass)

```
┌──────────────────────────┐
│  OBJECTIVE    🌗  FR  ···│
└──────────────────────────┘

Height: 44px + safe-area-top (matches iOS nav bar height)
Background: semi-transparent with backdrop-filter blur

Left:   "OBJECTIVE" logotype (Geist Sans, font-semibold, text-lg)
Right:  Dark mode toggle (icon) | Language toggle (EN/FR text) | Overflow menu (···)

Overflow menu (···):
  → Settings
  → About
  → Install App (if not installed)
  → Help

The header scrolls away on scroll-down, returns on scroll-up
(headroom.js pattern). Transition: 200ms translateY.
```

#### Offline State (Mobile-Specific)

```
When offline:
  - Subtle banner slides down from under header:
    "You're offline. Changes save locally."
    Background: var(--info-100), text: var(--info-600)
    Dismissable, but returns if user tries network action

  - Climate data lookups show cached data with badge:
    "📍 Toronto (cached)" instead of "📍 Toronto"

  - No blocking modals, no error screens — everything works

  - When back online:
    Banner briefly shows "Back online ✓" in teal, then auto-dismisses (2s)
    Haptic: success
```

### Tablet Layout (768px–1023px)

```
┌──────────────────────────────────────┐
│  OBJECTIVE           EN | FR    ☾    │
├──────────┬───────────────────────────┤
│          │                           │
│  Wizard  │  [Current step content]   │
│  Steps   │                           │
│  (side)  │                           │
│          ├───────────────────────────┤
│  ① Proj  │  ┌─────────────────────┐  │
│  ② Build │  │  Results summary    │  │
│  ③ Bills │  │  TEUI: 123.4        │  │
│  ④ Envel │  └─────────────────────┘  │
│  ⑤ Sys   │                           │
│  ⑥ Renew │                           │
│  ⑦ Reslt │                           │
└──────────┴───────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────┐
│  OBJECTIVE                              EN | FR    ☾     │
├──────────┬───────────────────────┬───────────────────────┤
│          │                       │                       │
│  Wizard  │  [Input form]         │  [Live results]       │
│  Steps   │                       │                       │
│  (240px) │  Wall R-value  [===]  │  TEUI: 123.4          │
│          │  Window area   [===]  │  ████████████░░░░░░   │
│  ① Proj  │  Air tightness [===]  │                       │
│  ② Build │                       │  ┌─ Sankey ────────┐  │
│  ③ Bills │  [Envelope details]   │  │ Elec ─→ Heat    │  │
│  ④ Envel │                       │  │ Gas  ─→ Cool    │  │
│  ⑤ Sys   │                       │  │      ─→ Losses  │  │
│  ⑥ Renew │                       │  └─────────────────┘  │
│  ⑦ Reslt │                       │                       │
└──────────┴───────────────────────┴───────────────────────┘

The 40/60 split: Inputs 40% | Results 60%
Results panel is sticky (scrolls with content, doesn't disappear)
```

---

## 9. Micro-Interactions & Delight

### The "Aha" Moments

These are the small things that make users say "this is well-made":

1. **Slider drag → number dances**: As you drag an R-value slider, the TEUI number visibly counts down in real-time. The connection between action and impact is instant and visceral.

2. **Sankey reflow**: When you change a value, the Sankey paths smoothly morph — the "Heating Loss" band shrinks, the "Renewables" band grows. You _see_ the physics.

3. **Performance color shift**: The TEUI hero number transitions from rose → amber → teal as you improve the building. It's a game: make the number green.

4. **Step completion**: When all required fields in a wizard step are filled, a subtle checkmark appears on the step indicator with a gentle scale-in animation.

5. **Empty state illustration**: The first time you open the app, you see a clean architectural line drawing of a building with a gentle floating animation. "Create your first project" button below.

6. **Auto-save indicator**: A tiny, barely-noticeable "Saved" text fades in/out in the header after each change. Reassurance without intrusion.

7. **Keyboard shortcuts**: `Ctrl+Z` undoes the last change. `Ctrl+S` is a no-op (auto-saved) but shows a toast: "Already saved." `←/→` navigates wizard steps.

8. **Haptic feedback (mobile)**: A full haptic language — light taps for tab switches, medium for confirmations, selection pulses for slider detents, success patterns for saves. See Section 8 "Haptic Feedback System" for the complete map.

9. **Bottom sheet physics**: The results sheet has real spring physics — velocity-aware, rubber-band resistance, three snap points. It feels like an iOS Maps or Apple Music sheet.

10. **Frosted glass chrome**: Header and bottom nav use `backdrop-filter: blur(12px)` — content scrolls behind them with a subtle frosted effect, exactly like iOS native.

### What We DON'T Do

- No confetti, no celebrations, no gamification beyond the color shift
- No loading screens with "tips" or quotes
- No onboarding modals on first visit (optional tour via a "?" button)
- No sound effects
- No notification badges or urgency cues

---

## 10. Accessibility Specifics

### Focus Management

```css
/* Visible focus ring for keyboard users */
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--bg-surface),
    0 0 0 4px var(--energy-400);
}

/* No focus ring for mouse users */
:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}
```

### Screen Reader Announcements

```html
<!-- Results region announces updates -->
<div role="region" aria-label="Calculation results" aria-live="polite">
  <p>
    TEUI: 123.4 kilowatt hours per square metre per year. 62 percent of code maximum. 18 percent
    better than average.
  </p>
</div>

<!-- Wizard step changes announced -->
<div aria-live="assertive" class="sr-only">
  Step 4 of 7: Envelope. Enter wall, roof, and window insulation values.
</div>
```

### Chart Accessibility

Every chart has a companion data table (visually hidden by default, toggled with a button):

```html
<button aria-expanded="false" aria-controls="sankey-table">View as data table</button>
<table id="sankey-table" class="sr-only" role="table">
  <!-- Structured energy flow data -->
</table>
```

### Color Contrast Verification

| Pair                              | Ratio                           | Passes                                              |
| --------------------------------- | ------------------------------- | --------------------------------------------------- |
| text-primary on bg-base (light)   | `#1C1917` on `#FAFAFA` = 16.5:1 | AAA                                                 |
| text-secondary on bg-base (light) | `#57534E` on `#FAFAFA` = 6.8:1  | AA                                                  |
| energy-400 on bg-surface (light)  | `#FBBF24` on `#FFFFFF` = 1.9:1  | FAIL — use energy-600 `#D97706` for text (4.6:1 AA) |
| text-primary on bg-base (dark)    | `#FAFAF9` on `#0C0A09` = 19.4:1 | AAA                                                 |
| energy-400 on bg-surface (dark)   | `#FBBF24` on `#1C1917` = 8.6:1  | AAA                                                 |

**Rule**: Amber (`energy-400`) is for backgrounds and large UI elements only. For amber **text**, always use `energy-600` or `energy-700`.

---

## 11. Tailwind Config (Implementation)

```js
// tailwind.config.ts — key customizations
{
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Geist Mono', 'IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        stone: {/* Tailwind default stone palette — our neutral base */},
        energy: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        success: {
          50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4',
          300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6',
          600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A',
        },
        warning: {
          50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3',
          300: '#FDA4AF', 400: '#FB7185', 500: '#F43F5E',
          600: '#E11D48', 700: '#BE123C', 800: '#9F1239', 900: '#881337',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 4px 24px rgba(0,0,0,0.08)',
        'focus': '0 0 0 3px var(--energy-100)',
      },
    },
  },
}
```

---

## 12. Implementation Checklist

- [ ] Tailwind config with custom color tokens, fonts, shadows
- [ ] CSS custom properties for semantic colors (light + dark mode)
- [ ] Geist Sans + Geist Mono font loading in Next.js layout
- [ ] shadcn/ui theme override (stone base, energy accent, rounded-lg)
- [ ] Dark mode toggle (system default, manual override via `ui.ts` store)
- [ ] Card component (surface, hover, elevated variants)
- [ ] Button component (primary/secondary/ghost/destructive)
- [ ] Input component (with label, error, description)
- [ ] Slider component (with live value tooltip, snap points)
- [ ] Wizard stepper component (horizontal desktop, bottom bar mobile)
- [ ] TEUI hero number component (animated, color-coded)
- [ ] Sankey diagram component (D3, responsive, accessible)
- [ ] Benchmark bar chart component
- [ ] Skeleton loader components (matching content shapes)
- [ ] Toast notification system
- [ ] Responsive shell (3 breakpoint layouts)
- [ ] Mobile: bottom tab bar (4 tabs, frosted glass, safe areas)
- [ ] Mobile: results bottom sheet (3 snap points, spring physics)
- [ ] Mobile: haptic feedback utility (`src/lib/haptics.ts`)
- [ ] Mobile: swipe gestures (section navigation, sheet control)
- [ ] Mobile: frosted glass header with scroll hide/show
- [ ] Mobile: offline state banner + cached data badges
- [ ] Mobile: touch gestures (pull-to-refresh, long-press, pinch-zoom charts)
- [ ] PWA manifest (standalone, theme-color, splash screens)
- [ ] iOS meta tags (apple-mobile-web-app, status-bar-style, touch icons)
- [ ] Android adaptive icons (maskable) + install prompt
- [ ] Focus management (visible rings, skip-to-content)
- [ ] `prefers-reduced-motion` media query throughout (disables haptics too)
- [ ] WCAG contrast audit pass
