import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const exists = (baseDir: string, file: string): boolean =>
  fs.existsSync(path.join(baseDir, file));

export const ROOT_DIR =
  [moduleDir, process.cwd(), path.resolve(moduleDir, '..')].find((dir) => exists(dir, 'package.json')) ??
  moduleDir;
