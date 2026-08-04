import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from '@/core/data/migrations';

const DATABASE_NAME = 'habit-tracker.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      return db;
    });
  }

  return databasePromise;
}
