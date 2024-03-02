import { resolve } from 'path';
import { FileDefinition, Context } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition } from '@/definitions/csharp/core';

export interface DtoDefinitionArgs {
  entity: EntityDefinition;
}

export class DtoDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;

  constructor(args: DtoDefinitionArgs) {
    this.entity = args.entity;
  }

  public get name() {
    return `${this.entity.name}Dto`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Api.Controllers.${this.entity.pluralName}`;
  }

  public get usings() {
    return new Usings([this.entity.namespace, ...this.entity.public.map((x) => x.namespace)]);
  }

  public get pk() {
    return this.entity.pk;
  }

  public get properties() {
    return this.entity.public;
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
      Context.SLN_ROOT,
      `${Context.PRODUCT_NAME}.App.Api`,
      `Controllers.${this.entity.pluralName}`,
      `${this.name}.cs`,
    );
  }

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

public class ${this.name}
{
${this.properties
  .map((x) => x.declaration({ set: false }))
  .join('\n')
  .indented(4)}

    public ${this.name}(${this.entity.name} ${this.entity.name.camelCase()})
    {
${this.properties
  .map((x) => `${x.name} = ${this.entity.name.camelCase()}.${x.name};`)
  .join('\n')
  .indented(8)}
    }
}
`;
  }
}
