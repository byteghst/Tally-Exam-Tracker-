# Tally

A personal, manual-first exam / deadline / syllabus / task tracker. Local-first
(IndexedDB via Dexie), installable as a PWA, and structured to be wrapped into
an Android APK with Capacitor later if needed.

Nothing here is auto-graded, auto-ranked, or synced anywhere — every exam
result, deadline, and task is entered by hand and stored only on this device.

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run test      # run unit tests
npm run build     # production build
npm run preview -- --host   # serve the production build locally (e.g. to test PWA install)
```

## Features

- **Exams** — manual entry of daily/weekly results: total questions, marks,
  positive/negative marking, correct/wrong/unanswered, rank, participants,
  manual score override, notes. Live score preview while entering results.
  Edit, duplicate, and archive (with confirmation) from the detail page.
- **Deadlines** — title, date/time, priority, category, reminder offset,
  description/notes. Mark complete or delete (with confirmation).
- **Tasks** — one-off or recurring (daily / weekdays / weekly / custom days),
  with an end date. Recurring instances are generated automatically up to 60
  days ahead whenever a recurring task is created or edited.
- **Syllabus** — a self-built hierarchy (course → chapter → topic → subtopic,
  or as flat as you like). Recursive expand/collapse tree, per-node progress
  state and percentage. Deleting a node promotes its children up one level
  rather than losing them.
- **Calendar** — month grid with dot markers for what's on each day (exam /
  deadline / task), plus an agenda list for the selected day with inline
  complete/edit actions.
- **Dashboard** — configurable widgets (today's tasks, upcoming exam, next
  deadline, syllabus progress) — show/hide and reorder from Settings.
- **Command palette** (tap the search bar, or Ctrl/Cmd+K) — search across
  exams, deadlines, tasks, and syllabus by name, plus quick-add actions that
  jump straight to the right form.
- **Analytics** — exam score trend over time and a 14-day task completion
  rate chart, plus current totals/averages.
- **History** — a real activity log: every add/edit/complete/delete across
  all four entity types is recorded and shown with a per-type icon.
- **Import / Export** — export all data as a JSON backup; import with a
  preview (counts per entity) and a choice of merge or full replace.
- **Settings** — theme (light/dark/system), glass intensity, blur, corner
  radius, motion level (full/reduced/none), dashboard layout, backup.
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
      settings/           ImportDialog
      onboarding/         OnboardingOverlay
  pages/                 one file per route
  data/
    db.ts                Dexie schema — one IndexedDB object store per entity
    repositories/         generic CRUD factory + per-entity repositories
    backup.ts             export/import/validate backup logic
    activityLog.ts         writes History entries
  store/                  Zustand state, one slice per domain
  lib/
    scoring/               scoring engine + tests
    dates/                 date/recurrence/calendar-grid utilities + tests
    validation/             zod schemas per form + tests
    dashboardWidgets.ts     dashboard widget registry/normalization
  hooks/                   useTheme, useOpenAddFromNavState
  types/                   shared TypeScript interfaces
```

## Known limitations / deliberate simplifications

- **Calendar** is month view + day agenda only — no separate week/day views.
- **Deletions use a confirm-before-delete dialog**, not a delete-then-undo
  toast.
- **No dedicated "erase all data" button** — Export/Import (replace mode)
  covers that need, but it's not a single dedicated wipe action.
- **Command palette search results** for deadlines/tasks/syllabus navigate to
  that section's list rather than opening the exact item directly (exams do
  open directly, since they have their own detail route).
- **Recurring tasks** materialize 60 days of future instances at a time —
  opening the app after a longer gap may need one more edit/save cycle on the
  recurring task to extend the horizon further.
- **History** only has entries from when activity logging was added — data
  created before that point won't retroactively appear there.
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
