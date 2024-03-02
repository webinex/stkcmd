import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition, RepositoryInterfaceDefinition } from '@/definitions/csharp/core';

export interface CreateCommandDefinitionArgs {
  entity: EntityDefinition;
  repositoryInterface: RepositoryInterfaceDefinition;
}

export class CreateCommandDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly repositoryInterface: RepositoryInterfaceDefinition;

  constructor(args: CreateCommandDefinitionArgs) {
    this.entity = args.entity;
    this.repositoryInterface = args.repositoryInterface;
  }

  public get name() {
    return `Create${this.entity.name}Command`;
  }

  public get properties() {
    return this.entity.nonAuto;
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
      `${Context.PRODUCT_NAME}.App.Core.UseCases`,
      this.entity.pluralName,
      `${this.name}.cs`,
    );
  }

  public get usings() {
    return new Usings([
      this.entity.pk.namespace,
      'System.Threading',
      'System.Threading.Tasks',
      'MediatR',
      this.entity.namespace,
      Context.UNIT_OF_WORK_NAMESPACE,
    ]);
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Core.UseCases.${this.entity.pluralName}`;
  }

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

public class ${this.name} : IRequest<${this.entity.pk.shortType}>
{
${this.properties
  .map((x) => x.declaration({ set: false }))
  .join('\n')
  .indented(4)}

${this.constructorDefinition().indented(4)}

${this.handlerDefinition().indented(4)}
}`.trim();
  }

  public constructorDefinition() {
    return `
public ${this.name}(${this.properties.map((x) => x.param()).join(', ')})
{
${this.properties
  .map((x) => x.assign())
  .join('\n')
  .indented(4)}
}`.trim();
  }

  public handlerDefinition() {
    return `
internal class Handler : IRequestHandler<${this.name}, ${this.entity.pk.shortType}>
{
    private readonly ${this.repositoryInterface.name} _${this.repositoryInterface.name.param()};
    private readonly ${Context.UNIT_OF_WORK_INTERFACE} _${Context.UNIT_OF_WORK_INTERFACE.param()};

    public Handler(
        ${Context.UNIT_OF_WORK_INTERFACE} ${Context.UNIT_OF_WORK_INTERFACE.param()},
        ${this.repositoryInterface.name} ${this.repositoryInterface.name.param()})
    {
        _${this.repositoryInterface.name.param()} = ${this.repositoryInterface.name.param()};
        _${Context.UNIT_OF_WORK_INTERFACE.param()} = ${Context.UNIT_OF_WORK_INTERFACE.param()};
    }

    public async Task<${this.entity.pk.shortType}> Handle(${this.name} command, CancellationToken _)
    {
        var ${this.entity.name.camelCase()} = ${this.entity.name}.New(${this.properties.map((x) => `command.${x.name}`).join(', ')});
        await _${this.repositoryInterface.name.param()}.${this.repositoryInterface.addMethodName}(${this.entity.name.camelCase()});
        await _${Context.UNIT_OF_WORK_INTERFACE.param()}.CommitAsync();
        return ${this.entity.name.camelCase()}.${this.entity.pk.name};
    }
}`.trim();
  }
}
