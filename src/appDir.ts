import { fileURLToPath } from 'url';
import path from 'path';

// В dev (tsx src/index.ts): APP_DIR = <repo>/src/
// В prod (ncc-бандл dist/index.js): APP_DIR = <deploy-dir>/
// Плоская структура config/, logs/, report/ лежит рядом с исполняемым файлом
// без каких-либо NODE_ENV-проверок.
export const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
