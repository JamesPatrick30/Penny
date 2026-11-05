import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL
      );

      CREATE TABLE daily_allowances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dateId TEXT NOT NULL,
        amount_cents INTEGER NOT NULL
          CHECK (amount_cents >= 0),
        note TEXT,

        FOREIGN KEY (dateId) REFERENCES dates(id)
        ON DELETE RESTRICT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount_cents INTEGER NOT NULL
          CHECK (amount_cents > 0),
        category_id INTEGER NOT NULL,
        note TEXT,
        spent_at TEXT NOT NULL,
        dateId TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (dateId) REFERENCES dates(id)
          ON DELETE CASCADE,

        FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE RESTRICT
      );

      CREATE TABLE dates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
      );

      CREATE INDEX idx_expenses_date
      ON expenses(date);
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
