import { Endpoint } from './remoteApi';

export interface ApiEndpointDefinitionBaseArgs {
  name: string;
  tag: string;
  endpoint: Endpoint;
}

export abstract class ApiEndpointDefinitionBase {
  public readonly endpoint: Endpoint;
  public readonly name: string;
  public readonly tag: string;

  constructor(args: ApiEndpointDefinitionBaseArgs) {
    this.endpoint = args.endpoint;
    this.name = args.name;
    this.tag = args.tag;
  }

  public abstract get use(): string;
  public abstract get buildMethod(): string;
  public abstract get endpointPropertyDeclarations(): Record<string, string>;

  public declaration() {
    return `
${this.name}: build.${this.buildMethod}<${this.response}, ${this.request}>({
  queryFn: ${this.queryFn},
${this.endpointPropertiesDeclaration.indented(2)}
})
    `.trim();
  }

  private get endpointPropertiesDeclaration() {
    return Object.entries(this.endpointPropertyDeclarations)
      .map(([key, value]) => `${key}: ${value},`)
      .join('\n');
  }

  public get response() {
    if (Array.isArray(this.endpoint.response)) {
      return `${this.endpoint.response[0].name}[]`;
    }

    if (typeof this.endpoint.response === 'string') {
      return this.endpoint.response;
    }

    if (this.endpoint.response) {
      return this.endpoint.response.name;
    }

    return 'void';
  }

  public get request() {
    return `RtkqRequest<${this.args}>`;
  }

  public get url() {
    return this.endpoint.url;
  }

  public get args() {
    if (this.endpoint.body) {
      return this.endpoint.body.name;
    }

    if (this.urlSegments.length > 0) {
      return `{ ${this.urlSegments.map((x) => `${x[1]}: string`).join(', ')} }`;
    }

    return 'void';
  }

  public get urlSegments() {
    return Array.from(this.url.matchAll(/\{([^\}]+)\}/g));
  }

  public get queryFn() {
    let url = this.url;
    this.urlSegments.forEach((x) => (url = url.replace(`{${x[1]}}`, `\${args.${x[1]}}`)));
    const params = [`\`${url}\``, this.endpoint.body ? 'args' : undefined].filter((x) => x).join(', ');
    return `rtkq.axios((${this.args === 'void' ? '' : 'args'}) => Http.${this.endpoint.method.toLowerCase()}(${params}))`;
  }
}
