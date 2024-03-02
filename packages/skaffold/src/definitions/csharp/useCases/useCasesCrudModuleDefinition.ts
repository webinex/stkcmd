import { FileDefinition } from '@/definitions';
import { CoreCrudModuleDefinition } from '@/definitions/csharp/core';
import { CreateCommandDefinition } from './createCommandDefinition';
import { UpdateCommandDefinition } from './updateCommandDefinition';
import { DeleteCommandDefinition } from './deleteCommandDefinition';
import { GetQueryDefinition } from './getQueryDefinition';
import { GetAllQueryDefinition } from './getAllQueryDefinition';

export interface UseCasesCrudModuleDefinitionArgs {
  core: CoreCrudModuleDefinition;
}

export class UseCasesCrudModuleDefinition implements FileDefinition {
  public core: CoreCrudModuleDefinition;
  public createCommand: CreateCommandDefinition;
  public updateCommand: UpdateCommandDefinition;
  public deleteCommand: DeleteCommandDefinition;
  public getQuery: GetQueryDefinition;
  public getAllQuery: GetAllQueryDefinition;

  constructor(args: UseCasesCrudModuleDefinitionArgs) {
    this.core = args.core;
    this.createCommand = new CreateCommandDefinition({
      entity: this.core.entity,
      repositoryInterface: this.core.repositoryInterface,
    });
    this.updateCommand = new UpdateCommandDefinition({
      entity: this.core.entity,
      repositoryInterface: this.core.repositoryInterface,
    });
    this.deleteCommand = new DeleteCommandDefinition({
      entity: this.core.entity,
      repositoryInterface: this.core.repositoryInterface,
    });
    this.getQuery = new GetQueryDefinition({
      entity: this.core.entity,
      repositoryInterface: this.core.repositoryInterface,
    });
    this.getAllQuery = new GetAllQueryDefinition({
      entity: this.core.entity,
      repositoryInterface: this.core.repositoryInterface,
    });
  }

  public get files() {
    return [
      ...this.createCommand.files,
      ...this.updateCommand.files,
      ...this.deleteCommand.files,
      ...this.getQuery.files,
      ...this.getAllQuery.files,
    ];
  }
}
