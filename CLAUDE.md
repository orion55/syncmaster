# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncMaster is a Node.js/TypeScript CLI utility that synchronizes TV series and video files between source and destination folders, then writes a timestamped text report listing what was copied. User-facing log output is in Russian.

## Commands

- `npm run dev` — run from TypeScript source via `tsx` (uses `NODE_ENV=development` from `.env`)
- `npm run build` — bundle `src/index.ts` to a single `dist/index.js` with `@vercel/ncc`, then prune `dist/fonts/` to keep only `Big.flf` and copy `src/config/*` to `dist/config`
- `npm run run` — `ncc run src/index.ts` (on-the-fly bundle + execute)
- `npx eslint .` — lint (no npm script wrapper); config is flat `eslint.config.js` with `@eslint/js` + `typescript-eslint` recommended
- `npx prettier --write .` — format (config in `.prettierrc`, 100 col, single quotes, trailing commas)

There are no tests in this project.

## Runtime Layout & the `getDir` Convention

`src/services/settings/pathUtils.ts` exports `getDir(folder)` which resolves paths differently depending on `NODE_ENV`:

- **development** (`npm run dev`): resolves to `<repo>/<folder>` — i.e. `src/config`, `src/logs`, `src/report`
- **production** (bundled `dist/index.js`): resolves relative to the bundled file — i.e. `dist/config`, `dist/logs`, `dist/report`

Every module that touches the filesystem for config, logs, or reports goes through `getDir` rather than hardcoding paths. When adding a new runtime resource folder, follow the same pattern and make sure the build script copies it into `dist/` (see `copy-config` script for the template).

`dotenv.config()` is called inside `pathUtils.ts`, so `.env` is the single source of truth for `NODE_ENV` — do not re-initialize dotenv elsewhere.

## Architecture

Entry point `src/index.ts` is a linear pipeline:

1. `printSyncMaster()` — figlet banner
2. `loadSettings()` — reads `config/setting.json` into a `Settings` object with three `SeriesSettings` blocks: `series`, `editorial_video`, `turkish_video` (each has `enabled`, `name`, `src`, `dest`)
3. `syncSerial(settings.series)` — series sync
4. `syncVideo(settings.editorial_video)` and `syncVideo(settings.turkish_video)` — generic video sync
5. `report({ series, editorial, turkish })` — writes the report file

All three sync functions return `null` when `enabled: false`, when source/dest folders don't exist, or when nothing was copied; `report()` skips any section whose input is `null`.

### `serial.service.ts` (series sync)

- Uses `loadCsv()` to read `config/soap.csv` (`;`-delimited `srcFolder;destFolder` mapping). The CSV drives which subfolders are synced and how they're renamed on the destination side.
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

- Builds sections for `series` (from `Map`), `editorial`, and `turkish` (from `SyncResult`), each sorted via `sortSeriesByKey`/`sortSyncResult` (locale-aware).
- Writes to `<reportDir>/report_DDMMYYYY_HHMM.txt` only if at least one section has content. Skips the file entirely when nothing was synced.

### `logger.service.ts`

Winston logger with two transports: colorized console and plain-text file at `<logDir>/syncmaster.log`. Both use `DD-MM-YYYY HH:mm:ss` timestamps. The log directory is created on import via `getDir('logs')`.

## Build Notes

- `@vercel/ncc` bundles everything into a single `dist/index.js`, including figlet fonts. The `clean-fonts` script (`del-cli`) removes all bundled fonts except `Big.flf` because `greeting.ts` only uses that font — keep this in sync if the banner font changes.
- `src/config/*` must be copied into `dist/config` for the production build to find `setting.json` / `soap.csv`; this is what `copy-config` does.
- `syncMaster.bat` at the repo root references `d:\Prog\syncmaster\index.js` — this is a local launcher for a deployed copy, not for running from the repo.
