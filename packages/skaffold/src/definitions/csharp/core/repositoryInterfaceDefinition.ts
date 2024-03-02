import { resolve } from 'path';
import { FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { EntityDefinition } from './entityDefinition';

export interface RepositoryInterfaceDefinitionArgs {
  entity: EntityDefinition;
}

export class RepositoryInterfaceDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;

  constructor(args: RepositoryInterfaceDefinitionArgs) {
    this.entity = args.entity;
  }

  public get name() {
    return `I${this.entity.name}Repository`;
  }

  public get usings() {
    return new Usings([
      'System',
      'System.Threading.Tasks',
      'System.Collections.Generic',
      this.entity.pk.namespace,
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
    return resolve(this.entity.directory(), `${this.name}.cs`);
  }

  public get namespace() {
    return this.entity.namespace;
  }

  public get byIdMethodName() {
    return 'ByIdAsync';
  }

  public byIdMethodDeclaration() {
    return `
Task<${this.entity.name}> ${this.byIdMethodName}(${this.entity.pk.param()});`.trim();
  }

  public get addMethodName() {
    return 'AddAsync';
  }

  public addMethodDeclaration() {
    return `Task<${this.entity.name}> ${this.addMethodName}(${this.entity.name} entity);`;
  }

  public get deleteMethodName() {
    return 'DeleteAsync';
  }

  public deleteMethodDeclaration() {
    return `Task ${this.deleteMethodName}(${this.entity.name} entity);`;
  }

  public get getAllMethodName() {
    return 'GetAllAsync';
  }

  public getAllMethodDeclaration() {
    return `Task<IReadOnlyCollection<${this.entity.name}>> ${this.getAllMethodName}();`;
  }

  public declaration() {
    const body = [
      this.byIdMethodDeclaration(),
      this.getAllMethodDeclaration(),
      this.addMethodDeclaration(),
      this.deleteMethodDeclaration(),
    ].join('\n');

    return `
${this.usings.declaration()}

namespace ${this.namespace};

public interface ${this.name}
{
${body.indented(4)}
}
`.trim();
  }
}
