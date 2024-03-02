import { FileDefinition } from '@/definitions';
import { ViewsCrudModuleDefinition } from '@/definitions/ts/views';
import { ListPageDefinition } from './listPageDefinition';
import { DetailsPageDefinition } from './detailsPageDefinition';
import { CreatePageDefinition } from './createPageDefinition';
import { PagesPatchDefinition } from './pagesPatchDefinition';

export interface PagesCrudModuleDefinitionArgs {
  views: ViewsCrudModuleDefinition;
}

export class PagesCrudModuleDefinition implements FileDefinition {
  public readonly views: ViewsCrudModuleDefinition;
  public readonly listPage: ListPageDefinition;
  public readonly detailsPage: DetailsPageDefinition;
  public readonly createPage: CreatePageDefinition;
  public readonly pagesPatch: PagesPatchDefinition;

  constructor(args: PagesCrudModuleDefinitionArgs) {
    this.views = args.views;

    this.listPage = new ListPageDefinition({ listPanel: this.views.listPanel });
    this.detailsPage = new DetailsPageDefinition({
      detailsPanel: this.views.detailsPanel,
      listPage: this.listPage,
    });
    this.createPage = new CreatePageDefinition({
      createPanel: this.views.createPanel,
      listPage: this.listPage,
    });
    this.pagesPatch = new PagesPatchDefinition({ pages: [this.listPage, this.createPage, this.detailsPage] });
  }

  public get files() {
    return [
      ...this.listPage.files,
      ...this.detailsPage.files,
      ...this.createPage.files,
      ...this.pagesPatch.files,
    ];
  }
}
