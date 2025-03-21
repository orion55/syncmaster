import path from 'path';
import fs from 'fs';
import winston, { format } from 'winston';
import { getDir } from './settings/pathUtils';

const LOG_FILE = 'syncmaster.log';
const LOG_PATH = 'logs';

const logDir = getDir(LOG_PATH);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const customFormat = format.printf(({ timestamp, level, message, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${level}]: ${message} ${metaString}`;
});

const consoleFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize({ all: false }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }),
);

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    customFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, LOG_FILE),
      format: customFormat,
    }),
  ],
});

export { logger };
