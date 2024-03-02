import { FileDefinition } from '@/definitions';
import { EntityDefinition } from './entityDefinition';
import { RepositoryInterfaceDefinition } from './repositoryInterfaceDefinition';

export interface CoreCrudDefinitionArgs {
  entity: EntityDefinition;
}

export class CoreCrudModuleDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly repositoryInterface: RepositoryInterfaceDefinition;

  constructor(args: CoreCrudDefinitionArgs) {
    this.entity = args.entity;
    this.repositoryInterface = new RepositoryInterfaceDefinition({ entity: args.entity });
  }

  public get files() {
    return [...this.entity.files, ...this.repositoryInterface.files];
  }
}
