import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition, RepositoryInterfaceDefinition } from '@/definitions/csharp/core';

export interface GetQueryDefinitionArgs {
  entity: EntityDefinition;
  repositoryInterface: RepositoryInterfaceDefinition;
}

export class GetQueryDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly repositoryInterface: RepositoryInterfaceDefinition;

  constructor(args: GetQueryDefinitionArgs) {
    this.entity = args.entity;
    this.repositoryInterface = args.repositoryInterface;
  }

  public get name() {
    return `Get${this.entity.name}Query`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Core.UseCases.${this.entity.pluralName}`;
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

public class ${this.name} : IRequest<${this.entity.name}>
{
    ${this.entity.pk.declaration({ set: false })}

    public ${this.name}(${this.entity.pk.param()})
    {
        ${this.entity.pk.assign()}
    }

    internal class Handler : IRequestHandler<${this.name}, ${this.entity.name}>
    {
        private readonly ${this.repositoryInterface.name} _${this.repositoryInterface.name.param()};

        public Handler(${this.repositoryInterface.name} ${this.repositoryInterface.name.param()})
        {
            _${this.repositoryInterface.name.param()} = ${this.repositoryInterface.name.param()};
        }

        public async Task<${this.entity.name}> Handle(${this.name} query, CancellationToken _)
        {
            return await _${this.repositoryInterface.name.param()}.${this.repositoryInterface.byIdMethodName}(query.${this.entity.pk.name});
        }
    }
}
`.trim();
  }
}
