export class Usings {
  public readonly namespaces: string[];

  constructor(namespaces: Array<string | undefined>) {
    this.namespaces = Array.from(new Set(namespaces.filter((x) => x))).sort((a, b) =>
      a!.localeCompare(b!),
    ) as string[];
  }

  public declaration() {
    return this.namespaces.map((x) => `using ${x};`).join('\n');
  }
}
