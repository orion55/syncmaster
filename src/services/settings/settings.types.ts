export interface SeriesSettings {
  enabled: boolean;
  name: string;
  src: string;
  dest: string;
}

export interface SeriesMapItem {
  src: string;
  dest: string;
}

export interface Settings {
  series: SeriesSettings;
  editorial_video: SeriesSettings;
  series_map: SeriesMapItem[];
}
