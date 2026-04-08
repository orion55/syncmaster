import colors from 'ansi-colors';
import type { SeriesMapItem } from '../settings/settings.types';

export const renderHeader = (): void => {
  console.log(colors.bold.greenBright('SyncMaster :: Редактор'));
  console.log();
};

export const renderList = (items: SeriesMapItem[]): void => {
  if (items.length === 0) {
    console.log(colors.dim('  (список пуст)'));
  } else {
    items.forEach((item, i) => {
      const num = colors.dim(`${i + 1}.`.padStart(3));
      const src = colors.yellow(item.src);
      const arrow = colors.dim(' ← ');
      const dest = colors.green(item.dest);
      console.log(`  ${num} ${dest}${arrow}${src}`);
    });
  }
  console.log();
};

export const renderMainMenu = (): void => {
  console.log(colors.bold('Маппинги series_map'));
  console.log(colors.dim('─'.repeat(60)));
  console.log(`  ${colors.cyan('1')}  Добавить новую запись`);
  console.log(`  ${colors.cyan('2')}  Удалить запись`);
  console.log(`  ${colors.cyan('0')}  Выйти`);
  console.log();
};

export const renderSuccess = (msg: string): void => {
  console.log(colors.green(`✓ ${msg}`));
};

export const renderError = (msg: string): void => {
  console.log(colors.red(`✗ ${msg}`));
};
