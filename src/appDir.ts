import { fileURLToPath } from 'url';
import path from 'path';

console.log({ url: import.meta.url });
export const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
