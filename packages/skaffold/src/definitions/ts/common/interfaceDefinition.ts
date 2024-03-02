import pluralize from 'pluralize';
import { PropertyDefinition } from './propertyDefinition';
import { TypeDefinition } from './typeDefinition';

export interface InterfaceDefinitionArgs {
  name: string;
  properties: PropertyDefinition[];
}

export class InterfaceDefinition implements TypeDefinition {
  public name: string;
  public properties: PropertyDefinition[];

  constructor(args: InterfaceDefinitionArgs) {
    this.name = args.name;
    this.properties = args.properties;
  }

  public get pluralName() {
    return pluralize(this.name);
  }

  public declaration() {
    return `
export interface ${this.name} {
${this.properties
  .map((x) => x.declaration())
  .join('\n')
  .indented(2)}
}
`.trim();
  }
}
