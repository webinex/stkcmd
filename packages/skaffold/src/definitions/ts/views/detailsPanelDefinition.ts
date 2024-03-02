import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { ApiDefinition } from '@/definitions/ts/redux';
import { FormDefinition } from './formDefinition';

export interface DetailsPanelDefinitionArgs {
  api: ApiDefinition;
  form: FormDefinition;
}

export class DetailsPanelDefinition implements FileDefinition {
  public readonly api: ApiDefinition;
  public readonly form: FormDefinition;

  constructor(args: DetailsPanelDefinitionArgs) {
    this.api = args.api;
    this.form = args.form;
  }

  public get name() {
    return `${this.api.model.name.pascalCase()}DetailsPanel`;
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
      `${this.api.model.pluralName.pascalCase()}.Details`,
      `${this.name}.tsx`,
    );
  }

  public declaration() {
    return `
import { useCallback } from 'react';
import { ${this.api.getQuery.use}, ${this.api.updateMutation.use} } from '@/redux';
import { notify } from '@/components';
import { ${this.form.name}, ${this.form.formValueName} } from './${this.form.name}';

export interface ${this.name}Props {
  ${this.api.model.pk.name}: ${this.api.model.pk.type};
  onSubmitted?: () => void;
}

function useSubmit(props: ${this.name}Props) {
  const { ${this.api.model.pk.name}, onSubmitted } = props;
  const [update] = ${this.api.updateMutation.use}();

  return useCallback((value: ${this.form.formValueName}) => update({ ${this.api.model.pk.name}, ...value })
    .unwrap()
    .then(() => notify.success.t('${this.api.model.pluralName.camelCase()}.updated'))
    .then(() => onSubmitted && onSubmitted()), [${this.api.model.pk.name}, onSubmitted, update]);
}

export function ${this.name}(props: ${this.name}Props) {
  const { ${this.api.model.pk.name} } = props;
  const onSubmit = useSubmit(props);
  const { data } = ${this.api.getQuery.use}({ ${this.api.model.pk.name} });

  if (!data) {
    return null;
  }

  return (
    <div>
      <${this.form.name} value={data} onSubmit={onSubmit} />
    </div>
  );
}
`.trim();
  }
}
