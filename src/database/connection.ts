import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('gharkohisaab.db');
  }
  return dbInstance;
}

export async function getDrizzleDB() {
  if (!drizzleInstance) {
    const sqlite = await getDB();
    drizzleInstance = drizzle(sqlite, { schema });
  }
  return drizzleInstance;
}

export async function initConnection(): Promise<void> {
  const db = await getDB();
  // Enable foreign key support
  await db.execAsync('PRAGMA foreign_keys = ON;');
}
