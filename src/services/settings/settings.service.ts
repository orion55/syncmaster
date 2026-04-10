import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { Settings } from './settings.types';
import { ROOT_DIR } from '../../appDir';

const DEFAULT_SETTINGS_PATH = 'settings.yml';

export const resolveSettingsPath = (): string => {
  const settingsPath = process.env.SETTINGS_PATH?.trim() || DEFAULT_SETTINGS_PATH;
  return path.isAbsolute(settingsPath) ? settingsPath : path.resolve(ROOT_DIR, settingsPath);
};

const validateSettings = (data: unknown): Settings => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('settings.yml: некорректный формат (ожидается объект)');
  }
  const obj = data as Record<string, unknown>;
  for (const key of ['series', 'editorial_video'] as const) {
    const section = obj[key];
    if (typeof section !== 'object' || section === null) {
      throw new Error(`settings.yml: отсутствует раздел "${key}"`);
    }
    const s = section as Record<string, unknown>;
    if (typeof s.enabled !== 'boolean') throw new Error(`settings.yml: ${key}.enabled не задан`);
    if (typeof s.name !== 'string') throw new Error(`settings.yml: ${key}.name не задан`);
    if (typeof s.src !== 'string') throw new Error(`settings.yml: ${key}.src не задан`);
    if (typeof s.dest !== 'string') throw new Error(`settings.yml: ${key}.dest не задан`);
  }
  if (!Array.isArray(obj.series_map)) {
    throw new Error('settings.yml: series_map отсутствует или не является массивом');
  }
  return data as Settings;
};

const loadSettings = (): Settings => {
  const settingsPath = resolveSettingsPath();
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  return validateSettings(YAML.parse(settingsContent));
};

export { loadSettings };
