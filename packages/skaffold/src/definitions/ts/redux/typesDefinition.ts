import { resolve } from 'path';
import { flatten } from 'lodash';
import { Context, FileDefinition } from '@/definitions/common';
import { TypeDefinition, Imports, ModelDefinition } from '@/definitions/ts/common';
import { RemoteApi } from './api';

export interface TypesDefinitionArgs {
  remoteApi: RemoteApi;
}

export class TypesDefinition implements FileDefinition {
  public readonly remoteApi: RemoteApi;

  constructor(args: TypesDefinitionArgs) {
    this.remoteApi = args.remoteApi;
  }

  public get model() {
    return this.remoteApi.model;
  }

  public get name() {
    return `${this.model.name.camelCase()}Types`;
  }

  public get files() {
    return [
      {
        path: this.path(),
        content: this.declaration(),
      },
    ];
  }

  public fileName() {
    return `${this.name}.ts`;
  }

  public path() {
    return resolve(Context.CLIENT_SRC, 'redux', this.model.pluralName.camelCase(), this.fileName());
  }

  public get imports() {
    const result = this.types.filter((x) => x.imports).flatMap((x) => x.imports!.values);
    return new Imports(result);
  }

  public get types() {
    const result = Array.from(
      new Set(
        flatten([
          this.remoteApi.model,
          this.remoteApi.get.response,
          this.remoteApi.get.body,
          this.remoteApi.getAll.response,
          this.remoteApi.getAll.body,
          this.remoteApi.create.body,
          this.remoteApi.create.response,
          this.remoteApi.update.body,
          this.remoteApi.update.response,
          this.remoteApi.delete.body,
          this.remoteApi.delete.response,
        ]),
      ),
    )
      .filter((x) => !!x && typeof x !== 'string')
      .flatMap((x) => this.definitions(x!))
      .uniqueBy((x) => x.name);

    return result;
  }

  private definitions(type: string | ModelDefinition | [ModelDefinition]): TypeDefinition[] {
    if (typeof type === 'string') {
      return [];
    }

    const model: TypeDefinition = Array.isArray(type) ? type[0] : type;
    return [model].concat(model.children ?? []);
  }

  public declaration() {
    return [this.imports.declaration(), ...this.types.map((x) => x.declaration())]
      .filter((x) => x.trim().length > 0)
      .join('\n\n');
  }
}
