import type { Database } from 'sql.js'
import { get, set } from 'idb-keyval'
import { SCHEMA } from './schema'
import { seedDatabase } from './seed'
import { seedTemplates } from './seedTemplates'
import { DB_KEY, AUTOSAVE_DELAY_MS } from '../lib/constants'

let db: Database | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

async function loadSqlJs() {
  const sqlPromise = await import('sql.js')
  const initSqlJs = sqlPromise.default || sqlPromise
  return initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  })
}

export async function initDatabase(): Promise<Database> {
  const SQL = await loadSqlJs()

  const savedData = await get<ArrayBuffer>(DB_KEY)
  if (savedData) {
    db = new SQL.Database(new Uint8Array(savedData))
  } else {
    db = new SQL.Database()
  }

  db.exec('PRAGMA foreign_keys = ON')
  db.exec(SCHEMA)
  seedDatabase(db)
  seedTemplates(db)
  await saveToIndexedDB()

  return db
}

export function getDatabase(): Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export async function saveToIndexedDB(): Promise<void> {
  if (!db) return
  const data = db.export()
  await set(DB_KEY, data.buffer)
}

export function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveToIndexedDB()
  }, AUTOSAVE_DELAY_MS)
}

export async function exportDatabase(): Promise<Uint8Array> {
  if (!db) throw new Error('Database not initialized')
  return db.export()
}

export async function importDatabase(data: ArrayBuffer): Promise<Database> {
  const SQL = await loadSqlJs()
  if (db) db.close()
  db = new SQL.Database(new Uint8Array(data))
  db.exec('PRAGMA foreign_keys = ON')
  await saveToIndexedDB()
  return db
}
