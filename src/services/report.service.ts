import * as fs from 'fs';
import * as path from 'path';
import { SyncResult } from './sync.types';
import { getDir } from './settings/pathUtils';
import { logger } from './logger.service';
import { generateReportFileName, sortSeriesByKey, sortSyncResult } from './helpers/report-utils';

const REPORT_PATH = 'reportService';

interface InputData {
  series: Map<string, number> | null;
  editorial: SyncResult | null;
  turkish: SyncResult | null;
}

const report = (input: InputData) => {
  const { series, editorial, turkish } = input;
  let content = '';

  if (series) {
    const sortedSeries = sortSeriesByKey(series);

    content += 'Турецкие\n';
    sortedSeries?.forEach((count, title) => {
      content += count === 1 ? `\t${title}\n` : `\t${title} - ${count} серии\n`;
    });
    content += '\n';
  }

  if (editorial) {
    const sortedEditorial = sortSyncResult(editorial);

    content += `${sortedEditorial.name}\n`;
    sortedEditorial.files.forEach((file) => {
      content += `\t${path.parse(file).name}\n`;
    });
    content += '\n';
  }

  if (turkish) {
    const sortedTurkish = sortSyncResult(turkish);

    content += `${sortedTurkish.name}\n`;
    sortedTurkish.files.forEach((file) => {
      content += `\t${path.parse(file).name}\n`;
    });
  }

  if (content.length !== 0) {
    const reportDir = getDir(REPORT_PATH);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const fileName = generateReportFileName();
    const filePath = path.join(reportDir, fileName);

    fs.writeFileSync(filePath, content, 'utf-8');

    logger.info(`Отчёт создан: ${filePath}`);
  }
};

export { report };
