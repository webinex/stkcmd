import { Context, FileDefinition } from '@/definitions';
import { ModelPropertyDefinition } from './modelPropertyDefinition';
import { ValueObjectDefinitionBase } from './valueObjectDefinitionBase';
import { Usings } from '@/definitions/csharp/common';

export interface ValueObjectDefinitionArgs {
  name: string;
  namespace: string;
  directory: string;
  properties: ModelPropertyDefinition[];
}

export class ValueObjectDefinition implements ValueObjectDefinitionBase, FileDefinition {
  public readonly name: string;
  public readonly namespace: string;
  public readonly directory: string;
  public readonly properties: ModelPropertyDefinition[];

  constructor(args: ValueObjectDefinitionArgs) {
    this.name = args.name;
    this.namespace = args.namespace;
    this.directory = args.directory;
    this.properties = args.properties;
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
      ...this.properties.filter((x) => x.definition).flatMap((x) => x.definition!.files),
    ];
  }

  public get usings() {
    return new Usings([
      'System',
      'System.Collections.Generic',
      'System.ComponentModel.DataAnnotations',
      `${Context.PRODUCT_NAME}.App.Core.Common.Types`,
    ]);
  }

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

public class ${this.name} : ValueObject
{
${this.properties
  .map((x) => x.declaration({ set: 'protected' }))
  .join('\n')
  .indented(4)}

    public ${this.name}(${this.properties.map((x) => x.param()).join(', ')})
    {
${this.properties
  .map((x) => x.assign({ clone: true }))
  .join('\n')
  .indented(8)}
    }

    protected ${this.name}()
    {
    }

    public ${this.name} Clone() {
        return new ${this.name}(${this.properties.map((x) => x.name).join(', ')});
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
${this.properties.map(this.yieldReturn).join('\n').indented(8)}
    }
}
    `.trim();
  }

  private yieldReturn(x: ModelPropertyDefinition) {
    if (x.collection) {
      return `foreach (var item in ${x.name}) yield return item;`;
    }

    return `yield return ${x.name};`;
  }
}
