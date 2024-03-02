import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Context, pathUtil } from './definitions';

export interface FileSystem {
  write(filePath: string, content: string): void;
  read(filePath: string): string;
}

export class FileSystemImpl implements FileSystem {
  public write(filePath: string, content: string) {
    const dir = pathUtil.directory(filePath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, { encoding: 'utf-8' });
  }

  public read(filePath: string) {
    return readFileSync(filePath, { encoding: 'utf-8' });
  }
}

export class TestFileSystem implements FileSystem {
  private static isCleanupDone = false;

  public write(filePath: string, content: string) {
    this.cleanupOnce();

    filePath = this.getTestPath(filePath);

    const dir = pathUtil.directory(filePath);
    mkdirSync(dir, { recursive: true });

    writeFileSync(filePath, content, {
      encoding: 'utf-8',
    });
  }

  public read(filePath: string) {
    this.cleanupOnce();

    if (existsSync(this.getTestPath(filePath))) {
      return readFileSync(this.getTestPath(filePath), { encoding: 'utf-8' });
    }

    if (existsSync(filePath)) {
      return readFileSync(filePath, { encoding: 'utf-8' });
    }

    return '';
  }

  private getTestPath(filePath: string) {
    filePath = pathUtil.unix(filePath);
    filePath = filePath.replace(pathUtil.unix(Context.SLN_ROOT), '').replace(/^\//, '');
    filePath = resolve(Context.TEST_FOLDER_RESULT_PATH, filePath);
    return filePath;
  }

  private cleanupOnce() {
    if (TestFileSystem.isCleanupDone) {
      return;
    }

    if (existsSync(Context.TEST_FOLDER_RESULT_PATH))
      rmSync(Context.TEST_FOLDER_RESULT_PATH, { recursive: true });

    TestFileSystem.isCleanupDone = true;
  }
}
