import { FileDefinition } from '@/definitions';

export interface PageDefinition extends FileDefinition {
  url: string;
  name: string;
  path: string;
}
