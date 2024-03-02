import { FileDefinition } from '@/definitions/common';
import { BackendCrudModuleDefinition, EntityDefinition } from '@/definitions/csharp';
import { ControllerRemoteApiDefinition } from '@/definitions/integration';
import { FrontendCrudModuleDefinition } from '@/definitions/ts';

export interface FullStackCrudModuleDefinitionArgs {
  entity: EntityDefinition;
}

export class FullStackCrudModuleDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public backend: BackendCrudModuleDefinition;
  public frontend: FrontendCrudModuleDefinition;

  constructor(args: FullStackCrudModuleDefinitionArgs) {
    this.entity = args.entity;
    this.backend = new BackendCrudModuleDefinition({ entity: this.entity });
    const remoteApi = new ControllerRemoteApiDefinition({ controller: this.backend.api.controller });
    this.frontend = new FrontendCrudModuleDefinition({ remoteApi });
  }

  public get files() {
    return [...this.backend.files, ...this.frontend.files];
  }
}
