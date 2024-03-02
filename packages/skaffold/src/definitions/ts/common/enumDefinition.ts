import { Imports } from './imports';
import { TypeDefinition } from './typeDefinition';

export interface EnumDefinitionArgs {
  name: string;
  values: string[];
}

export class EnumDefinition implements TypeDefinition {
  public name: string;
  public values: string[];

  constructor(args: EnumDefinitionArgs) {
    this.name = args.name;
    this.values = args.values;
  }

  public get imports() {
    return new Imports([[['EnumObjectValue', 'enumObject'], '@/utils']] as const);
  }

  public declaration() {
    return `
export const ${this.name} = enumObject('${this.name}', [${this.values.map((x) => `'${x}'`).join(', ')}] as const);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ${this.name} = EnumObjectValue<typeof ${this.name}>;`;
  }
}
