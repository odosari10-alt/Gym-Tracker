declare module 'sql.js' {
  interface Statement {
    bind(params?: unknown[]): boolean
    step(): boolean
    get(): unknown[]
    getAsObject(): Record<string, unknown>
    free(): void
  }

  interface Database {
    run(sql: string, params?: unknown[]): void
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
  }

  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database
  }

  interface InitSqlJsOptions {
    locateFile?: (file: string) => string
  }

  function initSqlJs(options?: InitSqlJsOptions): Promise<SqlJsStatic>

  export default initSqlJs
  export type { Database, Statement, QueryExecResult, SqlJsStatic }
}
