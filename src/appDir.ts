import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const exists = (baseDir: string, ...files: string[]): boolean =>
  files.some((file) => fs.existsSync(path.join(baseDir, file)));

export const ROOT_DIR =
  [process.cwd(), path.resolve(moduleDir, '..')].find((dir) => exists(dir, 'package.json')) ??
  process.cwd();

export const APP_DIR =
  [moduleDir, path.join(ROOT_DIR, 'src'), path.join(ROOT_DIR, 'dist')].find((dir) =>
    exists(dir, 'index.ts', 'index.js'),
  ) ?? moduleDir;
