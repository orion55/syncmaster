import * as fs from 'fs';
import * as path from 'path';
import { SyncResult } from './sync.types';
import { copyFileWithProgress } from './helpers/progress-bar';
import { logger } from './logger.service';
import { SeriesSettings } from './settings/settings.types';
import colors from 'ansi-colors';

const MAX_COUNT = 50;

const trimFileName = (fileName: string): string => {
  const { name, ext } = path.parse(fileName);

  if (name.length + ext.length <= MAX_COUNT) return fileName.toLowerCase();

  const truncated = name.substring(0, MAX_COUNT - ext.length);
  const lastSpace = truncated.lastIndexOf(' ');
  const base = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;

  return (base + ext).toLowerCase();
};

const syncVideo = async (settings: SeriesSettings): Promise<SyncResult | null> => {
  const { enabled, name, src, dest } = settings;

  if (!enabled) return null;

  logger.info(`Синхронизация «${colors.green(name)}»`);

  const srcExists = fs.existsSync(src);
  const destExists = fs.existsSync(dest);

  if (!srcExists || !destExists) {
    if (!srcExists) logger.error(`Исходная папка "${src}" не найдена!`);
    if (!destExists) logger.error(`Папка назначения "${dest}" не найдена!`);
    return null;
  }

  const files: string[] = [];

  try {
    const srcFiles = fs.readdirSync(src);

    const destFiles = fs.readdirSync(dest);
    const destFilesSet = new Set(destFiles);

    if (srcFiles.length !== 0) {
      for (const file of srcFiles) {
        if (!fs.statSync(path.join(src, file)).isFile()) continue;

        const trimmedFileName = trimFileName(file);

        if (!destFilesSet.has(trimmedFileName)) {
          const srcFile = path.join(src, file);
          const destFile = path.join(dest, trimmedFileName);

          try {
            logger.info(`Начало копирования «${colors.green(trimmedFileName)}»`);
            await copyFileWithProgress(srcFile, destFile);
            logger.info(`Скопирован файл: ${srcFile} -> ${destFile}`);
            try {
              fs.unlinkSync(srcFile);
              logger.info(`Удалён файл: ${srcFile}`);
            } catch (unlinkError) {
              logger.error(`Ошибка удаления файла "${srcFile}"`, unlinkError);
            }
            files.push(trimmedFileName);
          } catch (error) {
            logger.error(`Ошибка копирования файла "${srcFile}"`, error);
          }
        }
      }
    }

    if (files.length === 0) {
      logger.info('Новых файлов нет\n');
      return null;
    } else {
      logger.info(`Скопировано ${files.length} файлов\n`);
      return { name: name, files } as SyncResult;
    }
  } catch (error) {
    logger.error('Ошибка синхронизации видео:', error);
    return null;
  }
};

export { syncVideo };
