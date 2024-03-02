import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import {
  EntityDefinition,
  EnumValueObjectDefinition,
  ModelPropertyDefinition,
} from '@/definitions/csharp/core';
import { once } from 'lodash';

export interface EntityConfigurationDefinitionArgs {
  entity: EntityDefinition;
}

export class EntityConfigurationDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;

  private readonly _usings: Usings;

  constructor(args: EntityConfigurationDefinitionArgs) {
    this.entity = args.entity;

    this._usings = new Usings([
      'Microsoft.EntityFrameworkCore',
      'Microsoft.EntityFrameworkCore.Metadata.Builders',
      args.entity.namespace,
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

  public path(): string {
    return `${Context.SLN_ROOT}/${Context.PRODUCT_NAME}.App.Infrastructure/DataAccess/Configurations/${this.name}.cs`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Infrastructure.DataAccess.Configurations`;
  }

  public get name() {
    return `${this.entity.name}Configuration`;
  }

  public declaration(): string {
    return `
${this._usings.declaration()}

${this.namespaceDeclaration()}

public class ${this.name} : IEntityTypeConfiguration<${this.entity.name}>
{
    public void Configure(EntityTypeBuilder<${this.entity.name}> model)
    {
        model.ToTable("${this.entity.pluralName}");
        
        model.HasKey(x => x.${this.entity.pk.name});
        model.Ignore(x => x.Events);${this.ownedPropertiesDeclaration().length > 0 ? `\n\n` + this.ownedPropertiesDeclaration().indented(8) : ''}
    }
}    
`.trim();
  }

  public ownedPropertiesDeclaration = once(() => {
    return this.entity.properties
      .filter((x) => x.definition)
      .map(this.owns)
      .join('\n\n')
      .trim();
  });

  private owns = (x: ModelPropertyDefinition) => {
    if (x.definition instanceof EnumValueObjectDefinition) {
      return `model.OwnsOne(x => x.${x.name}, ${x.name.camelCase()} => ${x.name.camelCase()}.Property(x => x.Value).HasColumnName("${x.name}"));`;
    }

    if (!x.collection) {
      return `model.OwnsOne(x => x.${x.name});`;
    }

    Context.warn(`HasKey might be completed manually...`, this.path());

    return `model.OwnsMany(x => x.${x.name}, ${x.name.camelCase()} => {
    ${x.name.camelCase()}.ToTable("${this.entity.name}${x.name}");
    ${x.name.camelCase()}.Property<${this.entity.pk.shortType}>("${this.entity.name}Id");
    ${x.name.camelCase()}.WithOwner().HasForeignKey("${this.entity.name}Id");
    ${x.name.camelCase()}.HasKey("${this.entity.name}Id", /* Unable to resolve key, might be set by developer */);
});`;
  };

  public namespaceDeclaration() {
    return `namespace ${this.namespace};`;
  }
}
