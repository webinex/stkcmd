export interface FilePatchArgs {
  path: string;
  marker: string;
  patch: string;
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export class FilePatch {
  public readonly path: string;
  public readonly marker: RegExp;
  public readonly patch: string;

  constructor(args: FilePatchArgs) {
    const marker = escapeRegExp(args.marker);
    this.path = args.path;
    this.marker = new RegExp(
      `^(\\s*)\{?\\/\\*\\s+\\@skaffold\\:${marker}(\\:(before|after))?\\s*\\*\\/\}?\\s*$`,
    );
    this.patch = args.patch;
  }

  public apply(content: string) {
    const lines = content.split('\n');
    const result = lines.flatMap((x) => {
      const match = this.marker.exec(x);
      if (!match) return [x];

      const type: 'before' | 'after' | string = match[3] || 'after';

      if (type === 'before') {
        return [`${match[1]}${this.patch}`, x];
      }

      return [x, `${match[1]}${this.patch}`];
    });

    return result.join('\n');
  }
}
