import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as helpers from './menu-editor.helpers';

test('appendRemovedSeriesName adds a name and keeps remove.txt sorted in Russian', () => {
  const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syncmaster-'));
  const removeFilePath = path.join(temporaryDir, 'remove.txt');
  fs.writeFileSync(removeFilePath, 'Ёжик\nАльфа\n', 'utf8');

  try {
    const appendRemovedSeriesName = (helpers as Record<string, unknown>).appendRemovedSeriesName;
    assert.equal(typeof appendRemovedSeriesName, 'function');
    (appendRemovedSeriesName as (name: string, filePath: string) => void)('Бета', removeFilePath);

    assert.equal(fs.readFileSync(removeFilePath, 'utf8'), 'Альфа\nБета\nЁжик\n');
  } finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
  }
});
