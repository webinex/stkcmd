import { FileDefinition } from '@/definitions';
import { ApiDefinition, BaseApiPatchDefinition, RemoteApi } from './api';
import { TypesDefinition } from './typesDefinition';
import { ExportModuleIndexPatchDefinition, IndexModuleDefinition } from '..';

export interface ReduxCrudModuleDefinitionArgs {
  remoteApi: RemoteApi;
}

export class ReduxCrudModuleDefinition implements FileDefinition {
  public readonly remoteApi: RemoteApi;
  public readonly types: TypesDefinition;
  public readonly api: ApiDefinition;
  public readonly baseApiPatch: BaseApiPatchDefinition;
  public readonly subModuleIndex: IndexModuleDefinition;
  public readonly reduxModuleIndexPatch: ExportModuleIndexPatchDefinition;

  constructor(args: ReduxCrudModuleDefinitionArgs) {
    this.remoteApi = args.remoteApi;

    this.types = new TypesDefinition({
      remoteApi: this.remoteApi,
    });

    this.api = new ApiDefinition({
      remoteApi: this.remoteApi,
      types: this.types,
    });

    this.subModuleIndex = new IndexModuleDefinition({ definitions: [this.api, this.types] });

    this.baseApiPatch = new BaseApiPatchDefinition({ api: this.api });

    this.reduxModuleIndexPatch = new ExportModuleIndexPatchDefinition({
      index: this.subModuleIndex,
    });
  }

  public get files() {
    return [
      ...this.types.files,
      ...this.api.files,
      ...this.subModuleIndex.files,
      ...this.baseApiPatch.files,
      ...this.reduxModuleIndexPatch.files,
    ];
  }
}
