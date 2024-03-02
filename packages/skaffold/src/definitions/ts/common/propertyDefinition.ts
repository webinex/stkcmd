export interface PropertyDefinitionArgs {
  type: string;
  name: string;
  nullable?: boolean;
  collection?: boolean;
}

export class PropertyDefinition {
  public type: string;
  public nullable: boolean;
  public name: string;
  public collection: boolean;

  constructor(args: PropertyDefinitionArgs) {
    this.type = args.type;
    this.nullable = args.nullable || false;
    this.name = args.name;
    this.collection = args.collection || false;
  }

  public declaration() {
    let type = this.nullable ? `${this.type} | null` : this.type;
    type = this.collection && this.nullable ? `Array<${type}>` : this.collection ? `${type}[]` : type;
    return `${this.name}: ${type};`;
  }
}
