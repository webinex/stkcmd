import { Context } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { ValueObjectDefinitionBase } from './valueObjectDefinitionBase';

export interface EnumValueObjectDefinitionArgs {
  name: string;
  namespace: string;
  directory: string;
  values: string[];
}

export class EnumValueObjectDefinition implements ValueObjectDefinitionBase {
  public readonly name: string;
  public readonly namespace: string;
  public readonly directory: string;
  public readonly values: string[];

  constructor(args: EnumValueObjectDefinitionArgs) {
    this.name = args.name;
    this.namespace = args.namespace;
    this.directory = args.directory;
    this.values = args.values;
  }

  public get type() {
    return `${this.namespace}.${this.name}`;
  }

  public get files() {
    return [
      {
        path: this.directory + `/${this.name}.cs`,
        content: this.declaration(),
      },
    ];
  }

  public get usings() {
    return new Usings([`${Context.PRODUCT_NAME}.App.Core.Common.Types`, 'System.Collections.Generic']);
  }

  public declaration() {
    return [this.usings.declaration(), `namespace ${this.namespace};`, this.class]
      .filter((x) => x.trim().length > 0)
      .join('\n\n');
  }

  public get class() {
    return `
public class ${this.name} : EnumValue<string>
{
${this.values
  .map((x) => `public static ${this.name} ${x} => new() { Value = "${x}" };`)
  .join('\n')
  .indented(4)}

    public ${this.name}(string value) : base(value)
    {
    }

    protected ${this.name}()
    {
    }

    public ${this.name} Clone() => new() { Value = Value };

    private static HashSet<string> POSSIBLE_VALUES = new()
    {
${this.values
  .map((x) => `"${x}"`)
  .join(',\n')
  .indented(8)}
    };

    protected override HashSet<string> PossibleValues { get; } = POSSIBLE_VALUES;
}`;
  }
}
