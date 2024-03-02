import { EnumDefinition } from './enumDefinition';
import { PropertyDefinition, PropertyDefinitionArgs } from './propertyDefinition';
import { ModelDefinition } from './modelDefinition';
import { TypeDefinition } from './typeDefinition';

export interface ModelPropertyDefinitionArgs extends Omit<PropertyDefinitionArgs, 'type'> {
  type: string | ModelDefinition | EnumDefinition;
  pk: boolean;
  maxLength?: string;
}

export class ModelPropertyDefinition extends PropertyDefinition {
  public pk: boolean;
  public maxLength?: string;
  public definition?: TypeDefinition;

  constructor(args: ModelPropertyDefinitionArgs) {
    super({ ...args, type: typeof args.type === 'string' ? args.type : args.type.name });
    this.pk = args.pk;
    this.maxLength = args.maxLength;
    this.definition = typeof args.type === 'string' ? undefined : args.type;
  }
}
