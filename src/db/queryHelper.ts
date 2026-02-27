import type { Database } from 'sql.js'

/**
 * Execute a parameterized SELECT query using prepared statements.
 * Vite's CJS-to-ESM conversion breaks db.exec/db.run param binding,
 * so we always use db.prepare() / stmt.bind() / stmt.step() instead.
 */
export function query(db: Database, sql: string, params: unknown[] = []): unknown[][] {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const rows: unknown[][] = []
  while (stmt.step()) {
    rows.push(stmt.get())
  }
  stmt.free()
  return rows
}

/**
 * Execute a parameterized mutation (INSERT/UPDATE/DELETE) using prepared statements.
 */
export function execute(db: Database, sql: string, params: unknown[] = []): void {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  stmt.step()
  stmt.free()
}
