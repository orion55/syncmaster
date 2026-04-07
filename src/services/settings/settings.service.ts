import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { Settings } from './settings.types';
import { ROOT_DIR } from '../../appDir';

const DEFAULT_SETTINGS_PATH = 'settings.yml';

const resolveSettingsPath = (): string => {
  const settingsPath = process.env.SETTINGS_PATH?.trim() || DEFAULT_SETTINGS_PATH;
  return path.isAbsolute(settingsPath) ? settingsPath : path.resolve(ROOT_DIR, settingsPath);
};

const loadSettings = (): Settings => {
  const settingsPath = resolveSettingsPath();
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  return YAML.parse(settingsContent) as Settings;
};

export { loadSettings };
