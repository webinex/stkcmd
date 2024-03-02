import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { ModelDefinition, ModelPropertyDefinition } from '@/definitions/ts/common';
import { FormItemUtil } from './formItemDefinition';
import { YupSchemaDefinition } from './yupSchemaDefinition';

export interface FormDefinitionArgs {
  model: ModelDefinition;
}

export class FormDefinition implements FileDefinition {
  public readonly model: ModelDefinition;

  constructor(args: FormDefinitionArgs) {
    this.model = args.model;
  }

  public get name() {
    return `${this.model.name.pascalCase()}Form`;
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
      `${this.model.pluralName.pascalCase()}.Details`,
      `${this.name}.tsx`,
    );
  }

  public get schema() {
    return new YupSchemaDefinition({ model: this.model });
  }

  public get initialValueName() {
    return `${this.model.name.snakeCase().toUpperCase()}_INITIAL_VALUE`;
  }

  public get initialValueDeclaration() {
    const properties = this.model.nonPk
      .map((x) => `${x.name}: null!`)
      .join(',\n')
      .indented(2);

    return `
export const ${this.initialValueName}: ${this.formValueName} = {
${properties}
};`;
  }

  public get formValueName() {
    return `${this.name}Value`;
  }

  public get uid() {
    return this.name.kebabCase();
  }

  public get formItems() {
    return this.model.nonPk.flatMap((x) => this.formItem(x));
  }

  public formItem(property: ModelPropertyDefinition, prefix?: string) {
    return FormItemUtil.flatten(property, prefix);
  }

  public get propsName() {
    return `${this.name}Props`;
  }

  public get propsDeclaration() {
    return `
export interface ${this.propsName} {
  value: ${this.formValueName};
  onSubmit: (value: ${this.formValueName}) => void;
}`.trim();
  }

  public get formDeclaration() {
    return `
export function ${this.name}(props: ${this.propsName}) {
  const { value, onSubmit } = props;

  return (
    <Form<${this.formValueName}>
      uid="${this.uid}"
      type="formik"
      initialValues={value}
      validationSchema={${this.schema.name}}
      onSubmit={onSubmit}
    >
${this.formItems
  .map((x) => x.declaration())
  .join('\n')
  .indented(6)}
    </Form>
  );
}
    `.trim();
  }

  public declaration() {
    return `
import * as Yup from 'yup';
import { Form } from '@webinex/antik';

${this.propsDeclaration}

${this.schema.declaration()}

${this.initialValueDeclaration}

export type ${this.formValueName} = Yup.InferType<typeof ${this.schema.name}>;

${this.formDeclaration}

`.trim();
  }
}
