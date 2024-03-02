import { ApiEndpointDefinitionBase, ApiEndpointDefinitionBaseArgs } from './apiEndpointDefinitionBase';

export interface MutationDefinitionArgs extends ApiEndpointDefinitionBaseArgs {}

export class MutationDefinition extends ApiEndpointDefinitionBase {
  constructor(args: MutationDefinitionArgs) {
    super(args);
  }

  public get use(): string {
    return `use${this.name.pascalCase()}Mutation`;
  }

  public get buildMethod(): string {
    return 'mutation';
  }

  public get endpointPropertyDeclarations(): Record<string, string> {
    return {
      invalidatesTags: `['${this.tag}']`,
    };
  }
}
