import { resolve } from 'path';
import { Context, pathUtil, FilePatch, FileDefinition } from '@/definitions/common';
import { PageDefinition } from './pageDefinition';

export interface PagesPatchDefinitionArgs {
  pages: PageDefinition[];
}

export class PagesPatchDefinition implements FileDefinition {
  public readonly pages: PageDefinition[];

  constructor(args: PagesPatchDefinitionArgs) {
    this.pages = args.pages;
  }

  public get files() {
    const pagesTsxPath = resolve(Context.CLIENT_SRC, 'pages', 'Pages.tsx');
    const basedir = pathUtil.directory(pagesTsxPath);

    const imports = this.pages.map(
      (x) => `import { ${x.name} } from './${pathUtil.noext(pathUtil.relative(basedir, x.path))}';`,
    );

    const routes = this.pages.map((x) => `<Route path="${x.url}" element={<${x.name} />} />`);

    return imports
      .map((x) => new FilePatch({ marker: 'add-import', patch: x, path: pagesTsxPath }))
      .concat(routes.map((x) => new FilePatch({ marker: 'add-route', patch: x, path: pagesTsxPath })));
  }
}
