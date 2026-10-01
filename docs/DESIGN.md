# 🎨 Design System

> **SMTrack – Precision. Clarity. Control.**
> This document defines the visual design system, UI components, and user experience guidelines for the Smart Meter GPS Tracking dashboard. The goal is a modern, map-first, operator-friendly interface with a consistent industrial feel — readable at a glance, in the office or in the field.

---

## 1. Design Principles

| 🧭 **Map-First** | 🎯 **Operator-Friendly** | 🧩 **Consistent** |
|:---:|:---:|:---:|
| The live map is the hero — every screen answers *"where is my asset?"* first. | Glanceable stats, big touch targets, zero training needed for field staff. | One token system (colors, spacing, type) reused across every feature. |

Supporting principles:
- **Status over decoration** – color always communicates tracker state, never just style
- **Calm by default** – muted warm surfaces; only alerts and live data pop
- **Responsive & dark-mode native** – same tokens drive light/dark themes

---

## 2. Color Palette

Primary colors used across the application (from `src/index.css` tokens):

| Swatch | Token | Value | Usage |
|---|---|---|---|
| 🟧 | `--primary` | `hsl(24 85% 58%)` ≈ `#EF8239` | Main brand color — buttons, links, active states, brand mark |
| ⬛ | `--background` | `hsl(30 25% 97%)` ≈ `#F9F4F0` | Warm off-white app background (light mode) |
| ⬛ | `--foreground` | `hsl(225 20% 15%)` ≈ `#1E2430` | Primary text |
| 🟩 | `--success` | `hsl(150 55% 42%)` ≈ `#30A66B` | Success messages, **Installed** status, online trackers |
| 🟨 | `--warning` | `hsl(38 92% 55%)` ≈ `#F67023` | Warnings, **In-Storage** status, battery ≤ 30% |
| 🟥 | `--destructive` | `hsl(0 72% 55%)` ≈ `#DF3A3A` | Errors, **Low battery** alerts, destructive actions |
| 🟦 | `--info` | `hsl(210 75% 55%)` ≈ `#368CE2` | Info banners, **In-Transit** status, moving trackers |
| ⬜ | `--muted` | `hsl(30 12% 94%)` | Subtle backgrounds, secondary text, **Detached** state |
| 🔲 | `--border` | `hsl(30 15% 90%)` | Card & input borders |

### Status Marker Colors (Map)

| Status | Color | Token |
|---|---|---|
| 🟦 In-Transit | Blue | `--info` |
| 🟨 In-Storage | Amber | `--warning` |
| 🟩 Installed | Green | `--success` |
| ⬜ Detached | Gray | `--muted-foreground` |
| 🟥 Low Battery (< 20%) | Red ring/pulse | `--destructive` |

### Dark Mode
`.dark` flips surfaces to deep slate (`hsl(225 30% 8%)` background, `hsl(225 25% 12%)` cards) while **brand orange and all status colors stay identical** — the map must read the same day or night.

### Glassmorphism (accent surfaces)
Navbars/overlays may use `--glass-bg` (65% alpha card) + `--glass-blur: 20px` + subtle `--glass-glow` border. Never stack glass on glass.

---

## 3. Typography

We use **Inter** as the primary font for a clean, modern and highly readable UI; **JetBrains Mono** for device IDs, coordinates and telemetry.

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Display | Inter | 48–60px | 800 | Landing hero |
| H1 | Inter | 36px / 2.25rem | 700 | Page titles |
| H2 | Inter | 24px | 600 | Section titles |
| H3 | Inter | 18px | 600 | Card titles |
| Body | Inter | 14–16px | 400 | Default text |
| Small | Inter | 12–13px | 500 | Labels, captions, badges |
| Mono | JetBrains Mono | 13px | 500 | `device_id`, lat/lng, timestamps |

- Line-height: 1.5 body, 1.2 headings
- Max paragraph width: ~70ch
- Numbers in stats use `tabular-nums` so tickers don't jitter

---

## 4. UI Components

