import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions/common';
import { Imports } from '@/definitions/ts/common';
import { RemoteApi } from './remoteApi';
import { TypesDefinition } from '../typesDefinition';
import { QueryDefinition } from './queryDefinition';
import { MutationDefinition } from './mutationDefinition';
import { ApiEndpointDefinitionBase } from './apiEndpointDefinitionBase';

export interface ApiDefinitionArgs {
  remoteApi: RemoteApi;
  types: TypesDefinition;
}

export class ApiDefinition implements FileDefinition {
  public readonly remoteApi: RemoteApi;
  public readonly types: TypesDefinition;

  constructor(args: ApiDefinitionArgs) {
    this.remoteApi = args.remoteApi;
    this.types = args.types;
  }

  public get name() {
    return `${this.remoteApi.model.name.camelCase()}Api`;
  }

  public get tagName() {
    return this.remoteApi.model.name.kebabCase();
  }

  public get model() {
    return this.remoteApi.model;
  }

  public get updateMutation() {
    return new MutationDefinition({
      endpoint: this.remoteApi.update,
      name: `update${this.remoteApi.model.name.pascalCase()}`,
      tag: this.tagName,
    });
  }

  public get createMutation() {
    return new MutationDefinition({
      endpoint: this.remoteApi.create,
      name: `create${this.remoteApi.model.name.pascalCase()}`,
      tag: this.tagName,
    });
  }

  public get deleteMutation() {
    return new MutationDefinition({
      endpoint: this.remoteApi.delete,
      name: `delete${this.remoteApi.model.name.pascalCase()}`,
      tag: this.tagName,
    });
  }

  public get getAllQuery() {
    return new QueryDefinition({
      endpoint: this.remoteApi.getAll,
      name: `getAll${this.model.pluralName.pascalCase()}`,
      tag: this.tagName,
    });
  }

  public get getQuery() {
    return new QueryDefinition({
      endpoint: this.remoteApi.get,
      name: `get${this.model.name.pascalCase()}`,
      tag: this.tagName,
    });
  }

  public get endpoints() {
    return [
      this.getQuery,
      this.getAllQuery,
      this.createMutation,
      this.updateMutation,
      this.deleteMutation,
    ].filter((x) => x) as ApiEndpointDefinitionBase[];
  }

  public directory() {
    return resolve(Context.CLIENT_SRC, 'redux', this.remoteApi.model.pluralName.camelCase());
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
    return resolve(this.directory(), this.fileName());
  }

  public declaration() {
    return [this.imports, this.apiDeclaration, this.exports].filter((x) => x.trim().length > 0).join('\n\n');
  }

  public get imports() {
    return new Imports([
      ['api', '@/redux/api'],
      [['rtkq', 'RtkqRequest'], '@/redux/rtkq'],
      ['Http', '@/core'],
      [this.types.types.map((x) => x.name), `./${this.types.name}`],
    ]).declaration();
  }

  public get apiDeclaration() {
    return `
export const ${this.remoteApi.model.name.camelCase()}Api = api.injectEndpoints({
  endpoints: build => ({
${this.endpoints
  .map((x) => x.declaration())
  .join(',\n')
  .indented(4)}  
  }),
});`.trim();
  }

  public get exports() {
    return `
export const {
${this.endpoints
  .map((x) => x.use)
  .join(',\n')
  .indented(2)}
} = ${this.name}`.trim();
  }
}
