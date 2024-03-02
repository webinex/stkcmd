import { FileDefinition } from '@/definitions';
import { ExportModuleIndexPatchDefinition, IndexModuleDefinition } from '@/definitions/ts/common';
import { ReduxCrudModuleDefinition } from '@/definitions/ts/redux';
import { FormDefinition } from './formDefinition';
import { DetailsPanelDefinition } from './detailsPanelDefinition';
import { ListPanelDefinition } from './listPanelDefinition';
import { CreatePanelDefinition } from './createPanelDefinition';

export interface ViewsCrudModuleDefinitionArgs {
  redux: ReduxCrudModuleDefinition;
}

export class ViewsCrudModuleDefinition implements FileDefinition {
  public readonly redux: ReduxCrudModuleDefinition;
  public readonly form: FormDefinition;
  public readonly detailsPanel: DetailsPanelDefinition;
  public readonly detailsIndex: IndexModuleDefinition;
  public readonly detailsViewsIndexPatch: ExportModuleIndexPatchDefinition;
  public readonly listPanel: ListPanelDefinition;
  public readonly listIndex: IndexModuleDefinition;
  public readonly listViewsIndexPatch: ExportModuleIndexPatchDefinition;
  public readonly createPanel: CreatePanelDefinition;
  public readonly createIndex: IndexModuleDefinition;
  public readonly createViewsIndexPatch: ExportModuleIndexPatchDefinition;

  constructor(args: ViewsCrudModuleDefinitionArgs) {
    this.redux = args.redux;

    this.form = new FormDefinition({
      model: this.redux.types.model,
    });

    this.detailsPanel = new DetailsPanelDefinition({
      api: this.redux.api,
      form: this.form,
    });
    this.detailsIndex = new IndexModuleDefinition({ definitions: [this.detailsPanel, this.form] });
    this.detailsViewsIndexPatch = new ExportModuleIndexPatchDefinition({ index: this.detailsIndex });

    this.createPanel = new CreatePanelDefinition({ api: this.redux.api, form: this.form });
    this.createIndex = new IndexModuleDefinition({ definitions: [this.createPanel] });
    this.createViewsIndexPatch = new ExportModuleIndexPatchDefinition({ index: this.createIndex });

    this.listPanel = new ListPanelDefinition({ api: this.redux.api });
    this.listIndex = new IndexModuleDefinition({ definitions: [this.listPanel] });
    this.listViewsIndexPatch = new ExportModuleIndexPatchDefinition({ index: this.listIndex });
  }

  public get files() {
    return [
      ...this.form.files,
      ...this.detailsPanel.files,
      ...this.detailsIndex.files,
      ...this.detailsViewsIndexPatch.files,
      ...this.createPanel.files,
      ...this.createIndex.files,
      ...this.createViewsIndexPatch.files,
      ...this.listPanel.files,
      ...this.listIndex.files,
      ...this.listViewsIndexPatch.files,
    ];
  }
}
