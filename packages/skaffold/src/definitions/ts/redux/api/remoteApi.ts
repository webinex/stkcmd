import { ModelDefinition } from '@/definitions/ts/common';

export interface Endpoint {
  url: string;
  method: 'POST' | 'PUT' | 'GET' | 'DELETE';
  body?: ModelDefinition;
  response?: ModelDefinition | [ModelDefinition] | string;
}

export interface RemoteApi {
  model: ModelDefinition;
  get: Endpoint;
  getAll: Endpoint;
  create: Endpoint;
  update: Endpoint;
  delete: Endpoint;
}
