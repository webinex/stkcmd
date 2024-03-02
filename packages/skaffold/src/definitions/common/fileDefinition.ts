import { FilePatch } from '.';

export interface FileInfo {
  path: string;
  content: string;
}

export function isFile(x: FileInfo | FilePatch): x is FileInfo {
  return (x as FileInfo).content !== undefined;
}

export function files(items: Array<FileInfo | FilePatch>): FileInfo[] {
  return items.filter(isFile);
}

export interface FileDefinition {
  files: Array<FileInfo | FilePatch>;
}
