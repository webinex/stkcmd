import { resolve } from 'path';
import { Context } from '@/definitions';
import { DetailsPanelDefinition } from '@/definitions/ts/views';
import { PageDefinition } from './pageDefinition';
import { ListPageDefinition } from './listPageDefinition';

export interface DetailsPageDefinitionArgs {
  detailsPanel: DetailsPanelDefinition;
  listPage: ListPageDefinition;
}

export class DetailsPageDefinition implements PageDefinition {
  public readonly detailsPanel: DetailsPanelDefinition;
  public readonly listPage: ListPageDefinition;

  constructor(args: DetailsPageDefinitionArgs) {
    this.detailsPanel = args.detailsPanel;
    this.listPage = args.listPage;
  }

  public get url() {
    return `/${this.model.name.kebabCase()}/:${this.model.pk.name}`;
  }

  public get name() {
    return `${this.model.name.pascalCase()}DetailsPage`;
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
      `${this.model.pluralName.pascalCase()}.Details`,
      `${this.name}.tsx`,
    );
  }

  public get model() {
    return this.detailsPanel.api.model;
  }

  public declaration() {
    return `
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Form } from '@webinex/antik';
import { Page } from '@/components';
import { ${this.detailsPanel.name} } from '@/views';

export function ${this.name}() {
  const navigate = useNavigate();
  const { ${this.model.pk.name} } = useParams<'${this.model.pk.name}'>();
  const { t } = useTranslation(undefined, { keyPrefix: '${this.model.pluralName.camelCase()}' });
  const onSubmitted = useCallback(() => navigate('${this.listPage.url}'), [navigate]);

  return (
    <Page htmlTitle={t('details.title')}>
      <Page.Paths>
        <Page.Path href="${this.listPage.url}">{t('title')}</Page.Path>
        <Page.Path>{t('details.title')}</Page.Path>
      </Page.Paths>

      <Page.Body>
        <Page.Card
          title={t('details.title')}
          actions={
            <Form.Submit uid="${this.detailsPanel.form.uid}">{t('saveBtn')}</Form.Submit>
          }
        >
          <${this.detailsPanel.name} ${this.model.pk.name}={${this.model.pk.name}!} onSubmitted={onSubmitted} />
        </Page.Card>
      </Page.Body>
    </Page>
  );
}
`.trim();
  }
}
