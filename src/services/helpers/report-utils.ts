import dayjs from 'dayjs';
import { SyncResult } from '../sync.types';

type SeriesMap = Map<string, number>;

export const sortSeriesByKey = (series: SeriesMap): SeriesMap => {
  const sortedEntries = Array.from(series.entries()).sort((entryA, entryB) =>
    entryA[0].localeCompare(entryB[0]),
  );
  return new Map(sortedEntries);
};

export const sortSyncResult = (result: SyncResult): SyncResult => ({
  ...result,
  files: result.files.slice().sort((fileA, fileB) => fileA.localeCompare(fileB)),
});

export const generateReportFileName = (): string => `report_${dayjs().format('DDMMYYYY_HHmm')}.txt`;
