import { SyncResult } from './sync.types';

export const sortSeriesByKey = (series: Map<string, number> | null): Map<string, number> | null => {
  if (series === null) return null;
  const sortedEntries = Array.from(series.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return new Map(sortedEntries);
};

export const sortSyncResult = (result: SyncResult): SyncResult => ({
  ...result,
  files: result.files.slice().sort((a, b) => a.localeCompare(b)),
});

export const generateReportFileName = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const HH = String(now.getHours()).padStart(2, '0');
  const MM = String(now.getMinutes()).padStart(2, '0');
  return `report_${dd}${mm}${yyyy}_${HH}${MM}.txt`;
};
