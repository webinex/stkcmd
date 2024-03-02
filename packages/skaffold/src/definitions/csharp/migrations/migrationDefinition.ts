import { resolve } from 'path';
import { flattenDeep } from 'lodash';
import { FileDefinition, Context } from '@/definitions';
import {
  EntityDefinition,
  EnumValueObjectDefinition,
  ValueObjectDefinition,
  ModelPropertyDefinition,
} from '@/definitions/csharp/core';

export interface MigrationDefinitionArgs {
  entity: EntityDefinition;
}

interface Table {
  name: string;
  properties: ModelPropertyDefinition[];
}

export class MigrationDefinition implements FileDefinition {
  public readonly entity: EntityDefinition;
  public readonly tables: Table[];

  constructor(args: MigrationDefinitionArgs) {
    this.entity = args.entity;
    this.tables = this.calculateTables();
  }

  public get name() {
    return `Add${this.entity.pluralName}Table`;
  }

  public get timestamp() {
    const now = new Date();
    return [
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
    ]
      .map((x) => x.toString().padStart(2, '0'))
      .join('');
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
    return `${Context.SLN_ROOT}/${Context.PRODUCT_NAME}.App.Migrations/Migrations/${this.timestamp}_${this.name}.cs`;
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Migrations.Migrations`;
  }

  public declaration(): string {
    return `
using FluentMigrator;
using Webinex.Migrations;

namespace ${this.namespace};

[Migration(${this.timestamp})]
public class ${this.name} : Migration
{
    public override void Up()
    {
${this.tables
  .map((x) => this.createTable(x))
  .join('\n\n')
  .indented(8)}
    }

    public override void Down()
    {
${this.tables
  .map((x) => this.deleteTable(x))
  .join('\n')
  .indented(8)}
    }
}`;
  }

  public createTable(table: Table) {
    return `Create.Table("${table.name}")
${this.columns(table).indented(4)}`;
  }

  public deleteTable(table: Table) {
    return `Delete.Table("${table.name}");`;
  }

  public calculateTables(): Table[] {
    const result = [
      { name: this.entity.pluralName, properties: this.entity.properties.filter((x) => !x.collection) },
      ...this.entity.properties
        .filter((x) => x.collection)
        .map((x) => ({
          name: `${this.entity.name}${x.name}`,
          properties:
            x.definition && x.definition instanceof ValueObjectDefinition
              ? [
                  new ModelPropertyDefinition({
                    name: `${this.entity.name}${this.entity.pk.name}`,
                    type: this.entity.pk.type,
                    maxLength: this.entity.pk.maxLength,
                  }),
                  ...x.definition.properties,
                ]
              : [
                  new ModelPropertyDefinition({
                    name: `${this.entity.name}${this.entity.pk.name}`,
                    type: this.entity.pk.type,
                    maxLength: this.entity.pk.maxLength,
                  }),
                  new ModelPropertyDefinition({ name: 'Value', type: 'System.String', maxLength: 'md' }),
                ],
        })),
    ];

    if (result.length > 1) {
      Context.warn(
        `Multiple tables detected. This is partially supported yet. Please review migration.`,
        this.path(),
      );
    }

    return result;
  }

  public columns(table: Table) {
    return flattenDeep(table.properties.map((x) => this.withColumns(x))).join('\n') + ';';
  }

  public withColumns(property: ModelPropertyDefinition, prefix?: string, forceNullable?: boolean): string[] {
    if (!property.definition || property.definition instanceof EnumValueObjectDefinition) {
      return [this.withColumn(property, prefix, forceNullable)];
    }

    if (property.definition instanceof ValueObjectDefinition) {
      return flattenDeep(
        property.definition.properties.map((x) => {
          const nextPrefix = prefix ? `${prefix}_${property.name}` : property.name;
          return this.withColumns(x, nextPrefix, forceNullable || property.nullable);
        }),
      );
    }

    Context.warn('Unknown definition for property: ', property.name);
    return [];
  }

  public withColumn(property: ModelPropertyDefinition, prefix?: string, forceNullable?: boolean) {
    const name = prefix ? `${prefix}_${property.name}` : property.name;
    const nullable = forceNullable || property.nullable;

    let column = `
.WithColumn("${name}", x => x
    .${this.as(property)}
    .${nullable ? '' : 'Not'}Nullable()`.trim();

    if (property.pk) {
      column += '\n    .PrimaryKey()';
    }

    column += ')';

    return column;
  }

  public as(property: ModelPropertyDefinition) {
    if (property.definition && property.definition instanceof EnumValueObjectDefinition) {
      return `AsString(250)`;
    }

    switch (property.type) {
      case 'System.String':
        return `AsString(${property.maxLength ? Context.FIELD_LENGTH[property.maxLength] : ''})`;
      case 'System.Guid':
        return 'AsGuid()';
      case 'System.Int32':
        return 'AsInt32()';
      case 'System.Int64':
        return 'AsInt64()';
      case 'System.Boolean':
        return 'AsBoolean()';
      case 'System.DateTime':
        return 'AsDateTime()';
      case 'System.DateTimeOffset':
        return 'AsDateTimeOffset()';
      case 'System.Decimal':
        return 'AsDecimal()';
      case 'System.Double':
        return 'AsDouble()';
      case 'System.Single':
        return 'AsFloat()';
      default: {
        Context.warn(`Unknown type: ${property.type}`, this.path());
        Context.warn(`Might be modified manually...`, resolve(Context.SLN_ROOT, this.path()));
        return 'AsUnknown()';
      }
    }
  }
}