Standard components (shadcn/ui in `src/shared/components/ui/`) to be used throughout the app:

### Buttons
| Variant | Look | When |
|---|---|---|
| **Primary** | Orange fill, white text | Main actions — *Track*, *Save*, *Assign* |
| **Secondary** | Muted fill, dark text | Supporting actions — *Filter*, *Export* |
| **Destructive** | Red fill | *Delete tracker*, *Remove geofence* |
| **Outline / Ghost** | Border / text-only | Toolbar & table row actions |

- Height: 40px (default), 36px (sm); radius = `--radius` (14px) rounded-lg feel
- Always show loading spinner state on async actions

### Cards
White (`--card`) surface, 1px `--border`, 14px radius, subtle shadow. Stat cards pair an icon chip + big `tabular-nums` value + delta caption.

### Badges (status)
Pill badges, 12px semibold: green *Installed*, blue *In-Transit*, amber *In-Storage*, gray *Detached*, red *Low Battery*.

### Tables
Sticky header, zebra-free rows with hover tint, right-aligned numerics, status badge column, row click → detail page.

### Forms
`react-hook-form` + zod; labels above inputs; validation errors in `--destructive` below the field; inputs 40px with visible focus ring (`--ring`).

### Dialogs & Drawers
Radix Dialog (shadcn) for confirmations (delete = destructive variant + typed confirmation for irreversible actions); Sheet/drawer for tracker quick-view from map.

### Toasts
`sonner` — success (green check), error (red), info (blue). Auto-dismiss 4s; critical alerts persist until dismissed.

### Empty / Loading / Error States
Every list & map has all three: skeleton loaders (pulse), friendly empty illustration + CTA, retry-able error card. **Never a blank screen.**

---

## 5. Layout & Spacing

- **Spacing scale:** 4px base — `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`
- **App shell:** fixed sidebar (240px, collapsible to 64px) + top bar (notifications, theme toggle, user menu) + content area (max-w ~1400px, 24px gutters)
- **Dashboard grid:** stat cards `4-up` → `2-up` (tablet) → `1-up` (mobile); map fills remaining height (min 420px)
- **Radius:** cards/inputs `14px`, badges & chips `999px`, buttons `10–14px`
- **Elevation:** shadows are soft & rare — `shadow-sm` rest, `shadow-md` hover/popover

---

## 6. Iconography

- **Library:** lucide-react only — no mixed icon sets
- Size: 20px inline, 24px nav, 16px inside badges
- Stroke width 2; icons inherit `currentColor`
- Status icons: `Navigation` (in-transit), `Warehouse` (storage), `Home`/`PlugZap` (installed), `Unlink` (detached), `BatteryLow` (alerts)

---

## 7. Motion & Micro-interactions

- **GSAP** for landing-page entrance (hero fade-up, stagger) — keep durations 0.4–0.8s, ease-out
- Map markers: smooth `setView` fly-to on select; low-battery pulse via CSS animation
- Hover transitions: `150ms ease` on cards/buttons; **no** motion over 800ms, respect `prefers-reduced-motion`

---

## 8. Accessibility

- ✅ Contrast ≥ 4.5:1 for text (status colors are fills with white/black text, verified)
- ✅ Full keyboard nav: map focusable, marker list mirrors map for screen readers
- ✅ Focus rings always visible (`--ring`), never removed
- ✅ Icon-only buttons carry `aria-label`
- ✅ Color is never the only status cue — badge text + icon always accompany it

---

## 9. Do's & Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use design tokens (`hsl(var(--primary))`) | Hardcode hex values in components |
| Use lucide icons at set sizes | Mix emoji/icon libraries in UI chrome |
| Show a badge + text for every status | Encode status in color alone |
| Keep dark mode token-driven | Add per-component `dark:` overrides |
| Skeletons for loading data | Spinners-only or blank sections |
| Consistent 4px spacing rhythm | Arbitrary margins (7px, 15px…) |

---

*Any new UI pattern must be added here first, then implemented — the design system is the single source of visual truth.*
