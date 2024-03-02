import { InterfaceDefinition, InterfaceDefinitionArgs } from './interfaceDefinition';
import { ModelPropertyDefinition } from './modelPropertyDefinition';
import { TypeDefinition } from './typeDefinition';

export interface ModelDefinitionArgs extends InterfaceDefinitionArgs {
  properties: ModelPropertyDefinition[];
}

export class ModelDefinition extends InterfaceDefinition {
  public readonly properties: ModelPropertyDefinition[];

  constructor(args: ModelDefinitionArgs) {
    super(args);
    this.properties = args.properties;
  }

  public get children(): TypeDefinition[] {
    return this.properties
      .filter((x) => x.definition)
      .flatMap((x) => [x.definition!, ...(x.definition!.children ?? [])]);
  }

  public get pk() {
    return this.properties.find((x) => x.pk)!;
  }

  public get nonPk() {
    return this.properties.filter((x) => !x.pk);
  }
}
