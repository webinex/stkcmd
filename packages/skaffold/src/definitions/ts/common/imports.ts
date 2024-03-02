import { flattenDeep, groupBy, sortBy } from 'lodash';

export class Imports {
  constructor(public readonly values: [string[] | string, string][]) {}

  public declaration() {
    return this.normalized.map((x) => `import { ${x[0].join(', ')} } from '${x[1]}';`).join('\n');
  }

  private get normalized() {
    const byPath = groupBy(this.values, (x) => x[1]);
    const flatten = Object.entries(byPath).map(
      ([file, group]) => [flattenDeep(group.map((x) => x[0])), file] as const,
    );
    return sortBy(flatten, (x) => x[1]);
  }
}
