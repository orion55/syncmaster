import { printSyncMaster } from './libs/greeting';
import { logger } from './libs/logger';
import { loadSettings } from './libs/settings/loadSettings';
import { syncSerial } from './libs/sync-serials';

const main = () => {
  try {
    printSyncMaster();
    const settings = loadSettings();
    syncSerial(settings);
  } catch (error) {
    logger.error(error);
  }
};

main();
