export function convertCSharpTypeToTsType(cSharpType: string, options?: { dateType?: string }): string {
  options = { dateType: 'Date', ...options };

  switch (cSharpType) {
    case 'System.Int16':
      return 'number';
    case 'System.Int64':
      return 'number';
    case 'System.Int32':
      return 'number';
    case 'System.Double':
      return 'number';
    case 'System.Decimal':
      return 'number';
    case 'System.Single':
      return 'number';
    case 'System.String':
      return 'string';
    case 'System.Boolean':
      return 'boolean';
    case 'System.Guid':
      return 'string';
    case 'System.DateTime':
      return options.dateType!;
    case 'System.DateTimeOffset':
      return options.dateType!;
    default:
      return cSharpType;
  }
}
