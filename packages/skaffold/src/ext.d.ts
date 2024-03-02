interface String {
  indented(length: number): string;
  camelCase(): string;
  kebabCase(): string;
  pascalCase(): string;
  snakeCase(): string;
  param(): string;
}

interface Array<T> {
  uniqueBy(fn: (x: T) => any): T[];
  sortBy(fn: (x: T) => any): T[];
}
