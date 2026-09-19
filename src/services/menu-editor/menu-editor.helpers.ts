import colors from 'ansi-colors';
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../../appDir';
import type { MenuEditorService } from './menu-editor.service';
import type { SortedItem } from './menu-editor.types';

export const sortedWithIndex = (svc: MenuEditorService): SortedItem[] =>
  svc
    .getAll()
    .map((item, index) => ({ ...item, originalIndex: index }))
    .sort((itemA, itemB) => itemA.dest.localeCompare(itemB.dest, 'ru'));

export const formatList = (items: SortedItem[]): string => {
  if (items.length === 0) return colors.dim('(список пуст)');
  return items
    .map(
      (item, index) =>
        `${colors.dim(`${String(index + 1).padStart(2)}.`)} ${colors.green(item.dest)}${colors.dim('  ←  ')}${colors.yellow(item.src)}`,
    )
    .join('\n');
};

export const appendRemovedSeriesName = (
  name: string,
  filePath = path.join(ROOT_DIR, 'remove.txt'),
): void => {
  const names = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean)
    : [];

  names.push(name);
  names.sort((nameA, nameB) => nameA.localeCompare(nameB, 'ru'));
  fs.writeFileSync(filePath, `${names.join('\n')}\n`, 'utf8');
};
