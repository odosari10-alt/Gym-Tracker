# Gym Tracker — Personal Workout Logging PWA

A single-user, offline-first gym tracking Progressive Web App that runs entirely in the browser with no backend. Log workouts, track sets/reps/weight, browse an exercise library, follow preset workout schedules, and visualize progress with charts.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** (using `@import "tailwindcss"` and `@theme` blocks)
- **sql.js** (SQLite compiled to WASM, runs in browser)
- **idb-keyval** (IndexedDB persistence for the SQLite database)
- **Recharts** (charts — LineChart, BarChart)
- **lucide-react** (icons)
- **date-fns** (date formatting)
- **vite-plugin-pwa** (service worker + installable PWA)
- **react-router v7** (client-side routing)

## Architecture

**No server.** sql.js runs SQLite in the browser via WebAssembly. The database is persisted to IndexedDB via `idb-keyval` and auto-saved on a debounced timer after mutations. The entire app stays under 1MB of data for years of personal use.

### Critical: sql.js + Vite Compatibility

Vite's CJS-to-ESM conversion silently breaks sql.js `db.run()` and `db.exec()` parameter binding. **All parameterized SQL must use the prepared statement API** via the helpers in `src/db/queryHelper.ts`:

- `query(db, sql, params)` — for SELECT statements, returns `unknown[][]`
- `execute(db, sql, params)` — for INSERT/UPDATE/DELETE, returns void
- `db.exec(sql)` — only for multi-statement SQL **without** parameters (schema, pragmas)

**Never use `db.run(sql, params)` or `db.exec(sql, params)` directly.**

## Database Schema (8 tables)

| Table | Purpose |
|---|---|
| `muscle_groups` | 6 groups: Chest, Back, Legs, Shoulders, Arms, Core |
| `exercises` | Exercise library (71+ seeded + custom), FK to muscle_groups |
| `workouts` | One row per gym session (started_at, finished_at, notes) |
| `workout_exercises` | Which exercises were done in a workout (sort_order, notes) |
| `sets` | Individual sets: weight_kg, reps, set_number, is_warmup, rpe |
| `templates` | Workout schedule templates (6 presets + custom) |
| `template_days` | Days within a template (e.g. Push, Pull, Legs) |
| `template_day_exercises` | Exercises assigned to each template day |

- Weight stored in **kg**; UI converts to lbs via `convertWeight()` if user prefers
- **Epley 1RM** computed at query time: `weight * (1 + reps / 30)`
- `is_warmup` flag excludes warmup sets from analytics
- Unfinished workouts detected by `finished_at IS NULL` (resume on refresh)

## Project Structure

```
src/
├── db/
│   ├── database.ts          # sql.js init, IndexedDB load/save, export/import
│   ├── schema.ts            # CREATE TABLE statements (8 tables)
│   ├── seed.ts              # 71+ exercises across 6 muscle groups
│   ├── seedTemplates.ts     # 6 preset workout schedules
│   ├── queryHelper.ts       # query() and execute() — MUST use for all parameterized SQL
│   ├── hooks/
│   │   └── useDatabase.tsx  # React context provider (db, unit, setUnit, save)
│   └── queries/
│       ├── exercises.ts     # CRUD, search, filter by group
│       ├── workouts.ts      # Start, finish, delete, add/remove exercises
│       ├── sets.ts          # Add, update, delete sets (with renumbering)
│       ├── analytics.ts     # Progress, e1RM, volume/week, PRs, weekly summaries
│       └── templates.ts     # Template CRUD, startWorkoutFromDay, addTemplateDayToWorkout
├── pages/
│   ├── HomePage.tsx         # Dashboard: weekly stats, recent workouts, FAB
│   ├── WorkoutPage.tsx      # Active workout: add exercises/templates, log sets
│   ├── WorkoutDetailPage.tsx # View past workout (read-only, deletable)
│   ├── HistoryPage.tsx      # All past workouts chronologically
│   ├── ExercisesPage.tsx    # Browse/search exercise library by muscle group
│   ├── ExerciseDetailPage.tsx # Per-exercise charts, PRs, history
│   ├── AnalyticsPage.tsx    # Volume trends, weekly summaries, PRs
│   ├── SettingsPage.tsx     # Unit toggle (kg/lb), export/import database
│   ├── TemplatesPage.tsx    # List presets + custom templates, create/delete
│   └── TemplateDetailPage.tsx # View/edit template days and exercises, start workout
├── components/
│   ├── layout/              # AppShell, BottomNav (5 tabs), Header
│   ├── workout/             # ExercisePicker, SetRow, ExerciseCard, WorkoutTimer
│   ├── exercises/           # ExerciseList, ExerciseForm, MuscleGroupFilter
│   ├── analytics/           # ProgressChart, VolumeChart, OneRMChart, PRBadge, WeeklySummaryCard
│   └── ui/                  # Button, Input, Modal, Card, ConfirmDialog
├── lib/
│   ├── formulas.ts          # Epley 1RM, tonnage, unit conversion (convertWeight, toKg, formatWeight)
│   ├── dates.ts             # formatDate, formatTime, durationMinutes, nowISO
│   └── constants.ts         # DB_KEY, AUTOSAVE_DELAY_MS
└── types/index.ts           # All TypeScript interfaces
```

## Features

