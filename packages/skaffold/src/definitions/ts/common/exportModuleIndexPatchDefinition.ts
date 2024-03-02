import { resolve } from 'path';
import { FileDefinition, FilePatch } from '@/definitions';
import { IndexModuleDefinition } from './indexModuleDefinition';

export interface ExportModuleIndexPatchDefinitionArgs {
  index: IndexModuleDefinition;
}

export class ExportModuleIndexPatchDefinition implements FileDefinition {
  private readonly _patch: FilePatch;

  constructor({ index }: ExportModuleIndexPatchDefinitionArgs) {
    this._patch = new FilePatch({
      marker: 'add-export',
      patch: `export * from './${index.dirname}';`,
      path: resolve(index.directory(), '..', 'index.ts'),
    });
  }

  public get files() {
    return [this._patch];
  }
}
