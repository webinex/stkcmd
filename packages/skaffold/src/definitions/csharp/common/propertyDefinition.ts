import { Access } from './common';
import { Type } from './type';

export interface PropertyDefinitionArgs {
  name: string;
  type: string;
  nullable?: boolean;
  // TODO: webinex, to make collection underlying type or property nullable
  collection?: boolean;
}

export class PropertyDefinition {
  public readonly name: string;
  public readonly type: string;
  public readonly nullable: boolean;
  public readonly collection: boolean;

  constructor(args: PropertyDefinitionArgs) {
    this.name = args.name;
    this.type = args.type;
    this.nullable = args.nullable || false;
    this.collection = args.collection || false;
  }

  public get shortType() {
    return Type.short(this.type);
  }

  public get namespace() {
    const split = this.type.split('.');
    return split.length > 1 ? split.slice(0, -1).join('.') : undefined;
  }

  public declaration(
    { access, get, set }: { access: Access; get?: boolean | Access; set?: boolean | Access } = {
      access: 'public',
    },
  ) {
    const type = this.valueTypeDeclaration;
    const getter = get === false ? undefined : typeof get === 'string' ? `${get} get;` : 'get;';
    const setter = set === false ? undefined : typeof set === 'string' ? `${set} set;` : 'set;';
    const accessors = [getter, setter].filter((x) => x).join(' ');
    return `${access} ${type} ${this.name} { ${accessors} }`;
  }

  private get valueTypeDeclaration() {
    const result = `${this.shortType}${this.nullable ? '?' : ''}`;
    return this.collection ? `IReadOnlyCollection<${result}>` : result;
  }

  public param() {
    return `${this.valueTypeDeclaration} ${this.name.camelCase()}`;
  }

  public assign(argsOrEnd: { end?: ';' | ','; auto?: boolean; call?: string } | ';' | ',' = ';') {
    const args = typeof argsOrEnd === 'string' ? { end: argsOrEnd } : argsOrEnd;
    const end = args.end ?? ';';
    const value = args.auto
      ? this.autoValue
      : args.call
        ? `${this.name.camelCase()}.${args.call}`
        : this.name.camelCase();
    return `${this.name} = ${value}${end}`;
  }

  public get autoValue() {
    switch (this.type) {
      case 'System.DateTime':
        return 'DateTime.UtcNow';
      case 'Syste.DateTimeOffset':
        return 'DateTimeOffset.UtcNow';
      case 'System.Guid':
        return 'Guid.NewGuid()';
      default:
        return 'default';
    }
  }
}
