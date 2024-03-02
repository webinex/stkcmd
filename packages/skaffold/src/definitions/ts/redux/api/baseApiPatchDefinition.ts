import { resolve } from 'path';
import { Context, FileDefinition, FilePatch } from '@/definitions/common';
import { ApiDefinition } from './apiDefinition';

export interface BaseApiPatchDefinitionArgs {
  api: ApiDefinition;
}

export class BaseApiPatchDefinition implements FileDefinition {
  public readonly api: ApiDefinition;

  constructor(args: BaseApiPatchDefinitionArgs) {
    this.api = args.api;
  }

  public get files(): FilePatch[] {
    return [
      new FilePatch({
        marker: 'add-tag',
        path: resolve(Context.CLIENT_SRC, 'redux', 'api.tsx'),
        patch: `'${this.api.tagName}',`,
      }),
    ];
  }
}
