import { FieldLength } from '@/definitions';
import chalk from 'chalk';
import { resolve } from 'path';

export interface ContextArgs {
  PRODUCT_NAME: string;
  REPO_ROOT: string;
  SLN_ROOT?: string;
  DB_CONTEXT?: string;
  UNIT_OF_WORK?: string;
  DB_CONTEXT_PATH?: string;
  INFRASTRUCTURE_MODULE_PATH?: string;
  FIELD_LENGTH?: Record<FieldLength, number>;
  TEST_RESULT_FOLDER_PATH?: string;
}

export interface ContextValue {
  PRODUCT_NAME: string;
  REPO_ROOT: string;
  SLN_ROOT: string;
  DB_CONTEXT: string;
  UNIT_OF_WORK: string;
  DB_CONTEXT_PATH: string;
  INFRASTRUCTURE_MODULE_PATH: string;
  FIELD_LENGTH: Record<FieldLength, number>;
  TEST_RESULT_FOLDER_PATH: string;
}

interface Warning {
  message: string;
  filePath?: string;
}

export class Context implements ContextValue {
  private static instance: Context;

  public readonly warnings: Warning[] = [];

  public readonly PRODUCT_NAME: string;
  public readonly REPO_ROOT: string;
  public readonly SLN_ROOT: string;
  public readonly DB_CONTEXT: string;
  public readonly UNIT_OF_WORK: string;
  public readonly DB_CONTEXT_PATH: string;
  public readonly INFRASTRUCTURE_MODULE_PATH: string;
  public readonly FIELD_LENGTH: Record<FieldLength, number>;
  public readonly TEST_RESULT_FOLDER_PATH: string;

  public static init(args: ContextArgs) {
    this.instance = new Context(args);
  }

  public static get PRODUCT_NAME() {
    return this.instance.PRODUCT_NAME;
  }

  public static get REPO_ROOT() {
    return this.instance.REPO_ROOT;
  }

  public static get SLN_ROOT() {
    return this.instance.SLN_ROOT;
  }

  public static get TEST_FOLDER_RESULT_PATH() {
    return this.instance.TEST_RESULT_FOLDER_PATH;
  }

  public static get DB_CONTEXT() {
    return this.instance.DB_CONTEXT;
  }

  public static get UNIT_OF_WORK() {
    return this.instance.UNIT_OF_WORK;
  }

  public static get DB_CONTEXT_PATH() {
    return this.instance.DB_CONTEXT_PATH;
  }

  public static get INFRASTRUCTURE_MODULE_PATH() {
    return this.instance.INFRASTRUCTURE_MODULE_PATH;
  }

  public static get FIELD_LENGTH() {
    return this.instance.FIELD_LENGTH;
  }

  public static get warnings() {
    return this.instance.warnings;
  }

  public static get UNIT_OF_WORK_NAMESPACE() {
    return this.instance.UNIT_OF_WORK_NAMESPACE;
  }

  public static get UNIT_OF_WORK_INTERFACE() {
    return this.instance.UNIT_OF_WORK_INTERFACE;
  }

  public static get CLIENT_SRC() {
    return this.instance.CLIENT_SRC;
  }

  public static warn(message: string, filePath?: string) {
    this.instance.warn(message, filePath);
  }

  constructor(args: ContextArgs) {
    this.PRODUCT_NAME = args.PRODUCT_NAME;
    this.REPO_ROOT = args.REPO_ROOT;
    this.SLN_ROOT = args.SLN_ROOT ?? `${args.REPO_ROOT}/src/${args.PRODUCT_NAME}`;
    this.DB_CONTEXT = args.DB_CONTEXT ?? `${args.PRODUCT_NAME}.App.Infrastructure.DataAccess.AppDbContext`;
    this.UNIT_OF_WORK = args.UNIT_OF_WORK ?? `${args.PRODUCT_NAME}.App.Core.Common.Services.IUnitOfWork`;
    this.DB_CONTEXT_PATH =
      args.DB_CONTEXT_PATH ??
      `${this.SLN_ROOT}/${this.PRODUCT_NAME}.App.Infrastructure/DataAccess/AppDbContext.cs`;
    this.INFRASTRUCTURE_MODULE_PATH =
      args.INFRASTRUCTURE_MODULE_PATH ??
      `${this.SLN_ROOT}/${this.PRODUCT_NAME}.App.Infrastructure/InfrastructureModule.cs`;
    this.FIELD_LENGTH = args.FIELD_LENGTH ?? {
      sm: 50,
      md: 250,
      lg: 1000,
      xl: 4000,
    };
    this.TEST_RESULT_FOLDER_PATH =
      args.TEST_RESULT_FOLDER_PATH ?? resolve(__dirname, '..', '..', '..', '.test');
  }

  get UNIT_OF_WORK_NAMESPACE() {
    return this.UNIT_OF_WORK.substring(0, this.UNIT_OF_WORK.lastIndexOf('.'));
  }

  get UNIT_OF_WORK_INTERFACE() {
    return this.UNIT_OF_WORK.split('.').at(-1)!;
  }

  get CLIENT_SRC() {
    return `${this.SLN_ROOT}/${this.PRODUCT_NAME}.App.Api/ClientApp/src`;
  }

  public warn(message: string, filePath?: string) {
    this.warnings.push({ message, filePath });
    console.warn(chalk.yellow(filePath ? `[${filePath}]: ${message}` : message));
  }
}
