import { Access, PropertyDefinition, PropertyDefinitionArgs } from '@/definitions/csharp/common';
import { ValueObjectDefinitionBase } from './valueObjectDefinitionBase';
import { FieldLength } from '@/definitions';

export type ModelPropertyType = string | ValueObjectDefinitionBase;

export interface ModelPropertyDefinitionArgs extends Omit<PropertyDefinitionArgs, 'type'> {
  type: ModelPropertyType;
  pk?: boolean;
  immutable?: boolean;
  maxLength?: FieldLength;
  auto?: boolean;
  private?: boolean;
}

export class ModelPropertyDefinition extends PropertyDefinition {
  public readonly pk: boolean;
  public readonly immutable: boolean;
  public readonly maxLength?: FieldLength;
  public readonly auto: boolean;
  public readonly private: boolean;
  public readonly definition?: ValueObjectDefinitionBase;

  constructor(args: ModelPropertyDefinitionArgs) {
    super({
      ...args,
      type: typeof args.type === 'string' ? args.type : args.type.type,
    });

    this.pk = args.pk || false;
    this.immutable = args.immutable || false;
    this.maxLength = args.maxLength;
    this.auto = args.auto ?? false;
    this.private = args.private ?? false;
    this.definition = typeof args.type === 'string' ? undefined : args.type;
  }

  public declaration(args?: { set?: Access | boolean }): string {
    const { set } = { set: 'protected' as const, ...args };
    return super.declaration({ access: 'public', get: true, set: set! });
  }

  public assign(argsOrEnd: { end?: ';' | ','; auto?: boolean; clone?: boolean } | ';' | ',' = ';') {
    const args = typeof argsOrEnd === 'string' ? { end: argsOrEnd } : argsOrEnd;
    return super.assign({ ...args, call: args.clone && this.definition ? 'Clone()' : undefined });
  }
}
