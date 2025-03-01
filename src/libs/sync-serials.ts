import { Settings } from './settings/settings.types';
import { loadCsv } from './settings/loadCsv';

export const syncSerial = (settings: Settings) => {
  if (settings.series.enabled) {
    const soapOperas = loadCsv();
    console.log(soapOperas);
  }
};
