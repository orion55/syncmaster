import fs from 'fs';
import { Presets, SingleBar } from 'cli-progress';
import { pipeline } from 'stream/promises';
import colors from 'ansi-colors';

export const copyFileWithProgress = async (src: string, dest: string): Promise<void> => {
  const srcStats = await fs.promises.stat(src);
  const totalSize = srcStats.size;

  const bar = new SingleBar(
    {
      format: colors.green('{bar}') + ' {percentage}% | {value}/{total} bytes',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    Presets.shades_classic,
  );
  bar.start(totalSize, 0);

  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  readStream.on('data', (chunk) => {
    bar.increment(chunk.length);
  });

  await pipeline(readStream, writeStream);

  bar.stop();
};
