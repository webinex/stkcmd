import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { ApiDefinition } from '@/definitions/ts/redux';
import { ModelPropertyDefinition } from '@/definitions/ts/common';

export interface ListPanelDefinitionArgs {
  api: ApiDefinition;
}

export class ListPanelDefinition implements FileDefinition {
  public readonly api: ApiDefinition;

  constructor(args: ListPanelDefinitionArgs) {
    this.api = args.api;
  }

  public get name() {
    return `${this.api.model.name.pascalCase()}ListPanel`;
  }

  public get files() {
    return [
      {
        path: this.path(),
        content: this.declaration(),
      },
    ];
  }

  public path() {
    return resolve(
      Context.CLIENT_SRC,
      'views',
      `${this.api.model.pluralName.pascalCase()}.List`,
      `${this.name}.tsx`,
    );
  }

  public get useRemoveDeclaration() {
    return `
function useRemove() {
  const [remove] = ${this.api.deleteMutation.use}();

  return useCallback(
    (${this.api.model.pk.name.camelCase()}: ${this.api.model.pk.type}) =>
      remove({ ${this.api.model.pk.name.camelCase()} })
        .unwrap()
        .then(() => notify.success.t('${this.api.model.pluralName.camelCase()}.deleted')),
    [remove],
  );
}`.trim();
  }

  public declaration() {
    return `
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { array } from '@/utils';
import { ${this.api.model.name}, ${this.api.getAllQuery.use}, ${this.api.deleteMutation.use} } from '@/redux';
import { Delete, Icon, Table, TableColumnType, notify } from '@/components';

${this.useRemoveDeclaration}

${this.useColumnsDeclaration()}

export function ${this.name}() {
  const { data = array.empty<${this.api.model.name}>() } = ${this.api.getAllQuery.use}();
  const columns = useColumns();

  return <Table uid="${this.api.model.name.kebabCase()}-list" dataSource={data} columns={columns} />;
}
`.trim();
  }

  public useColumnsDeclaration() {
    return `
function useColumns() {
  const { t } = useTranslation(undefined, { keyPrefix: '${this.api.model.pluralName.camelCase()}' });
  const remove = useRemove();

  return useMemo<TableColumnType<${this.api.model.name}>[]>(() => {
    return [
${this.api.model.nonPk
  .map((x, index) => this.columnDeclaration(x, index === 0))
  .join(',\n')
  .indented(6)},
      {
        key: 'actions',
        title: t('actions'),
        render: (_, { ${this.api.model.pk.name.camelCase()} }) => (
          <Delete name={t('entityName')} onConfirm={() => remove(${this.api.model.pk.name.camelCase()})}>
            <Button icon={<Icon type='delete' />} type="link" />
          </Delete>
        ),
      },
    ];
  }, [t, remove]);
}
`.trim();
  }

  public columnDeclaration(property: ModelPropertyDefinition, first: boolean) {
    const render = first
      ? `\n  render: (_, { ${this.api.model.pk.name}, ${property.name} }) => <Link to={\`/${this.api.model.name.kebabCase()}/\${${this.api.model.pk.name}}\`}>{${property.name}}</Link>,`
      : '';

    return `{
  key: '${property.name}',
  title: t('${property.name}'),
  dataIndex: '${property.name}',${render}
}`;
  }
}
