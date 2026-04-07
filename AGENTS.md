# Repository Guidelines

## Project Structure & Module Organization

`src/index.ts` is the CLI entrypoint. Core sync logic lives in `src/services/`: `serial.service.ts` handles series folders, `video.service.ts` handles flat video sync, `report.service.ts` writes reports, and `logger.service.ts` centralizes Winston logging. Settings loaders and types are under `src/services/settings/`, while runtime configuration lives in `settings.yml` and is resolved via `SETTINGS_PATH`. Build output goes to `dist/`; runtime logs go to `logs/`; sample or working data belongs in `data/`.

## Build, Test, and Development Commands

Use Node.js 20+.

- `npm run dev` runs the TypeScript sources with `tsx`.
- `npm run build` bundles `src/index.ts` with `@vercel/ncc` and copies config files to `dist/config`.
- `node dist/index.js` runs the production bundle after a build.
- `npm run run` executes the app through `ncc run`.
- `npx eslint .` checks JavaScript and TypeScript files.
- `npx prettier --write .` formats the repository.

## Coding Style & Naming Conventions

Prettier is the source of truth: 2-space indentation, single quotes, semicolons, trailing commas, and `printWidth: 100`. TypeScript runs in `strict` mode; keep types explicit at service boundaries. Follow the existing naming pattern: `*.service.ts` for service modules, `*.types.ts` for shared types, and lower-case file names. Prefer small, focused functions and keep config path handling centralized through `APP_DIR`.

## Testing Guidelines

There is no automated test suite in the repository yet. Until one is added, validate changes with `npx eslint .`, `npm run build`, and a manual run against safe local folders configured in `settings.yml`. When adding tests, place them near the related module or under a dedicated `tests/` folder and use `*.test.ts` names.

## Commit & Pull Request Guidelines

Recent history uses short, task-focused subjects such as `BugFix 20260407 #03`. Keep commit messages concise, one change per commit, and use the same style unless the team adopts a new convention consistently. Pull requests should describe the sync scenario changed, list config or file-system assumptions, and include sample console output or report/log snippets when behavior changes.

## Configuration & Safety

Do not commit real source or destination paths in `settings.yml` or secrets in `.env`. Test destructive flows, especially video sync, with disposable directories because copied video files are removed from the source after success.
