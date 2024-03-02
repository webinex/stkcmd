import { resolve } from 'path';
import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition, RepositoryInterfaceDefinition } from '@/definitions/csharp/core';

export interface RepositoryDefinitionArgs {
  entity: EntityDefinition;
  interface: RepositoryInterfaceDefinition;
}

export class RepositoryDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly interface: RepositoryInterfaceDefinition;

  constructor(args: RepositoryDefinitionArgs) {
    this.entity = args.entity;
    this.interface = args.interface;
  }

  public get name() {
    return `${this.entity.name}RepositoryAdapter`;
  }

  public get dbContext() {
    return `${Context.PRODUCT_NAME}.App.Infrastructure.DataAccess.AppDbContext`;
  }

  public get dbContextNamespace() {
    return this.dbContext.substring(0, this.dbContext.lastIndexOf('.'));
  }

  public get dbContextName() {
    return this.dbContext.split('.').at(-1)!;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Infrastructure.DataAccess.Repositories`;
  }

  public get usings() {
    return new Usings([
      this.entity.namespace,
      this.interface.namespace,
      this.dbContextNamespace,
      this.entity.pk.namespace,
      'System.Collections.Generic',
      'System.Threading.Tasks',
      'System.Linq',
      'Microsoft.EntityFrameworkCore',
      'Webinex.Coded',
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
      'StarterKit.App.Infrastructure',
      'DataAccess',
      'Repositories',
      `${this.name}.cs`,
    );
  }

  public declaration() {
    return `
${this.usings.declaration()}

namespace ${this.namespace};

internal class ${this.name} : ${this.interface.name}
{
    private readonly ${this.dbContextName} _dbContext;

    public ${this.name}(${this.dbContextName} dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<${this.entity.name}> ${this.interface.byIdMethodName}(${this.entity.pk.param()})
    {
        return await _dbContext.${this.entity.pluralName}.FindAsync(${this.entity.pk.name.camelCase()})
            ?? throw CodedException.NotFound(${this.entity.pk.name.camelCase()});
    }

    public async Task<IReadOnlyCollection<${this.entity.name}>> ${this.interface.getAllMethodName}()
    {
        return await _dbContext.${this.entity.pluralName}.ToArrayAsync();
    }

    public async Task<${this.entity.name}> ${this.interface.addMethodName}(${this.entity.name} entity)
    {
        await _dbContext.${this.entity.pluralName}.AddAsync(entity);
        return entity;
    }

    public Task ${this.interface.deleteMethodName}(${this.entity.name} entity)
    {
        _dbContext.${this.entity.pluralName}.Remove(entity);
        return Task.CompletedTask;
    }
}`;
  }
}
