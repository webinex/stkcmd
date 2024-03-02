String.prototype.indented = function (this: string, length) {
  return this.split('\n')
    .map((x) => ' '.repeat(length) + x)
    .join('\n');
};

String.prototype.camelCase = function (this: string) {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.param = function (this: string) {
  return this.replace(/^I/, '').camelCase();
};

String.prototype.kebabCase = function (this: string) {
  return this.replaceAll(/[a-z][A-Z]/g, (value) => `${value.at(0)}-${value.at(1)!.toLowerCase()}`).toLowerCase();
};

String.prototype.pascalCase = function (this: string) {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.snakeCase = function (this: string) {
  return this.replaceAll(/[a-z][A-Z]/g, (value) => `${value.at(0)}_${value.at(1)!.toLowerCase()}`).toLowerCase();
};

Array.prototype.uniqueBy = function (this: any[], fn) {
  const set = new Set();
  const result = [];

  for (const item of this) {
    const key = fn(item);
    if (!set.has(key)) {
      set.add(key);
      result.push(item);
    }
  }

  return result;
};

Array.prototype.sortBy = function (this: any[], fn) {
  return this.slice().sort((a, b) => {
    const x = fn(a);
    const y = fn(b);

    return x < y ? -1 : x > y ? 1 : 0;
  });
};
