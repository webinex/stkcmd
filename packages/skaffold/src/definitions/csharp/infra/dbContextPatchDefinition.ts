import { Context, FileDefinition, FilePatch } from '@/definitions';
import { EntityDefinition } from '@/definitions/csharp/core';

export interface DbContextPatchDefinitionArgs {
  entity: EntityDefinition;
}

export class DbContextPatchDefinition implements FileDefinition {
  public readonly patches: FilePatch[];

  constructor({ entity }: DbContextPatchDefinitionArgs) {
    this.patches = [
      new FilePatch({
        marker: 'add-namespace',
        patch: `using ${entity.namespace};`,
        path: Context.DB_CONTEXT_PATH,
      }),
      new FilePatch({
        marker: 'add-db-set',
        patch: `public DbSet<${entity.name}> ${entity.pluralName} { get; set; } = null!;`,
        path: Context.DB_CONTEXT_PATH,
      }),
    ];
  }

  public get files() {
    return this.patches;
  }
}
