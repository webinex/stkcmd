import { ApiEndpointDefinitionBase, ApiEndpointDefinitionBaseArgs } from './apiEndpointDefinitionBase';

export interface QueryDefinitionArgs extends ApiEndpointDefinitionBaseArgs {}

export class QueryDefinition extends ApiEndpointDefinitionBase {
  constructor(args: QueryDefinitionArgs) {
    super(args);
  }

  public get use(): string {
    return `use${this.name.pascalCase()}Query`;
  }

  public get buildMethod(): string {
    return 'query';
  }

  public get endpointPropertyDeclarations(): Record<string, string> {
    return {
      providesTags: `['${this.tag}']`,
    };
  }
}
