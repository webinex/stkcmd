import { resolve } from 'path';
import { FileDefinition, FileInfo, isFile, pathUtil } from '@/definitions';

export interface IndexModuleDefinitionArgs {
  definitions: FileDefinition[];
}

export class IndexModuleDefinition implements FileDefinition {
  public readonly definitions: FileDefinition[];

  constructor(args: IndexModuleDefinitionArgs) {
    this.definitions = args.definitions;
  }

  public get dirname() {
    return pathUtil.dirname(this.directory());
  }

  public get files(): FileInfo[] {
    return [
      {
        path: this.path(),
        content: this.declaration(),
      },
    ];
  }

  public get fileInfoList() {
    return this.definitions.flatMap((x) => x.files).filter((x) => isFile(x)) as FileInfo[];
  }

  public directory() {
    return pathUtil.commonDirectory(this.fileInfoList.map((x) => x.path));
  }

  public path() {
    return resolve(this.directory(), 'index.ts');
  }

  public declaration() {
    return this.exports();
  }

  public exports() {
    return this.fileInfoList.map((f) => this.export(f.path)).join('\n');
  }

  public export(file: string) {
    const relativePath = pathUtil.relative(this.directory(), file);
    return `export * from './${pathUtil.noext(relativePath)}';`;
  }
}
