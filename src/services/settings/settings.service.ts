import * as fs from 'fs';
import * as path from 'path';
import { Settings } from './settings.types';
import { APP_DIR } from '../../appDir';

const CONFIG_PATH = 'config';
const SETTING_FILE = 'setting.json';

const loadSettings = (): Settings => {
  const configDir = path.join(APP_DIR, CONFIG_PATH);

  const settingsPath = path.join(configDir, SETTING_FILE);
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  return JSON.parse(settingsContent);
};

export { loadSettings };
