import { FileDefinition } from '@/definitions/common';
import { ReduxCrudModuleDefinition, RemoteApi } from './redux';
import { ViewsCrudModuleDefinition } from './views';
import { PagesCrudModuleDefinition } from './pages';

export interface FrontendCrudModuleDefinitionArgs {
  remoteApi: RemoteApi;
}

export class FrontendCrudModuleDefinition implements FileDefinition {
  public readonly remoteApi: RemoteApi;
  public readonly redux: ReduxCrudModuleDefinition;
  public readonly views: ViewsCrudModuleDefinition;
  public readonly pages: PagesCrudModuleDefinition;

  constructor(args: FrontendCrudModuleDefinitionArgs) {
    this.remoteApi = args.remoteApi;
    this.redux = new ReduxCrudModuleDefinition({ remoteApi: args.remoteApi });
    this.views = new ViewsCrudModuleDefinition({ redux: this.redux });
    this.pages = new PagesCrudModuleDefinition({ views: this.views });
  }

  public get files() {
    return [...this.redux.files, ...this.views.files, ...this.pages.files];
  }
}
