import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition, RepositoryInterfaceDefinition } from '@/definitions/csharp/core';

export interface UpdateCommandDefinitionArgs {
  entity: EntityDefinition;
  repositoryInterface: RepositoryInterfaceDefinition;
}

export class UpdateCommandDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly repositoryInterface: RepositoryInterfaceDefinition;

  constructor(args: UpdateCommandDefinitionArgs) {
    this.entity = args.entity;
    this.repositoryInterface = args.repositoryInterface;
  }

  public get name() {
    return `Update${this.entity.name}Command`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Core.UseCases.${this.entity.pluralName}`;
  }

  public get properties() {
    return [this.entity.pk].concat(this.entity.mutable);
  }

  public get params() {
    return this.entity.mutable;
  }

  public get usings() {
    return new Usings([
      this.entity.namespace,
      Context.UNIT_OF_WORK_NAMESPACE,
      ...this.entity.mutable.map((x) => x.namespace),
      this.entity.pk.namespace,
      'System.Threading',
      'System.Threading.Tasks',
      'MediatR',
    ]);
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

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

public class ${this.name} : IRequest
{
${this.properties
  .map((x) => x.declaration({ set: false }))
  .join('\n')
  .indented(4)}

    public ${this.name}(${[this.entity.pk]
      .concat(this.entity.mutable)
      .map((x) => x.param())
      .join(', ')})
    {
${this.properties
  .map((x) => x.assign())
  .join('\n')
  .indented(8)}
    }

    internal class Handler : IRequestHandler<${this.name}>
    {
        private readonly ${this.repositoryInterface.name} _${this.repositoryInterface.name.param()};
        private readonly ${Context.UNIT_OF_WORK_INTERFACE} _${Context.UNIT_OF_WORK_INTERFACE.param()};

        public Handler(
            ${this.repositoryInterface.name} ${this.repositoryInterface.name.param()},
            ${Context.UNIT_OF_WORK_INTERFACE} ${Context.UNIT_OF_WORK_INTERFACE.param()})
        {
            _${this.repositoryInterface.name.param()} = ${this.repositoryInterface.name.param()};
            _${Context.UNIT_OF_WORK_INTERFACE.param()} = ${Context.UNIT_OF_WORK_INTERFACE.param()};
        }

        public async Task Handle(${this.name} command, CancellationToken _)
        {
            var ${this.entity.name.camelCase()} = await _${this.repositoryInterface.name.param()}.${this.repositoryInterface.byIdMethodName}(command.${this.entity.pk.name});
            ${this.entity.name.camelCase()}.Update(${this.params.map((x) => `command.${x.name}`).join(', ')});
            await _${Context.UNIT_OF_WORK_INTERFACE.param()}.CommitAsync();
        }
    }
}
`.trim();
  }
}
