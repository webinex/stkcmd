import { Context, FileDefinition, FilePatch } from '@/definitions';
import { RepositoryInterfaceDefinition } from '@/definitions/csharp/core';
import { RepositoryDefinition } from './repositoryDefinition';

export interface RegisterRepositoryPatchDefinitionArgs {
  impl: RepositoryDefinition;
  interface: RepositoryInterfaceDefinition;
}

export class RegisterRepositoryPatchDefinition implements FileDefinition {
  private readonly _registration: FilePatch;
  private readonly _namespace: FilePatch;

  constructor({ impl, interface: i }: RegisterRepositoryPatchDefinitionArgs) {
    this._registration = new FilePatch({
      marker: 'add-repository-registration',
      patch: `.AddScoped<${i.name}, ${impl.name}>()`,
      path: Context.INFRASTRUCTURE_MODULE_PATH,
    });

    this._namespace = new FilePatch({
      marker: 'add-namespace',
      patch: `using ${i.namespace};`,
      path: Context.INFRASTRUCTURE_MODULE_PATH,
    });
  }

  public get files() {
    return [this._registration, this._namespace];
  }
}
