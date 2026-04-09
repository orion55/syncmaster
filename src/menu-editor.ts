import { intro, outro, select, text, confirm, note, log, isCancel, cancel } from '@clack/prompts';
import colors from 'ansi-colors';
import { MenuEditorService } from './services/menu-editor/menu-editor.service';
import { sortedWithIndex, formatList } from './services/menu-editor/menu-editor.helpers';

const main = async (): Promise<void> => {
  const svc = new MenuEditorService();
  let isDirty = false;

  intro(colors.bold.cyan('SyncMaster') + colors.dim(' :: ') + colors.bold.white('Menu'));

  loop: while (true) {
    const items = sortedWithIndex(svc);

    note(formatList(items), 'Турецкие');

    const action = await select({
      message: 'Выберите действие:',
      options: [
        { value: 'add', label: colors.cyan('Добавить новую запись') },
        { value: 'delete', label: colors.red('Удалить запись'), disabled: items.length === 0 },
        { value: 'exit', label: colors.dim('Выйти') },
      ],
    });

    if (isCancel(action)) {
      cancel('Отменено');
      break;
    }

    switch (action) {
      case 'add': {
        const src = await text({
          message: 'src (папка источника):',
          validate: (value) => (!value?.trim() ? 'Не может быть пустым' : undefined),
        });
        if (isCancel(src)) break loop;

        const dest = await text({
          message: 'dest (папка назначения):',
          validate: (value) => (!value?.trim() ? 'Не может быть пустым' : undefined),
        });
        if (isCancel(dest)) break loop;

        svc.add({ src: (src as string).trim(), dest: (dest as string).trim() });
        isDirty = true;
        log.success('Запись добавлена');
        break;
      }

      case 'delete': {
        const selected = await select({
          message: 'Выберите запись для удаления:',
          options: items.map((item) => ({
            value: item.originalIndex,
            label: `${colors.green(item.dest)}${colors.dim('  ←  ')}${colors.yellow(item.src)}`,
          })),
        });
        if (isCancel(selected)) break;

        const entry = items.find((item) => item.originalIndex === selected)!;
        const doDelete = await confirm({ message: `Удалить "${entry.dest}"?` });
        if (isCancel(doDelete) || !doDelete) break;

        const { srcPath, destPath } = svc.getItemFolderPaths(entry);
        svc.delete(entry.originalIndex);
        isDirty = true;
        log.success('Запись удалена');

        const doFolders = await confirm({ message: 'Удалить также папки?' });
        if (!isCancel(doFolders) && doFolders) {
          const { srcDeleted, destDeleted } = svc.deleteFolders(entry);
          if (srcDeleted) log.success(`Папка удалена: ${srcPath}`);
          if (destDeleted) log.success(`Папка удалена: ${destPath}`);
          if (!srcDeleted && !destDeleted) log.error('Папки не найдены');
        }
        break;
      }

      case 'exit': {
        if (isDirty) {
          const save = await confirm({ message: 'Сохранить изменения?' });
          if (isCancel(save)) break loop;
          if (save) {
            svc.sortByDest();
            svc.save();
            log.success('Изменения сохранены');
          }
        } else {
          svc.sortByDest();
          svc.save();
        }
        break loop;
      }
    }
  }

  outro('До свидания!');
};

void main();
