import { resolve } from 'path';
import { FileDefinition, Context } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition } from '@/definitions/csharp/core';
import {
  CreateCommandDefinition,
  GetAllQueryDefinition,
  GetQueryDefinition,
  UpdateCommandDefinition,
  DeleteCommandDefinition,
} from '@/definitions/csharp/useCases';
import { DtoDefinition } from './dtoDefinition';
export interface ControllerDefinitionArgs {
  entity: EntityDefinition;
  dto: DtoDefinition;
  createCommand: CreateCommandDefinition;
  updateCommand: UpdateCommandDefinition;
  deleteCommand: DeleteCommandDefinition;
  getQuery: GetQueryDefinition;
  getAllQuery: GetAllQueryDefinition;
}

export class ControllerDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly dto: DtoDefinition;
  public readonly createCommand: CreateCommandDefinition;
  public readonly updateCommand: UpdateCommandDefinition;
  public readonly deleteCommand: DeleteCommandDefinition;
  public readonly getQuery: GetQueryDefinition;
  public readonly getAllQuery: GetAllQueryDefinition;

  constructor(args: ControllerDefinitionArgs) {
    this.entity = args.entity;
    this.dto = args.dto;
    this.createCommand = args.createCommand;
    this.updateCommand = args.updateCommand;
    this.deleteCommand = args.deleteCommand;
    this.getQuery = args.getQuery;
    this.getAllQuery = args.getAllQuery;
  }

  public get name() {
    return `${this.entity.name}Controller`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Api.Controllers.${this.entity.pluralName}`;
  }

  public get usings() {
    return new Usings([
      'System.Threading.Tasks',
      'System.Collections.Generic',
      'MediatR',
      'Microsoft.AspNetCore.Mvc',
      'System.Linq',
      'StarterKit.App.Core',
      this.dto.namespace,
      this.createCommand.namespace,
      this.updateCommand.namespace,
      this.deleteCommand.namespace,
      this.getQuery.namespace,
      this.getAllQuery.namespace,
      this.entity.pk.namespace,
    ]);
  }

  public get files() {
    return [
      {
        path: this.path,
        content: this.declaration(),
      },
    ];
  }

  private get path(): string {
    return resolve(
      Context.SLN_ROOT,
      `${Context.PRODUCT_NAME}.App.Api`,
      `Controllers.${this.entity.pluralName}`,
      `${this.name}.cs`,
    );
  }

  public get url() {
    return `/api/${this.entity.name.kebabCase()}`;
  }

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

[Route("${this.url}")]
public class ${this.name} : ControllerBase
{
    private readonly IMediator _mediator;

    public ${this.name}(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{${this.entity.pk.name.camelCase()}}")]
    public async Task<${this.dto.name}> ByIdAsync(${this.entity.pk.param()})
    {
        var result = await _mediator.Send(new ${this.getQuery.name}(${this.entity.pk.name.camelCase()}));
        return new ${this.dto.name}(result);
    }

    [HttpGet]
    public async Task<IReadOnlyCollection<${this.dto.name}>> GetAllAsync()
    {
        var result = await _mediator.Send(new ${this.getAllQuery.name}());
        return result.Select(x => new ${this.dto.name}(x)).ToArray();
    }

    [HttpPost]
    public async Task<${this.entity.pk.shortType}> CreateAsync([FromBody] ${this.createCommand.name} command)
    {
        return await _mediator.Send(command);
    }

    [HttpPut("{${this.entity.pk.name.camelCase()}}")]
    public async Task UpdateAsync(${this.entity.pk.param()}, [FromBody] ${this.updateCommand.name} command)
    {
        Asserts.Arg(${this.entity.pk.name.camelCase()}).ToBe(command.${this.entity.pk.name});
        await _mediator.Send(command);
    }

    [HttpDelete("{${this.entity.pk.name.camelCase()}}")]
    public async Task DeleteAsync(${this.entity.pk.param()})
    {
        await _mediator.Send(new ${this.deleteCommand.name}(${this.entity.pk.name.camelCase()}));
    }
}
`.trim();
  }
}
