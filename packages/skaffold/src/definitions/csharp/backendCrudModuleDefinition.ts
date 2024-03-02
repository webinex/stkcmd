import { FileDefinition } from '@/definitions';
import { EntityDefinition, CoreCrudModuleDefinition } from '@/definitions/csharp/core';
import { InfraCrudModuleDefinition } from './infra';
import { UseCasesCrudModuleDefinition } from './useCases';
import { MigrationDefinition } from './migrations';
import { ApiCrudModuleDefinition } from './api';

export interface BackendCrudModuleDefinitionArgs {
  entity: EntityDefinition;
}

export class BackendCrudModuleDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly core: CoreCrudModuleDefinition;
  public readonly infra: InfraCrudModuleDefinition;
  public readonly useCases: UseCasesCrudModuleDefinition;
  public readonly migration: MigrationDefinition;
  public readonly api: ApiCrudModuleDefinition;

  constructor(args: BackendCrudModuleDefinitionArgs) {
    this.entity = args.entity;

    this.core = new CoreCrudModuleDefinition({ entity: args.entity });

    this.infra = new InfraCrudModuleDefinition({
      core: this.core,
    });

    this.useCases = new UseCasesCrudModuleDefinition({
      core: this.core,
    });

    this.migration = new MigrationDefinition({
      entity: args.entity,
    });

    this.api = new ApiCrudModuleDefinition({
      core: this.core,
      useCases: this.useCases,
    });
  }

  public get files() {
    return [
      ...this.core.files,
      ...this.migration.files,
      ...this.infra.files,
      ...this.useCases.files,
      ...this.api.files,
    ];
  }
}
