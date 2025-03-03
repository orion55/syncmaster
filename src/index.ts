import { printSyncMaster } from './libs/greeting';
import { logger } from './libs/logger';
import { loadSettings } from './libs/settings/loadSettings';
import { syncSerial } from './libs/sync-serials';
import { syncVideo } from './libs/sync-video';
import { report } from './libs/report';

const main = async () => {
  try {
    printSyncMaster();
    const settings = loadSettings();
    const series = await syncSerial(settings.series);
    const editorial = await syncVideo(settings.editorial_video);
    const turkish = await syncVideo(settings.turkish_video);
    report({ series, editorial, turkish });
  } catch (error) {
    logger.error(error);
  }
};

main();
