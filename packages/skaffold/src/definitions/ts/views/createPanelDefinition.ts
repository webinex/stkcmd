import { resolve } from 'path';
import { Context, FileDefinition, pathUtil } from '@/definitions';
import { ApiDefinition } from '@/definitions/ts/redux';
import { FormDefinition } from './formDefinition';

export interface CreatePanelDefinitionArgs {
  api: ApiDefinition;
  form: FormDefinition;
}

export class CreatePanelDefinition implements FileDefinition {
  public readonly api: ApiDefinition;
  public readonly form: FormDefinition;

  constructor(args: CreatePanelDefinitionArgs) {
    this.api = args.api;
    this.form = args.form;
  }

  public get name() {
    return `Create${this.api.model.name.pascalCase()}Panel`;
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
      `${this.api.model.pluralName.pascalCase()}.Create`,
      `${this.name}.tsx`,
    );
  }

  public declaration() {
    let formPath = pathUtil.relativePath(this.path(), this.form.path());
    formPath = formPath.startsWith('..') ? formPath : `./${formPath}`;

    return `
import { useCallback } from 'react';
import { ${this.api.createMutation.use} } from '@/redux';
import { notify } from '@/components';
import { ${this.form.name}, ${this.form.initialValueName}, ${this.form.formValueName} } from '${formPath}';

function useSubmit(props: ${this.name}Props) {
  const { onSubmitted } = props;
  const [create] = ${this.api.createMutation.use}();

  return useCallback((value: ${this.form.formValueName}) => create(value)
    .unwrap()
    .then(() => notify.success.t('${this.api.model.pluralName.camelCase()}.created'))
    .then(() => onSubmitted && onSubmitted()), [create, onSubmitted]);
}

export interface ${this.name}Props {
  onSubmitted?: () => void;
}

export function ${this.name}(props: ${this.name}Props) {
  const onSubmit = useSubmit(props);

  return (
    <div>
      <${this.form.name} value={${this.form.initialValueName}} onSubmit={onSubmit} />
    </div>
  );
}
`.trim();
  }
}
