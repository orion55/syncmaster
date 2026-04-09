import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import type { Document, YAMLMap, YAMLSeq } from 'yaml';
import type { SeriesMapItem } from '../settings/settings.types';
import { resolveSettingsPath } from '../settings/settings.service';

export class MenuEditorService {
  private doc: Document;
  private readonly filePath: string;

  constructor() {
    this.filePath = resolveSettingsPath();
    const content = fs.readFileSync(this.filePath, 'utf8');
    this.doc = YAML.parseDocument(content);
  }

  private getSeq(): YAMLSeq {
    return this.doc.get('series_map') as YAMLSeq;
  }

  getAll(): SeriesMapItem[] {
    return this.getSeq().items.map((item) => {
      const map = item as YAMLMap;
      return {
        src: map.get('src') as string,
        dest: map.get('dest') as string,
      };
    });
  }

  add(item: SeriesMapItem): void {
    const seq = this.getSeq();
    const node = this.doc.createNode(item);
    const insertAt = this.getAll().findIndex(
      (existing) => existing.dest.localeCompare(item.dest, 'ru') > 0,
    );
    if (insertAt === -1) {
      seq.add(node);
    } else {
      seq.items.splice(insertAt, 0, node);
    }
  }

  delete(index: number): void {
    const seq = this.getSeq();
    seq.delete(index);
  }

  getItemFolderPaths(item: SeriesMapItem): { srcPath: string; destPath: string } {
    const srcBase = this.doc.getIn(['series', 'src']) as string;
    const destBase = this.doc.getIn(['series', 'dest']) as string;
    return {
      srcPath: path.join(srcBase, item.src),
      destPath: path.join(destBase, item.dest),
    };
  }

  deleteFolders(item: SeriesMapItem): { srcDeleted: boolean; destDeleted: boolean } {
    const { srcPath, destPath } = this.getItemFolderPaths(item);
    const srcDeleted = fs.existsSync(srcPath);
    const destDeleted = fs.existsSync(destPath);
    if (srcDeleted) fs.rmSync(srcPath, { recursive: true, force: true });
    if (destDeleted) fs.rmSync(destPath, { recursive: true, force: true });
    return { srcDeleted, destDeleted };
  }

  sortByDest(): void {
    const seq = this.getSeq();
    seq.items.sort((nodeA, nodeB) => {
      const destA = ((nodeA as YAMLMap).get('dest') as string) ?? '';
      const destB = ((nodeB as YAMLMap).get('dest') as string) ?? '';
      return destA.localeCompare(destB, 'ru');
    });
  }

  save(): void {
    fs.writeFileSync(this.filePath, this.doc.toString(), 'utf8');
  }
}
