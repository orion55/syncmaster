import fs from 'fs';
import { Presets, SingleBar } from 'cli-progress';
import { pipeline } from 'stream/promises';
import colors from 'ansi-colors';

export const copyFileWithProgress = async (src: string, dest: string): Promise<void> => {
  const srcStats = await fs.promises.stat(src);
  const totalSize = srcStats.size;

  const bar = new SingleBar(
    {
      format: 'Прогресс ' + colors.green('{bar}') + ' {percentage}%',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    Presets.shades_classic,
  );
  bar.start(Math.max(totalSize, 1), 0);

  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  readStream.on('data', (chunk) => {
    bar.increment(chunk.length);
  });

  try {
    await pipeline(readStream, writeStream);
  } catch (err) {
    try {
      fs.unlinkSync(dest);
    } catch {
      // ignore cleanup error
    }
    throw err;
  }

  bar.stop();
};
