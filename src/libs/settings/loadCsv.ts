import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { CsvEntries } from './settings.types';
import { getDir } from './pathUtils';

const CONFIG_PATH = 'config';
const SOAP_FILE = 'soap.csv';

export function loadCsv(): CsvEntries {
  const configDir = getDir(CONFIG_PATH);
  const csvPath = path.join(configDir, SOAP_FILE);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const records: string[][] = parse(csvContent, {
    delimiter: ';',
    trim: true,
    skip_empty_lines: true,
  });

  return records.reduce((acc, [original, translation]) => {
    acc[original] = translation;
    return acc;
  }, {} as CsvEntries);
}
