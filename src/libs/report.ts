import * as fs from 'fs';
import * as path from 'path';
import { SyncResult } from './sync.types';
import { getDir } from './settings/pathUtils';
import { logger } from './logger';

const REPORT_PATH = 'report';

interface InputData {
  series: Map<string, number> | null;
  editorial: SyncResult | null;
  turkish: SyncResult | null;
}

const generateReportFileName = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const HH = String(now.getHours()).padStart(2, '0');
  const MM = String(now.getMinutes()).padStart(2, '0');
  return `report_${dd}${mm}${yyyy}_${HH}${MM}.txt`;
};

export const report = (input: InputData) => {
  const { series, editorial, turkish } = input;
  let content = '';

  if (series) {
    content += 'Турецкие\n';
    series.forEach((count, title) => {
      content += count === 1 ? `\t${title}\n` : `\t${title} - ${count} серии\n`;
    });
    content += '\n';
  }

  if (editorial) {
    content += `${editorial.name}\n`;
    editorial.files.forEach((file) => {
      content += `\t${path.parse(file).name}\n`;
    });
    content += '\n';
  }

  if (turkish) {
    content += `${turkish.name}\n`;
    turkish.files.forEach((file) => {
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
