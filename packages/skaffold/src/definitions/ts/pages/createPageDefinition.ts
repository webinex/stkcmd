import { resolve } from 'path';
import { Context } from '@/definitions';
import { CreatePanelDefinition } from '@/definitions/ts/views';
import { PageDefinition } from './pageDefinition';
import { ListPageDefinition } from './listPageDefinition';

export interface CreatePageDefinitionArgs {
  createPanel: CreatePanelDefinition;
  listPage: ListPageDefinition;
}

export class CreatePageDefinition implements PageDefinition {
  public readonly createPanel: CreatePanelDefinition;
  public readonly listPage: ListPageDefinition;

  constructor(args: CreatePageDefinitionArgs) {
    this.createPanel = args.createPanel;
    this.listPage = args.listPage;
  }

  public get url() {
    return `/${this.model.name.kebabCase()}/create`;
  }

  public get name() {
    return `Create${this.model.name.pascalCase()}Page`;
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
      `${this.model.pluralName.pascalCase()}.Create`,
      `${this.name}.tsx`,
    );
  }

  public get model() {
    return this.createPanel.api.model;
  }

  public declaration() {
    return `
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form } from '@webinex/antik';
import { Page } from '@/components';
import { ${this.createPanel.name} } from '@/views';

export function ${this.name}() {
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: '${this.model.pluralName.camelCase()}' });
  const onSubmitted = useCallback(() => navigate('${this.listPage.url}'), [navigate]);

  return (
    <Page htmlTitle={t('create.title')}>
      <Page.Paths>
        <Page.Path href="${this.listPage.url}">{t('title')}</Page.Path>
        <Page.Path>{t('create.title')}</Page.Path>
      </Page.Paths>

      <Page.Body>
        <Page.Card
          title={t('create.title')}
          actions={
            <Form.Submit uid="${this.createPanel.form.uid}">{t('saveBtn')}</Form.Submit>
          }
        >
          <${this.createPanel.name} onSubmitted={onSubmitted} />
        </Page.Card>
      </Page.Body>
    </Page>
  );
}
`.trim();
  }
}
