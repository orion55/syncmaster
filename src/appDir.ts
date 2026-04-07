import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const hasFile = (baseDir: string, relativePath: string): boolean =>
  fs.existsSync(path.join(baseDir, relativePath));

const resolveProjectRoot = (): string => {
  const candidates = [process.cwd(), path.resolve(moduleDir, '..')];

  return candidates.find((candidate) => hasFile(candidate, 'package.json')) ?? process.cwd();
};

const resolveRuntimeDir = (projectRoot: string): string => {
  const candidates = [moduleDir, path.join(projectRoot, 'src'), path.join(projectRoot, 'dist')];

  return (
    candidates.find(
      (candidate) => hasFile(candidate, 'index.ts') || hasFile(candidate, 'index.js'),
    ) ?? moduleDir
  );
};

export const ROOT_DIR = resolveProjectRoot();
export const APP_DIR = resolveRuntimeDir(ROOT_DIR);
