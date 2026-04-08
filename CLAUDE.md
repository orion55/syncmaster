# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncMaster is a Node.js/TypeScript CLI utility that synchronizes TV series and video files between source and destination folders, then writes a timestamped text report listing what was copied. User-facing log output is in Russian.

## Commands

- `npm run dev` — run from TypeScript source via `tsx` (uses `NODE_ENV=development` from `.env`)
- `npm run build` — bundle `src/index.ts` to a single `dist/index.js` with `@vercel/ncc`
- `npm run run` — `ncc run src/index.ts` (on-the-fly bundle + execute)
- `npx eslint .` — lint (no npm script wrapper); config is flat `eslint.config.js` with `@eslint/js` + `typescript-eslint` recommended
- `npx prettier --write .` — format (config in `.prettierrc`, 100 col, single quotes, trailing commas)

There are no tests in this project.

## Runtime Layout & `ROOT_DIR`

`src/appDir.ts` exports one constant:

```ts
export const ROOT_DIR =
  [moduleDir, process.cwd(), path.resolve(moduleDir, '..')].find((dir) => exists(dir, 'package.json')) ??
  moduleDir;
```

where `moduleDir = path.dirname(fileURLToPath(import.meta.url))`.

- **development** (`npm run dev`): `moduleDir` = `<repo>/src/` (no `package.json` there) → falls through to `process.cwd()` = `<repo>/` → `ROOT_DIR` = `<repo>/`
- **production** (ncc bundle): `moduleDir` = `<deploy-dir>/` (no `package.json`) → falls through to `?? moduleDir` → `ROOT_DIR` = `<deploy-dir>/`

All runtime directories are flat siblings of `ROOT_DIR` — no nested `src/` or `dist/` prefix:

```
<ROOT_DIR>/
├── fonts/     ← Big.flf (prod only, bundled by ncc)
├── logs/      ← syncmaster-YYYY-MM-DD.log, audit.json
└── report/    ← report_DDMMYYYY_HHMM.txt
```

Every module that touches the runtime folders imports `ROOT_DIR` and does `path.join(ROOT_DIR, 'logs')` etc. Settings are not resolved from `ROOT_DIR`: `settings.yml` is loaded through `SETTINGS_PATH` (falling back to `./settings.yml` from the project root). There is no `NODE_ENV` check and no `pathUtils.ts`.

`dotenv.config()` is called inside `logger.service.ts` (via `import * as dotenv from 'dotenv'` + an explicit `dotenv.config()` call — **not** a side-effect import). It is the single `.env` entry point for the whole app: do not re-initialize dotenv elsewhere and do not add side-effect imports to simulate env loading. This works because `src/index.ts` imports `logger.service` at line 2, before any module that reads env-driven config. **Invariant:** `logger.service` must remain the second import in `index.ts`. Do not reorder it.

## Architecture

Entry point `src/index.ts` is a linear pipeline:

1. `printSyncMaster()` — figlet banner
2. `loadSettings()` — reads `settings.yml` from `SETTINGS_PATH` into a `Settings` object with `series`, `editorial_video`, and `series_map` as an array of `{ src, dest }`
3. `syncSerial(settings.series, settings.series_map)` — series sync
4. `syncVideo(settings.editorial_video)` — generic video sync
5. `report({ series, editorial })` — writes the report file

All three sync functions return `null` when `enabled: false`, when source/dest folders don't exist, or when nothing was copied; `report()` skips any section whose input is `null`.

### `serial.service.ts` (series sync)

- Uses `series_map` from `settings.yml` as an array of `{ src, dest }` objects to drive which subfolders are synced and how they're renamed on the destination side.
- For each mapped folder, it renames each source file via `transformFileName`: first tries `EPISODE_REGEX = /\.s\d+\.?e(\d+)/i` to extract the episode number, then falls back to `LEADING_DIGITS_REGEX = /^(\d+)/`, otherwise keeps the original name.
- Skips any file with extension `.!qb` (qBittorrent in-progress marker).
- Does **not** delete source files after copying.
- Returns `Map<destFolderName, copiedCount>`.

### `video.service.ts` (generic video sync)

- Flat folder sync: no CSV, no subfolders.
- `trimFileName` truncates base names longer than `MAX_COUNT = 50` characters, preferring to break at the last space.
- **Deletes the source file after a successful copy** (`fs.unlinkSync`). This is the key behavioral difference from `serial.service.ts` — series are preserved at source, loose videos are moved.
- Returns `SyncResult { name, files[] }`.

### `report.service.ts`

- Builds sections for `series` (from `Map`) and `editorial` (from `SyncResult`), each sorted via `sortSeriesByKey`/`sortSyncResult` (locale-aware).
- Writes to `<ROOT_DIR>/report/report_DDMMYYYY_HHMM.txt` only if at least one section has content. Skips the file entirely when nothing was synced.
- Series section header is taken from `settings.series.name` (not hardcoded).

### `logger.service.ts`

Winston logger with two transports: colorized console and a daily-rotated file via `winston-daily-rotate-file`. Files live at `<logDir>/syncmaster-YYYY-MM-DD.log` with `20m` max size, `30d` retention, gzip archival, and an `audit.json` rotation manifest. `logDir` = `process.env.LOG_DIR` (resolved absolute) when set, otherwise `path.join(ROOT_DIR, 'logs')`. This module is also the project-wide dotenv entry point: it imports `* as dotenv from 'dotenv'` (namespace import) and calls `dotenv.config()` before reading any env var. Console uses `DD-MM-YYYY HH:mm:ss` timestamps; the file transport uses `YYYY-MM-DD HH:mm:ss`. Both transports share a `customFormat` printf that appends JSON-serialized meta and stack traces, with `Error` instances serialized via a custom replacer. The same transports are registered as `exceptionHandlers`, and `exitOnError: false` keeps the process alive on logged exceptions.

## Build Notes

- `@vercel/ncc` bundles everything into a single `dist/index.js`, including figlet fonts. The `clean-fonts` script (`del-cli`) removes all bundled fonts except `Big.flf` because `greeting.ts` only uses that font — keep this in sync if the banner font changes.
- `settings.yml` is external to the bundle and should be deployed alongside the app (or referenced by an absolute `SETTINGS_PATH`).
- `syncMaster.bat` at the repo root references `d:\Prog\syncmaster\index.js` — this is a local launcher for a deployed copy, not for running from the repo.
