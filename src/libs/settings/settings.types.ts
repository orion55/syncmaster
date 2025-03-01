export interface SeriesSettings {
  enabled: boolean;
  src: string;
  dest: string;
}

export interface Settings {
  series: SeriesSettings;
  editorial_video: SeriesSettings;
  turkish_video: SeriesSettings;
}

export interface CsvEntries {
  [key: string]: string;
}
