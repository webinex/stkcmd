import { FileDefinition } from '@/definitions';
import { CoreCrudModuleDefinition } from '@/definitions/csharp/core';
import { RepositoryDefinition } from './repositoryDefinition';
import { EntityConfigurationDefinition } from './entityConfigurationDefinition';
import { DbContextPatchDefinition } from './dbContextPatchDefinition';
import { RegisterRepositoryPatchDefinition } from './registerRepositoryPatchDefinition';

export interface InfraCrudModuleDefinitionArgs {
  core: CoreCrudModuleDefinition;
}

export class InfraCrudModuleDefinition implements FileDefinition {
  public core: CoreCrudModuleDefinition;
  public repository: RepositoryDefinition;
  public entityConfiguration: EntityConfigurationDefinition;
  public dbContextPatch: DbContextPatchDefinition;
  public registerRepositoryPatch: RegisterRepositoryPatchDefinition;

  constructor(args: InfraCrudModuleDefinitionArgs) {
    this.core = args.core;
    this.repository = new RepositoryDefinition({
      entity: this.core.entity,
      interface: this.core.repositoryInterface,
    });
    this.entityConfiguration = new EntityConfigurationDefinition({ entity: this.core.entity });
    this.dbContextPatch = new DbContextPatchDefinition({ entity: args.core.entity });
    this.registerRepositoryPatch = new RegisterRepositoryPatchDefinition({
      interface: args.core.repositoryInterface,
      impl: this.repository,
    });
  }

  public get files() {
    return [
      ...this.repository.files,
      ...this.entityConfiguration.files,
      ...this.dbContextPatch.files,
      ...this.registerRepositoryPatch.files,
    ];
  }
}
