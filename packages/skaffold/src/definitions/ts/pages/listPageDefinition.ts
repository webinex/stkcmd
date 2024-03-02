import { resolve } from 'path';
import { Context } from '@/definitions';
import { ListPanelDefinition } from '@/definitions/ts/views';
import { PageDefinition } from './pageDefinition';

export interface ListPageDefinitionArgs {
  listPanel: ListPanelDefinition;
}

export class ListPageDefinition implements PageDefinition {
  public readonly listPanel: ListPanelDefinition;

  constructor(args: ListPageDefinitionArgs) {
    this.listPanel = args.listPanel;
  }

  public get url() {
    return `/${this.model.name.kebabCase()}`;
  }

  public get name() {
    return `${this.model.name.pascalCase()}ListPage`;
  }

  public get files() {
    return [
      {
        path: this.path,
        content: this.declaration(),
      },
    ];
  }

  public get path() {
    return resolve(
      Context.CLIENT_SRC,
      'pages',
      `${this.model.pluralName.pascalCase()}.List`,
      `${this.name}.tsx`,
    );
  }

  public get model() {
    return this.listPanel.api.model;
  }

  public declaration() {
    return `
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { Icon, Page } from '@/components';
import { ${this.listPanel.name} } from '@/views';

export function ${this.name}() {
  const { t } = useTranslation(undefined, { keyPrefix: '${this.model.pluralName.camelCase()}' });

  return (
    <Page htmlTitle={t('title')}>
      <Page.Paths>
        <Page.Path>{t('title')}</Page.Path>
      </Page.Paths>

      <Page.Body>
        <Page.Card
          title={t('title')}
          actions={
            <Link to="/${this.model.name.kebabCase()}/create">
              <Button icon={<Icon type="add" />} type="primary">
                {t('addBtn')}
              </Button>
            </Link>
          }
        >
          <${this.listPanel.name} />
        </Page.Card>
      </Page.Body>
    </Page>
  );
}
`.trim();
  }
}
