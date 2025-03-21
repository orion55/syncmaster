import * as fs from 'fs';
import * as path from 'path';
import { SeriesSettings } from './settings/settings.types';
import { loadCsv } from './settings/loadCsv';
import { logger } from './logger.service';
import { copyFileWithProgress } from './helpers/progress-bar';
import colors from 'ansi-colors';

const EPISODE_REGEX = /\.s\d+\.e(\d+)/i;
const LEADING_DIGITS_REGEX = /^(\d+)/;

const transformFileName = (srcFileName: string): string => {
  const ext = path.extname(srcFileName);
  const match = srcFileName.match(EPISODE_REGEX);
  if (match?.[1]) {
    return match[1] + ext;
  }
  const numMatch = srcFileName.match(LEADING_DIGITS_REGEX);
  if (numMatch?.[1]) {
    return numMatch[1] + ext;
  }
  return srcFileName;
};

const syncSerial = async (settings: SeriesSettings): Promise<Map<string, number> | null> => {
  const { enabled, src, dest } = settings;

  if (!enabled) {
    logger.warn('Синхронизация сериалов отключена');
    return null;
  }

  logger.info(`Синхронизация ${colors.green('сериалов')}`);

  const srcExists = fs.existsSync(src);
  const destExists = fs.existsSync(dest);

  if (!srcExists || !destExists) {
    if (!srcExists) logger.error(`Исходная папка "${src}" не найдена!`);
    if (!destExists) logger.error(`Папка назначения "${dest}" не найдена!`);
    return null;
  }

  const series = loadCsv();
  let filesCopied = 0;
  const filesMap = new Map<string, number>();

  for (const [srcFolderName, destFolderName] of Object.entries(series)) {
    const srcDir = path.join(src, srcFolderName);
    const destDir = path.join(dest, destFolderName);

    if (!fs.existsSync(srcDir)) {
      logger.warn(`Исходная папка "${srcDir}" не существует, пропускаем синхронизацию.`);
      continue;
    }

    try {
      const srcFiles = fs.readdirSync(srcDir);

      let destFiles: string[];
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        logger.info(`Создана папка назначения: "${destDir}"`);
        destFiles = [];
      } else {
        destFiles = fs.readdirSync(destDir);
      }

      for (const srcFile of srcFiles) {
        if (path.extname(srcFile).toLowerCase() === '.!qb') {
          logger.info(`Пропущен файл: ${srcFile}`);
          continue;
        }

        const newFileName = transformFileName(srcFile);
        if (destFiles.includes(newFileName)) continue;

        const srcFilePath = path.join(srcDir, srcFile);
        const destFilePath = path.join(destDir, newFileName);

        try {
          logger.info(`Начало копирования «${colors.green(destFolderName)}»`);
          await copyFileWithProgress(srcFilePath, destFilePath);
          logger.info(
            `Скопирован файл: ${srcFolderName}\\${srcFile} -> ${destFolderName}\\${newFileName}`,
          );
          filesCopied++;
          filesMap.set(destFolderName, (filesMap.get(destFolderName) || 0) + 1);
        } catch (fileError) {
          logger.error(
            `Ошибка копирования файла "${srcFile}" из папки "${srcFolderName}":`,
            fileError,
          );
        }
      }
    } catch (error) {
      logger.error(`Ошибка при синхронизации папки "${srcFolderName}":`, error);
    }
  }

  if (filesCopied === 0) {
    logger.info('Новых файлов нет\n');
    return null;
  } else {
    logger.info(`Скопировано ${filesCopied} файлов\n`);
    return filesMap;
  }
};

export { syncSerial };
