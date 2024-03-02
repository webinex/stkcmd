import { FileDefinition } from '@/definitions';
import { CoreCrudModuleDefinition } from '@/definitions/csharp/core';
import { UseCasesCrudModuleDefinition } from '@/definitions/csharp/useCases';
import { DtoDefinition } from './dtoDefinition';
import { ControllerDefinition } from './controllerDefinition';

export interface ApiCrudModuleDefinitionArgs {
  core: CoreCrudModuleDefinition;
  useCases: UseCasesCrudModuleDefinition;
}

export class ApiCrudModuleDefinition implements FileDefinition {
  public core: CoreCrudModuleDefinition;
  public useCases: UseCasesCrudModuleDefinition;
  public controller: ControllerDefinition;
  public dto: DtoDefinition;

  constructor(args: ApiCrudModuleDefinitionArgs) {
    this.core = args.core;
    this.useCases = args.useCases;

    this.dto = new DtoDefinition({
      entity: this.core.entity,
    });

    this.controller = new ControllerDefinition({
      ...this.core,
      ...this.useCases,
      dto: this.dto,
    });
  }

  public get files() {
    return [...this.dto.files, ...this.controller.files];
  }
}
