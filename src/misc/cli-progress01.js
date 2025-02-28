import fs from 'fs';
import path from 'path';
import {SingleBar} from 'src/misc/cli-progress';

function copyFileWithProgress(src: string, dest: string): void {
  const srcStats = fs.statSync(src); // Получаем информацию о исходном файле
  const totalSize = srcStats.size; // Размер файла в байтах

  const bar = new SingleBar({
    format: '{bar} {percentage}% | {value}/{total} bytes',
    barCompleteChar: '\u2588', // Символ для завершенной части
    barIncompleteChar: '\u2591', // Символ для незавершенной части
    hideCursor: true,
  }, cliProgress.Presets.shades_classic);

  bar.start(totalSize, 0); // Инициализация прогресс-бара с общим размером файла

  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  // Пишем в новый файл, отслеживая прогресс
  readStream.on('data', (chunk) => {
    bar.increment(chunk.length); // Обновляем прогресс
  });

  readStream.on('end', () => {
    bar.stop(); // Останавливаем прогресс, когда копирование завершено
    console.log(`Файл успешно скопирован из ${src} в ${dest}`);
  });

  readStream.pipe(writeStream); // Копируем файл
}

// Пример вызова функции
const src = path.join(__dirname, 'src', 'example.txt'); // Исходный файл
const dest = path.join(__dirname, 'dest', 'example.txt'); // Папка назначения

copyFileWithProgress(src, dest);
