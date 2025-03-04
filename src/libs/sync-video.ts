import * as fs from 'fs';
import * as path from 'path';
import { SyncResult } from './sync.types';
import { copyFileWithProgress } from './progress-bar';
import { logger } from './logger';
import { SeriesSettings } from './settings/settings.types';
import colors from 'ansi-colors';

const MAX_COUNT = 50;

const trimFileName = (fileName: string): string => {
  const parsed = path.parse(fileName);
  const extension = parsed.ext;
  const baseName = parsed.name;

  if (baseName.length + extension.length <= MAX_COUNT) return fileName;

  const allowedBaseLength = MAX_COUNT - extension.length;
  let trimmedBase = baseName.substring(0, allowedBaseLength);
  const lastSpace = trimmedBase.lastIndexOf(' ');
  if (lastSpace > 0) {
    trimmedBase = trimmedBase.substring(0, lastSpace);
  }

  return trimmedBase + extension;
};

export const syncVideo = async (settings: SeriesSettings): Promise<SyncResult | null> => {
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
        const trimmedFileName = trimFileName(file);

        if (!destFilesSet.has(trimmedFileName)) {
          const srcFile = path.join(src, file);
          const destFile = path.join(dest, trimmedFileName);

          try {
            logger.info(`Начало копирования «${colors.green(trimmedFileName)}»`);
            await copyFileWithProgress(srcFile, destFile);
            logger.info(`Скопирован файл: ${srcFile} -> ${destFile}`);
            fs.unlinkSync(srcFile);
            logger.info(`Удалён файл: ${srcFile}`);
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
