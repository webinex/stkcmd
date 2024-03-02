import { convertCSharpTypeToTsType } from './csTs';
import {
  Endpoint,
  EnumDefinition,
  ModelDefinition,
  RemoteApi,
  ModelPropertyDefinition as TsModelPropertyDefinition,
  ModelPropertyDefinitionArgs as TsModelPropertyDefinitionArgs,
} from '@/definitions/ts';
import {
  ModelPropertyDefinition as CSharpModelPropertyDefinition,
  ControllerDefinition,
  EnumValueObjectDefinition,
  ValueObjectDefinition,
  ValueObjectDefinitionBase,
} from '@/definitions/csharp';
import { Context } from '..';

export interface ControllerRemoteApiDefinitionArgs {
  controller: ControllerDefinition;
}

export class ControllerRemoteApiDefinition implements RemoteApi {
  public readonly controller: ControllerDefinition;

  constructor(args: ControllerRemoteApiDefinitionArgs) {
    this.controller = args.controller;
  }

  public get model() {
    return new ModelDefinition({
      name: this.controller.dto.name.replace(/Dto$/, ''),
      properties: this.convertProperties(this.controller.dto.properties),
    });
  }

  public get get(): Endpoint {
    return {
      url: this.controller.url + `/{${this.controller.dto.pk.name.camelCase()}}`,
      method: 'GET',
      response: this.model,
    };
  }

  public get getAll(): Endpoint {
    return {
      url: this.controller.url,
      method: 'GET',
      response: [this.model],
    };
  }

  public get createBody(): ModelDefinition {
    return new ModelDefinition({
      name: this.controller.createCommand.name.replace(/Command$/, 'Request'),
      properties: this.convertProperties(this.controller.createCommand.properties),
    });
  }

  public get create(): Endpoint {
    return {
      url: this.controller.url,
      method: 'POST',
      body: this.createBody,
      response: convertCSharpTypeToTsType(this.controller.dto.pk.type),
    };
  }

  public get updateBody(): ModelDefinition {
    return new ModelDefinition({
      name: this.controller.updateCommand.name.replace(/Command$/, 'Request'),
      properties: this.convertProperties(this.controller.updateCommand.properties),
    });
  }

  public get update(): Endpoint {
    return {
      url: this.controller.url + `/{${this.controller.dto.pk.name.camelCase()}}`,
      body: this.updateBody,
      method: 'PUT',
    };
  }

  public get delete(): Endpoint {
    return {
      url: this.controller.url + `/{${this.controller.dto.pk.name.camelCase()}}`,
      method: 'DELETE',
    };
  }

  private convertProperties(properties: CSharpModelPropertyDefinition[]): TsModelPropertyDefinition[] {
    return properties.map((x) => {
      const definition = x.definition ? this.convertDefinition(x.definition) : null;

      return new TsModelPropertyDefinition({
        pk: x.pk,
        maxLength: x.maxLength,
        name: x.name.camelCase(),
        nullable: x.nullable,
        collection: x.collection,
        type: definition ? definition : convertCSharpTypeToTsType(x.type, { dateType: 'string' }),
      });
    });
  }

  private convertDefinition(
    definition: ValueObjectDefinitionBase,
  ): TsModelPropertyDefinitionArgs['type'] | null {
    if (definition instanceof EnumValueObjectDefinition) {
      return new EnumDefinition({ name: definition.name, values: definition.values });
    }

    if (definition instanceof ValueObjectDefinition) {
      return new ModelDefinition({
        name: definition.name,
        properties: this.convertProperties(definition.properties),
      });
    }

    Context.warn('Unknown definition type');
    return null;
  }
}
