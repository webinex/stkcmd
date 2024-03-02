import { plural } from 'pluralize';
import { Context, FileDefinition } from '@/definitions';
import { Usings } from '@/definitions/csharp/common';
import { ModelPropertyDefinition } from './modelPropertyDefinition';

export interface EntityDefinitionArgs {
  name: string;
  properties: ModelPropertyDefinition[] | ((entity: EntityDefinition) => ModelPropertyDefinition[]);
}

export class EntityDefinition implements FileDefinition {
  public readonly name: string;
  public readonly properties: ModelPropertyDefinition[];

  constructor(args: EntityDefinitionArgs) {
    const { properties } = args;

    this.name = args.name;
    this.properties = typeof properties === 'function' ? properties(this) : properties;
  }

  public get usings() {
    return new Usings(
      this.properties
        .map((x) => x.namespace)
        .concat(`${Context.PRODUCT_NAME}.App.Core.Common.Types`, 'MediatR', 'System.Collections.Generic'),
    );
  }

  public get namespace() {
    return `${Context.PRODUCT_NAME}.App.Core.${this.pluralName}`;
  }

  public get public() {
    return this.properties.filter((x) => !x.private);
  }

  public get pluralName() {
    return plural(this.name);
  }

  public get pk() {
    return this.properties.find((x) => x.pk)!;
  }

  public get mutable() {
    return this.properties.filter((x) => !x.immutable);
  }

  public get nonAuto() {
    return this.properties.filter((x) => !x.auto);
  }

  public get files() {
    return [
      {
        path: this.path(),
        content: this.declaration(),
      },
      ...this.properties.filter((x) => x.definition).flatMap((x) => x.definition!.files),
    ];
  }

  public path(): string {
    return `${this.directory()}/${this.name}.cs`;
  }

  public directory(): string {
    return `${Context.SLN_ROOT}/${Context.PRODUCT_NAME}.App.Core/${this.pluralName}`;
  }

  public declaration() {
    return [this.usings.declaration(), this.namespaceDeclaration(), this.classDeclaration()].join('\n\n');
  }

  public namespaceDeclaration() {
    return `namespace ${this.namespace};`;
  }

  public classDeclaration() {
    return `
public class ${this.name} : IAggregatedRoot
{
${this.classBodyDeclaration.indented(4)}
}
    `.trim();
  }

  public get classBodyDeclaration() {
    return [
      this.propertiesDeclaration(),
      this.eventsDeclaration(),
      this.protectedDefaultConstructorDeclaration(),
      this.newMethodDeclaration(),
      this.updateMethodDeclaration(),
    ].join('\n\n');
  }

  public propertiesDeclaration() {
    return this.properties.map((x) => x.declaration()).join('\n');
  }

  public protectedDefaultConstructorDeclaration() {
    return `
protected ${this.name}()
{
}`.trim();
  }

  public newMethodDeclaration() {
    const params = this.nonAuto.map((x) => x.param()).join(', ');
    const assigns = this.properties.map((x) => x.assign({ end: ',', auto: x.auto, clone: true })).join('\n');

    return `
public static ${this.name} New(${params})
{
    return new ${this.name}
    {
${assigns.indented(8)}
    };
}`.trim();
  }

  public updateMethodDeclaration() {
    const params = this.mutable.map((x) => x.param()).join(', ');
    const assigns = this.mutable.map((x) => x.assign({ clone: true })).join('\n');

    return `
public void Update(${params})
{
${assigns.indented(4)}
}`.trim();
  }

  public eventsDeclaration() {
    return `public ICollection<INotification> Events { get; } = new List<INotification>();`;
  }
}
