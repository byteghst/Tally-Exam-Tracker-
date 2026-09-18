# Exam Tracker

A personal, manual-first exam/deadline/syllabus/task tracker. Local-first
(IndexedDB via Dexie), PWA-ready, built for later Capacitor/APK wrapping.

This repo currently contains **Phase 1 (Foundation)** from the build plan:
project scaffold, data model, scoring/date engines with tests, IndexedDB
repositories, Zustand stores, core UI primitives, the responsive app shell
(sidebar + bottom nav), and every route wired to real (not placeholder) pages.

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run test      # run unit tests (scoring + date engine)
npm run build     # production build
```

## What's implemented

- **Data model** — `src/types/index.ts`
- **Scoring engine** (positive/negative marking, manual override, validation) — `src/lib/scoring/`
- **Date engine** (local-date-safe, recurrence expansion, overdue logic) — `src/lib/dates/`
- **Persistence** — IndexedDB via Dexie (`src/data/db.ts`), one object store per
  entity, plus a generic repository factory (`src/data/repositories/`)
- **Backup/restore** — JSON export/import with schema validation and merge/replace
  modes (`src/data/backup.ts`)
- **State** — Zustand stores per domain (`src/store/`)
- **UI primitives** — Button, Input, GlassCard, Progress bar/ring, Badge/EmptyState
  (`src/components/ui/`)
- **App shell** — collapsible desktop sidebar, mobile bottom nav + "More" sheet,
  toast/undo stack (`src/components/layout/`)
- **Pages** — Dashboard (fully live), Exams (list + detail), Deadlines, Tasks,
  Syllabus, Analytics, History, Settings (`src/pages/`)
- **Theme system** — light/dark/system, glass intensity/blur/radius all driven by
  CSS variables from Settings (`src/hooks/useTheme.ts`)

## Not yet implemented (next phases)

- Add/Edit forms for exams, deadlines, tasks, syllabus items (buttons exist,
  forms don't yet)
- Command palette (⌘K), global search, quick-add sheet
- Calendar view (month/week/day/agenda)
- Recurring-task UI (the engine in `taskRepository.ensureRecurringInstances`
  already works — needs a form to configure it)
- Onboarding flow, demo data seeding
- Notification scheduling
- PWA icons (the manifest in `vite.config.ts` references
  `public/icons/icon-192.png` and `icon-512.png` — add real icon files there)
- Keyboard shortcuts, accessibility pass, visual QA pass

## Project structure

```
src/
  components/ui/       reusable design-system primitives
  components/layout/   app shell, navigation, toasts
  components/widgets/  (reserved for dashboard widget components)
  pages/               one file per route
  data/                Dexie schema + repositories + backup logic
  store/               Zustand state, one slice per domain
  lib/scoring/          scoring engine + tests
  lib/dates/            date/recurrence utilities + tests
  lib/validation/       (reserved for zod form schemas)
  hooks/                 useTheme, etc.
  types/                 shared TypeScript interfaces
```

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Phase 1: foundation - data model, scoring/date engines, stores, app shell"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
