# Tally

A personal, manual-first exam / deadline / syllabus / task tracker. Local-first
(IndexedDB via Dexie), installable as a PWA, and structured to be wrapped into
an Android APK with Capacitor later if needed.

Nothing here is auto-graded, auto-ranked, or synced anywhere — every exam
result, deadline, and task is entered by hand and stored only on this device.
Every "intelligent" feature below (Focus Now, Daily Mission, Momentum,
Milestones) is a deterministic function over that same real data — there's no
AI, no fabricated stats, and no hidden state you can't see reflected in the
records you actually entered.

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run test      # run unit tests
npm run build     # production build
npm run preview -- --host   # serve the production build locally (e.g. to test PWA install)
```

## Features

- **Dashboard** — a real greeting (time-of-day + optional name + a
  data-driven summary line, not a generic banner), a 7-day Momentum strip,
  a single "Focus Now" recommendation, a dismissible Daily Mission, and a
  configurable widget grid below (today's tasks, next exam, next deadline,
  syllabus progress — show/hide, reorder, and choose comfortable/compact
  density from Settings).
- **Exams** — manual entry of daily/weekly results: total questions, marks,
  positive/negative marking, correct/wrong/unanswered, rank, participants,
  manual score override, notes. Live score preview while entering results.
  The detail page shows a real score/rank comparison against the previous
  exam of the same type when one exists. Edit, duplicate, and archive (with
  undo) from the detail page.
- **Deadlines** — title, date/time, priority, category, reminder offset,
  description/notes. Mark complete or delete (with undo).
- **Tasks** — one-off or recurring (daily / weekdays / weekly / custom days),
  with an end date. Recurring instances are generated automatically up to 60
  days ahead whenever a recurring task is created or edited. Delete supports
  undo.
- **Syllabus** — a self-built hierarchy (course → chapter → topic → subtopic,
  or as flat as you like). Recursive expand/collapse tree, per-node progress
  state and percentage. Deleting a node promotes its children up one level
  rather than losing them, and the whole delete (node + any reparenting) is
  undoable via the toast.
- **Calendar** — month grid with dot markers for what's on each day (exam /
  deadline / task), plus an agenda list for the selected day with inline
  complete/edit actions.
- **Command palette** (tap the search bar, or Ctrl/Cmd+K) — search across
  exams, deadlines, tasks, and syllabus by name, plus quick-add actions that
  jump straight to the right form.
- **Analytics** — exam score trend over time, a 14-day task completion rate
  chart, current totals/averages, and a Milestones list (first exam, 10
  exams, 10 tasks completed, 7/30 productive days, highest score, best rank,
  biggest score improvement, syllabus 100% — each derived from real records,
  with an actual achieved-on date pulled from the activity log where one
  makes sense).
- **History** — a real activity log: every add/edit/complete/delete across
  all four entity types is recorded and shown with a per-type icon. This is
  also what powers Momentum and Milestones — no separate tracking system.
- **Import / Export** — export all data as a JSON backup; import with a
  preview (counts per entity) and a choice of merge or full replace.
- **Settings** — personal name (greeting only), theme (light/dark/system),
  glass intensity, blur, motion level, dashboard density, per-widget
  visibility/order, Momentum/Focus Now/Daily Mission toggles, backup, and a
  confirmed reset-to-default.
- **Onboarding** — a single first-run welcome screen explaining the five
  sections; dismiss once, stored in Settings.
- **PWA** — installable, offline-capable app shell, real home-screen icons.

## Project structure

```
src/
  components/
    ui/                reusable design-system primitives (Button, Input,
                        GlassCard, Sheet, ConfirmDialog, Progress, Badge...)
    layout/             app shell, sidebar, bottom nav, top bar, command
                        palette, toast stack
    widgets/            individual Dashboard widget components
    features/
      exams/            ExamForm (shared add/edit)
      deadlines/         DeadlineForm
      tasks/             TaskForm (incl. recurrence config)
      syllabus/           SyllabusForm, SyllabusTree
      calendar/           CalendarGrid, DayAgenda
      analytics/          ExamScoreTrendChart, TaskCompletionTrendChart
      dashboard/          DashboardGreeting, MomentumCard, FocusNowCard,
                          DailyMission
      settings/           ImportDialog
      onboarding/         OnboardingOverlay
  pages/                 one file per route
  data/
    db.ts                Dexie schema — one IndexedDB object store per entity
    repositories/         generic CRUD factory (incl. `restore()` for undo)
                        + per-entity repositories
    backup.ts             export/import/validate backup logic
    activityLog.ts         writes History entries
  store/                  Zustand state, one slice per domain
  lib/
    scoring/               scoring engine + tests
    dates/                 date/recurrence/calendar-grid utilities + tests
    validation/             zod schemas per form + tests
    dashboardWidgets.ts     dashboard widget registry/normalization
    focusNow.ts             deterministic next-action engine + tests
    dailyMission.ts         derived daily checklist + tests
    momentum.ts             7-day + all-time productivity derivation + tests
    milestones.ts           achieved-milestone derivation + tests
    examComparison.ts       score/rank vs. previous same-type exam + tests
    greeting.ts             time-of-day + data-driven summary line + tests
  hooks/                   useTheme, useOpenAddFromNavState
  types/                   shared TypeScript interfaces
```

## Known limitations / deliberate simplifications

- **Calendar** is month view + day agenda only — no separate week/day views.
- **Deletions use an instant action + "Undo" toast**, not a confirm dialog —
  the one exception is **Reset settings**, which has no undo, so it keeps a
  confirm step.
- **No dedicated "erase all data" button** — Export/Import (replace mode)
  covers that need, but it's not a single dedicated wipe action.
- **Command palette search results** for deadlines/tasks/syllabus navigate to
  that section's list rather than opening the exact item directly (exams do
  open directly, since they have their own detail route).
- **Recurring tasks** materialize 60 days of future instances at a time —
  opening the app after a longer gap may need one more edit/save cycle on the
  recurring task to extend the horizon further.
- **History** only has entries from when activity logging was added — data
  created before that point won't retroactively appear there, and any
  Momentum/Milestone derived from it inherits that same starting point.
- **The exam countdown card's "syllabus progress" is overall progress**, not
  progress specific to that exam — the data model doesn't link syllabus
  items to individual exams, so it's labeled honestly rather than implying a
  connection that isn't there.
- **Daily Mission** only ever includes two item types (today's tasks,
  in-progress syllabus) — a third "review your last exam" item was
  deliberately left out, since there's no real "reviewed" flag in the data
  model and fabricating one just to populate a checklist felt worse than not
  having the item.
- **Notification scheduling** (the `reminderMinutesBefore` fields on
  deadlines/tasks) is stored but not yet wired to actual OS notifications.

## Git workflow

This repo is already connected to GitHub (`origin`, branch `main`). Normal
flow for future changes:

```bash
git add -A
git commit -m "describe the change"
git push
```
