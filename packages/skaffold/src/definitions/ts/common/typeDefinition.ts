import { Imports } from './imports';

export interface TypeDefinition {
  name: string;
  imports?: Imports;
  children?: TypeDefinition[];
  declaration(): string;
}
