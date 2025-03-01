import { printSyncMaster } from './libs/greeting';
import { logger } from './libs/logger';

const main = () => {
  try {
    printSyncMaster();
  } catch (error) {
    logger.error(error);
  }
};

main();
