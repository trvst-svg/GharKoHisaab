import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('gharkohisaab.db');
  }
  return dbInstance;
}

export async function initConnection(): Promise<void> {
  const db = await getDB();
  // Enable foreign key support
  await db.execAsync('PRAGMA foreign_keys = ON;');
}
