import * as fs from 'fs';
import * as path from 'path';
import { Settings } from './settings.types';
import { getDir } from './pathUtils';

const CONFIG_PATH = 'config';
const SETTING_FILE = 'setting.json';

export const loadSettings = (): Settings => {
  const configDir = getDir(CONFIG_PATH);

  const settingsPath = path.join(configDir, SETTING_FILE);
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  return JSON.parse(settingsContent);
};
