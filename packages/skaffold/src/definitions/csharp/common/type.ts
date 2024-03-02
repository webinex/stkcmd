export const Type = {
  short: (type: string) => {
    switch (type) {
      case 'System.String':
        return 'string';
      case 'System.Int32':
        return 'int';
      case 'System.Int64':
        return 'long';
      case 'System.Decimal':
        return 'decimal';
      case 'System.DateTime':
        return 'DateTime';
      case 'System.Boolean':
        return 'bool';
      case 'System.Byte':
        return 'byte';
      case 'System.Char':
        return 'char';
      case 'System.Double':
        return 'double';
      case 'System.Single':
        return 'float';
      default:
        return type.split('.').at(-1)!;
    }
  },
};
