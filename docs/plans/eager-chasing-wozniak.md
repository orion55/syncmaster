# TUI-редактор series_map

## Context

`settings.yml` содержит секцию `series_map` — массив из ~9 маппингов `{src, dest}`, которые приходится редактировать вручную в текстовом редакторе. Цель: добавить интерактивный TUI-редактор, запускаемый отдельно от основного синка, чтобы упростить CRUD операций над маппингами без риска сломать остальной YAML.

## Подход

**Нулевые новые зависимости.** Всё необходимое уже есть:
- `readline/promises` — встроен в Node 20 (меню, ввод)
- `ansi-colors` — установлен (цвета)
- `cfonts` — установлен (заголовок)
- `yaml` (пакет) — установлен (`parseDocument` даёт round-trip без потерь форматирования)

**Round-trip YAML:** `YAML.parseDocument()` → мутация AST → `doc.toString()` сохраняет пробелы, пустые строки между секциями, кириллицу, обратные слеши Windows. Другие секции (`series`, `editorial_video`) не затрагиваются.

**Точка входа:** отдельный `src/map-editor.ts`, запускается через `npm run map`. Не смешивается с основным синком.

## Файлы

### Изменить (1 строка)
- `src/services/settings/settings.service.ts:9` — добавить `export` к `const resolveSettingsPath`

### Создать
```
src/
├── map-editor.ts                              ← entrypoint, главный while-цикл
└── services/map-editor/
    ├── map-editor.service.ts                  ← YAML CRUD (parseDocument + AST-мутации)
    ├── map-editor.ui.ts                       ← render-функции (ansi-colors)
    └── map-editor.prompts.ts                  ← readline/promises обёртки
```

### Изменить `package.json`
```json
"scripts": {
  "map": "npx tsx src/map-editor.ts"
}
```

## Детали реализации

### `map-editor.service.ts`

```typescript
import YAML, { Document } from 'yaml';
import { resolveSettingsPath } from '../settings/settings.service';
import type { SeriesMapItem } from '../settings/settings.types';

export class MapEditorService {
  private doc: Document;
  private filePath: string;

  constructor() {
    this.filePath = resolveSettingsPath();
    this.doc = YAML.parseDocument(fs.readFileSync(this.filePath, 'utf8'));
  }

  getAll(): SeriesMapItem[]                         // читает AST seq
  add(item: SeriesMapItem): void                    // doc.createNode() + seq.add()
  update(index: number, item: SeriesMapItem): void  // doc.setIn(['series_map', index, key], val)
  delete(index: number): void                       // seq.delete(index)
  save(): void                                      // fs.writeFileSync(filePath, doc.toString())
  get count(): number
}
```

### `map-editor.prompts.ts`

Singleton `rl = createInterface(stdin/stdout)`:
- `ask(prompt)` → `rl.question()` + trim
- `askIndex(prompt, max)` → parseInt + валидация [1..max], null при 0/q/невалидно
- `confirm(prompt)` → ask + `=== 'y'`

### `map-editor.ui.ts`

- `renderHeader()` — `cfonts.say('Map Editor', { font: 'console' })`
- `renderList(items)` — нумерованный список: `N. [src] → [dest]`
- `renderMainMenu(isDirty)` — варианты 1/2/3/0, `*` при isDirty
- `renderSuccess/renderError` — ansi-colors green/red

### `map-editor.ts` — UX-поток

```
while (true):
  console.clear()
  renderHeader()
  renderList(svc.getAll())
  renderMainMenu(isDirty)

  '1' → askIndex → [e]дит/[d]удалить → ask src+dest или delete
  '2' → ask src, ask dest → svc.add()
  '3' → svc.save(); isDirty = false
  '0' → confirm если isDirty → return
```

`isDirty` флаг предотвращает случайный выход без сохранения.

После каждой мутации получаем список через `svc.getAll()` заново (индексы сдвигаются после delete).

## Верификация

```bash
npm run map          # запустить редактор
# 1. Добавить запись → проверить в settings.yml
# 2. Редактировать → проверить
# 3. Удалить → проверить
# 4. Выйти без сохранения → settings.yml не изменён
# 5. npm run dev → основной синк работает с обновлёнными маппингами
```

Убедиться что в `settings.yml` после сохранения:
- Секции `series` и `editorial_video` не изменились
- Пустые строки между секциями сохранились
- Кириллица и Windows-пути не искажены
