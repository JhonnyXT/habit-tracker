import type { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekdays', 'times_per_week')),
          schedule_weekdays TEXT,
          schedule_times_per_week INTEGER,
          sort_order INTEGER NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS completions (
          id TEXT PRIMARY KEY NOT NULL,
          habit_id TEXT NOT NULL REFERENCES habits(id),
          date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE (habit_id, date)
        );

        CREATE INDEX IF NOT EXISTS idx_completions_habit_date
          ON completions (habit_id, date);

        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY NOT NULL,
          habit_id TEXT NOT NULL REFERENCES habits(id),
          time TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 2,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS preferences (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
    },
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  const pending = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
    });
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}
