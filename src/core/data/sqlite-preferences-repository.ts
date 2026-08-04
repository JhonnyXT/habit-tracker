import type { SQLiteDatabase } from 'expo-sqlite';

import type { PreferencesRepository } from '@/core/domain/preferences-repository';

type PreferenceRow = { value: string };

export class SqlitePreferencesRepository implements PreferencesRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(key: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<PreferenceRow>(
      'SELECT value FROM preferences WHERE key = ?',
      key,
    );
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO preferences (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value,
    );
  }
}
