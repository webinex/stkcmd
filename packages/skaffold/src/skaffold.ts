import { Context, ContextArgs, FileDefinition, FileInfo, FilePatch } from '@/definitions/common';
import { FileSystem, FileSystemImpl, TestFileSystem } from './fileSystem';
import { groupBy } from 'lodash';
import chalk from 'chalk';
import simpleGit from 'simple-git';

export interface SkaffoldArgs {
  definition: () => FileDefinition;
  context: ContextArgs;
}

export class Skaffold {
  public readonly args: SkaffoldArgs;
  public fileSystem: FileSystem = new FileSystemImpl();

  constructor(args: SkaffoldArgs) {
    this.args = args;
    Context.init(args.context);
  }

  public test(value: boolean = true) {
    this.fileSystem = value ? new TestFileSystem() : new FileSystemImpl();
    return this;
  }

  public async run() {
    await this.validateStaged();

    for (const file of this.args.definition().files) {
      this.apply(file);
    }

    if (Context.warnings.length === 0) {
      console.log(chalk.green('Skaffold completed successfully!'));
      return;
    }

    console.log(chalk.yellow('Skaffold completed with warnings:\n'));
    console.log(
      chalk.yellow(
        Object.entries(groupBy(Context.warnings, (x) => x.filePath))
          .map(([filePath, warnings]) => {
            return `  ${filePath}\n${warnings.map((x) => `    ${x.message}`).join('\n')}`;
          })
          .join('\n\n'),
      ),
    );
  }

  private async validateStaged() {
    const status = await simpleGit({ baseDir: Context.REPO_ROOT }).status();

    if (
      status.not_added.length > 0 ||
      status.conflicted.length > 0 ||
      status.modified.length > 0 ||
      status.deleted.length > 0 ||
      status.renamed.length > 0 ||
      status.created.length > 0 ||
      status.staged.length > 0
    ) {
      console.log(chalk.red('Skaffold cannot run because there are not committed changes.'));
      process.exit(1);
    }
  }

  private apply(file: FileInfo | FilePatch) {
    if (file instanceof FilePatch) {
      this.applyPatch(file);
    } else {
      this.applyFile(file);
    }
  }

  private applyFile(file: FileInfo) {
    this.fileSystem.write(file.path, file.content);
  }

  private applyPatch(patch: FilePatch) {
    let content = this.fileSystem.read(patch.path);
    content = patch.apply(content);
    this.fileSystem.write(patch.path, content);
  }
}