### Workout Logging
- Start a workout from the home FAB button
- Add individual exercises or load a full template day
- Log sets with weight and reps — inputs use `inputMode="decimal"` / `"numeric"` for mobile keyboards
- Toggle warmup flag per set (excluded from analytics)
- Delete individual sets (remaining sets auto-renumber)
- Remove exercises from the active workout
- Finish workout (saves with timestamp) or discard
- Resume unfinished workouts on page refresh

### Exercise Library
- 71+ pre-loaded exercises across 6 muscle groups (Chest, Back, Legs, Shoulders, Arms, Core)
- Search by name, filter by muscle group with pill-shaped tags
- Add custom exercises
- Delete custom exercises (preset exercises protected)
- Per-exercise detail page with weight progression and e1RM charts

### Workout Templates
- 6 preset schedules with full exercise lists:
  1. **Push / Pull / Legs (PPL)** — 3 days
  2. **Upper / Lower Split** — 4 days (A/B variants)
  3. **Bro Split** — 5 days (Chest, Back, Shoulders, Arms, Legs)
  4. **Full Body** — 3 sessions (A/B/C)
  5. **PPLUL Hybrid** — 5 days (Push, Pull, Legs Heavy, Upper Hypertrophy, Lower Hypertrophy)
  6. **Anterior / Posterior Split** — 4 days (A/B variants)
- Create custom templates with custom days
- Add/remove exercises from any template day
- Start a workout from any template day — pre-loads exercises with empty sets
- "Add Template" button on workout page to load a template mid-workout

### History & Analytics
- Full workout history with date, exercise count, sets, volume, duration
- Delete any past workout (with confirmation)
- Weekly summary cards (workouts, sets, volume)
- Volume bar chart (12-week trend)
- Weight progression line chart per exercise
- Estimated 1RM line chart per exercise
- Personal records list with exercise, weight, reps, e1RM, date

### Settings
- Toggle weight unit between kg and lb (persisted in localStorage)
- Export database as `.db` file (backup)
- Import previously exported database (replaces all data)

## Design System

**Dark mode only.** High contrast, minimal, utilitarian — a "pro tool" feel.

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#0A0A0A` | Base background |
| `--color-surface` | `#1A1A1A` | Card surfaces, elevated containers |
| `--color-surface-hover` | `#252525` | Hover state for surfaces |
| `--color-primary` | `#FF6B00` | Orange accent — headings, CTAs, active states, charts |
| `--color-primary-hover` | `#FF8C00` | Lighter orange for hover |
| `--color-border` | `#2A2A2A` | General borders |
| `--color-border-input` | `#4A3520` | Orange-tinted input borders |
| `--color-text-primary` | `#FFFFFF` | Headings, numbers, primary content |
| `--color-text-secondary` | `#B0B0B0` | Labels, subtitles |
| `--color-text-muted` | `#666666` | Timestamps, placeholders |
| `--color-danger` | `#FF3B30` | Delete/remove actions |
| `--color-success` | `#FF6B00` | Confirmation (uses orange) |

### Typography
- **Font:** Inter (Google Fonts), fallback to system sans-serif
- **Headings:** `font-extrabold tracking-tight` (800 weight)
- **Labels:** `text-[10px] font-semibold uppercase tracking-wide`
- **Data values:** `font-bold` or `font-extrabold`
- **Body:** `font-medium` (500 weight)

### Component Patterns
- Cards: `rounded-2xl`, no visible borders, surface color separation
- Buttons: `rounded-xl`, `active:` press states, orange for primary CTA
- Inputs: orange-tinted borders (`border-input`), `rounded-xl`, 16px font to prevent iOS zoom
- Modals: slide from bottom on mobile, centered on desktop, `#121212` background, orange title
- Pill tags: orange border + transparent fill for filter chips (Volume, 1RM, Weight)
- Inline text buttons: "+ ADD SET", "+ Add Exercise" as orange text (not full buttons)
- Bottom nav: thin-line icons (`strokeWidth={1.5}`), black background, 5 tabs
- FAB: orange circle with shadow glow, `active:scale-95` press animation
- Delete actions: red trash icon, always behind confirmation dialog

### Mobile Optimizations
- Safe area insets for notched phones (iPhone X+)
- 44px minimum touch targets on touch devices (`@media (pointer: coarse)`)
- `-webkit-tap-highlight-color: transparent`
- `overscroll-behavior: none` to prevent pull-to-refresh
- `inputMode="decimal"` / `"numeric"` for proper mobile keyboards
- `text-base` (16px) on inputs to prevent iOS auto-zoom
- `overflow: hidden` on html/body to prevent rubber-banding
- PWA installable (service worker via vite-plugin-pwa)

## Routes

| Path | Page | Nav |
|---|---|---|
| `/` | HomePage | Bottom tab: Home |
| `/workout` | WorkoutPage | Full-screen (no bottom nav) |
| `/workout/:id` | WorkoutDetailPage | Full-screen (no bottom nav) |
| `/history` | HistoryPage | Accessed from Home "View all" |
| `/templates` | TemplatesPage | Bottom tab: Templates |
| `/templates/:id` | TemplateDetailPage | Navigated from TemplatesPage |
| `/exercises` | ExercisesPage | Bottom tab: Exercises |
| `/exercises/:id` | ExerciseDetailPage | Navigated from ExercisesPage |
| `/analytics` | AnalyticsPage | Bottom tab: Analytics |
| `/settings` | SettingsPage | Bottom tab: Settings |

## Running

```bash
npm install
npm run dev      # Development at http://localhost:5173
npm run build    # Production build to dist/
```

The `sql-wasm.wasm` file must be in `public/` (already included).
