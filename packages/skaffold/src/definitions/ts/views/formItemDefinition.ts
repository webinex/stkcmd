import { EnumDefinition, ModelDefinition, ModelPropertyDefinition } from '@/definitions/ts/common';

export class FormItemUtil {
  public static flatten(
    property: ModelPropertyDefinition,
    prefix?: string,
    collection?: { ignore?: boolean; index?: string },
  ): Array<FormItemDefinition | FormItemCollectionDefinition> {
    const { ignore: ignoreCollection = false, index } = collection ?? {};

    if (!ignoreCollection && property.collection) {
      return [new FormItemCollectionDefinition({ prefix, property })];
    }

    if (property.definition instanceof ModelDefinition) {
      return property.definition.properties.flatMap((x) => {
        let name = prefix ? `${prefix}.${property.name}` : property.name;
        name = index ? `${name}[\${${index}}]` : name;
        return this.flatten(x, name);
      });
    } else {
      return [new FormItemDefinition({ prefix, property })];
    }
  }

  public static name(value: string) {
    return value.includes('${') ? `{\`${value}\`}` : `"${value}"`;
  }
}

export interface FormItemDefinitionArgs {
  prefix?: string;
  property: ModelPropertyDefinition;
}

export class FormItemDefinition {
  public readonly prefix?: string;
  public readonly property: ModelPropertyDefinition;

  constructor(args: FormItemDefinitionArgs) {
    this.prefix = args.prefix;
    this.property = args.property;
  }

  public get name() {
    const result = this.prefix ? `${this.prefix}.${this.property.name}` : this.property.name;
    return FormItemUtil.name(result);
  }

  public get required() {
    return !this.property.nullable;
  }

  public get children() {
    if (this.property.definition instanceof EnumDefinition) {
      return `<Form.EnumSelect type={${this.property.definition.name}} />`;
    }

    switch (this.property.type) {
      case 'boolean':
        return `<Form.Checkbox />`;
      case 'string':
        return this.property.maxLength && ['lg', 'xl'].includes(this.property.maxLength)
          ? `<Form.TextArea />`
          : `<Form.Input />`;
      default:
        return `<Form.${this.property.type.pascalCase()} />`;
    }
  }

  public declaration() {
    return `
<Form.Item name=${this.name}${this.required ? ' required' : ''}>
${this.children.indented(2)}
</Form.Item>
`.trim();
  }
}

export interface FormItemCollectionDefinitionArgs {
  prefix?: string;
  property: ModelPropertyDefinition;
}

export class FormItemCollectionDefinition {
  public readonly prefix?: string;
  public readonly property: ModelPropertyDefinition;

  constructor(args: FormItemCollectionDefinitionArgs) {
    this.prefix = args.prefix;
    this.property = args.property;
  }

  public get nameAttributeValue() {
    return FormItemUtil.name(this.name);
  }

  public get name() {
    return this.prefix ? `${this.prefix}.${this.property.name}` : this.property.name;
  }

  public declaration(): string {
    return `<Form.Collection name=${this.nameAttributeValue}>
  {({ _, index }) => (
    <>
${FormItemUtil.flatten(this.property, this.prefix, { ignore: true, index: 'index' })
  .map((x) => x.declaration())
  .join('\n')
  .indented(6)}
    </>
  )}
</Form.Collection>`;
  }
}
