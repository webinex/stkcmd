export const pathUtil = {
  commonDirectory: (files: string[]) => {
    files = files.map(pathUtil.unix);

    if (files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length === 1) {
      return pathUtil.directory(files[0]!);
    }

    const split = files.map((f) => f.split('/'));
    const result: string[] = [];

    split[0]?.forEach((part, i) => {
      if (split.every((s) => s[i] === part)) {
        result.push(part);
      }
    });

    return result.length > 0 ? result.join('/') : '';
  },

  noext: (fileName: string) => {
    return fileName.split('.').slice(0, -1).join('.');
  },

  directory: (filePath: string) => {
    return pathUtil.unix(filePath).split('/').slice(0, -1).join('/');
  },

  dirname: (directory: string) => {
    return pathUtil.unix(directory).split('/').at(-1)!;
  },

  relative: (directory: string, filePath: string) => {
    return pathUtil.unix(filePath).split(pathUtil.unix(directory)).at(-1)!.replace(/^\//, '');
  },

  relativePath: (file1: string, file2: string) => {
    file1 = pathUtil.unix(file1);
    file2 = pathUtil.unix(file2);

    const commonDirectory = pathUtil.commonDirectory([file1, file2]);
    const top = pathUtil.directory(file1).split(commonDirectory).at(-1)!.replace(/^\//, '');
    const down = pathUtil.directory(file2).split(commonDirectory).at(-1)!.replace(/^\//, '');

    const result = [...top.split('/').map(() => '..'), down, pathUtil.noext(pathUtil.fileName(file2))].join('/');
    return result;
  },

  fileName: (filePath: string) => {
    return pathUtil.unix(filePath).split('/').at(-1)!;
  },

  unix: (path: string) => {
    return path.replaceAll(/\\\\?/g, '/');
  },
};
