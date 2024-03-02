import { ModelDefinition, ModelPropertyDefinition } from '@/definitions/ts/common';

export interface YupSchemaDefinitionArgs {
  model: ModelDefinition;
}

export class YupSchemaDefinition {
  public readonly model: ModelDefinition;

  constructor(args: YupSchemaDefinitionArgs) {
    this.model = args.model;
  }

  public get name() {
    return `${this.model.name.snakeCase().toUpperCase()}_SCHEMA`;
  }

  public declaration() {
    const properties = this.model.nonPk
      .map((x) => `${x.name}: ${this.prop(x)}`)
      .join(',\n')
      .indented(2);

    return `
const ${this.model.name.snakeCase().toUpperCase()}_SCHEMA = Yup.object({
${properties}
});`.trim();
  }

  public prop(property: ModelPropertyDefinition) {
    const yup =
      property.definition instanceof ModelDefinition
        ? this.objectProp(property)
        : this.nonObjectProp(property);
    return property.collection ? `Yup.array(${yup})` : yup;
  }

  private objectProp(property: ModelPropertyDefinition): string {
    const object = property.definition as ModelDefinition;
    const properties = object.properties.map((x) => `${x.name}: ${this.prop(x)}`).join(',\n');

    return `
Yup.object({
${properties.indented(2)}
})${property.nullable ? '.defined()' : '.required()'}`.trim();
  }

  private nonObjectProp(property: ModelPropertyDefinition) {
    const path = ['Yup'];

    if (property.type === 'string') {
      path.push('string()');

      if (!property.maxLength) {
        path.push('field()');
      } else if (typeof property.maxLength === 'string') {
        path.push(`field('${property.maxLength}')`);
      } else {
        path.push;
      }
    } else if (property.type === 'number') {
      path.push('number()');
    } else if (property.type === 'Date') {
      path.push('date()');
    } else if (property.type === 'boolean') {
      path.push('bool()');
    } else {
      path.push(`mixed<${property.type}>()`);
    }

    path.push('nullable()');

    if (property.nullable) {
      path.push('defined()');
    } else {
      path.push('required()');
    }

    return path.join('.');
  }
}
