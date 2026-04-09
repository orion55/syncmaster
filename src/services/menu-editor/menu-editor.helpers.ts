import colors from 'ansi-colors';
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
