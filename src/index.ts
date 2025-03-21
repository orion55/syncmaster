import { printSyncMaster } from './services/helpers/greeting';
import { logger } from './services/logger.service';
import { loadSettings } from './services/settings/settings.service';
import { syncSerial } from './services/serial.service';
import { report } from './services/report.service';
import { syncVideo } from './services/video.service';

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
