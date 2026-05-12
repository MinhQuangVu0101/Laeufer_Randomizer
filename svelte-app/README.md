# Laeufer Randomizer — Svelte App

Volleyball team generator. Svelte 5 + Vite + TypeScript + PWA.

## Local development

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/Laeufer_Randomizer/`.

## Tests

```sh
npm test            # watch mode
npm test -- --run   # single run
npm run check       # TypeScript + Svelte
```

## Production build

```sh
npm run build
```

Output goes to `dist/`. The GitHub Actions workflow at
`../.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every
push to `main`.

## Architecture

- `src/lib/constants.ts` — Modes, position metadata, storage keys
- `src/lib/domain/` — Pure algorithm (backtracking + shuffle-split) + tests
- `src/lib/stores/` — Reactive Svelte 5 stores (Setter pattern, no `$effect` in `.svelte.ts`)
- `src/lib/migrations.ts` — One-shot v1→v2 localStorage migration (idempotent)
- `src/lib/i18n/` — German + English dictionaries
- `src/lib/components/` — Svelte 5 components
- `src/App.svelte` — Top-level component composition

## Cutover from vanilla JS app

This svelte build replaces the vanilla HTML/JS app that lived at the repo root.
The old files are preserved at the repo root for rollback safety. After this
build is stable in production (≥1 week), the legacy files can be removed in a
follow-up PR.

To activate the new build:
1. Merge this PR
2. In GitHub repo settings → Pages, change Source from "Deploy from a branch"
   to "GitHub Actions"
3. The Action triggered by the merge commit will deploy `svelte-app/dist`

To roll back:
1. Repo settings → Pages → Source = "Deploy from a branch" (main)
2. Vanilla app at repo root is served again
