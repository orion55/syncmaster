import { MenuEditorService } from './services/menu-editor/menu-editor.service';
import {
  initReadline,
  closeReadline,
  ask,
  askIndex,
  confirm,
} from './services/menu-editor/menu-editor.prompts';
import {
  renderHeader,
  renderList,
  renderMainMenu,
  renderSuccess,
  renderError,
} from './services/menu-editor/menu-editor.ui';

const sortedWithIndex = (svc: MenuEditorService) =>
  svc
    .getAll()
    .map((item, i) => ({ ...item, originalIndex: i }))
    .sort((a, b) => a.dest.localeCompare(b.dest, 'ru'));

const main = async (): Promise<void> => {
  const svc = new MenuEditorService();
  initReadline();
  let isDirty = false;

  try {
    while (true) {
      const sorted = sortedWithIndex(svc);
      console.clear();
      renderHeader();
      renderList(sorted);
      renderMainMenu();

      const choice = await ask('Действие:');

      switch (choice) {
        case '1': {
          console.log('');
          const src = await ask('src (папка источника):');
          const dest = await ask('dest (папка назначения):');
          if (src && dest) {
            svc.add({ src, dest });
            isDirty = true;
            renderSuccess('Запись добавлена');
          } else {
            renderError('src и dest не могут быть пустыми');
          }
          await ask('Enter для продолжения...');
          break;
        }

        case '2': {
          if (svc.count === 0) {
            renderError('Список пуст, нечего удалять');
            await ask('Enter для продолжения...');
            break;
          }
          const displayIdx = await askIndex(
            `Номер записи (1–${svc.count}), 0 = отмена:`,
            svc.count,
          );
          if (displayIdx === null) break;

          const entry = sorted[displayIdx];
          if (await confirm(`Удалить "${entry.src}"?`)) {
            const { srcPath, destPath } = svc.getItemFolderPaths(entry);
            svc.delete(entry.originalIndex);
            isDirty = true;
            renderSuccess('Запись удалена');
            if (await confirm('Удалить также папки?')) {
              const { srcDeleted, destDeleted } = svc.deleteFolders(entry);
              if (srcDeleted) renderSuccess(`Папка удалена: ${srcPath}`);
              if (destDeleted) renderSuccess(`Папка удалена: ${destPath}`);
              if (!srcDeleted && !destDeleted) renderError('Папки не найдены');
            }
            await ask('Enter для продолжения...');
          }
          break;
        }

        case '0': {
          if (isDirty && !(await confirm('Сохранить изменения?'))) {
            return;
          }
          svc.sortByDest();
          svc.save();
          return;
        }
      }
    }
  } finally {
    closeReadline();
  }
};

void main();
