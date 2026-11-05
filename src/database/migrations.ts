import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 5;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  // Version 2: Ensure user table exists

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  // Initial database creation
  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_allowances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
        note TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        category_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        spent_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (date)
          REFERENCES daily_allowances(date)
          ON DELETE RESTRICT,

        FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_date
        ON expenses(date);

      CREATE INDEX IF NOT EXISTS idx_expenses_category
        ON expenses(category_id);
    `);
  }

  if (currentVersion < 5) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
      CREATE TABLE daily_allowances_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        amount_cents INTEGER NOT NULL
          CHECK (amount_cents >= 0),
        note TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO daily_allowances_new (
        date,
        amount_cents,
        note,
        created_at
      )
      SELECT
        date,
        amount_cents,
        note,
        created_at
      FROM daily_allowances;

      DROP TABLE daily_allowances;

      ALTER TABLE daily_allowances_new
      RENAME TO daily_allowances;
    `);
    });
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  console.log(
    `Database migrated from version ${currentVersion} to ${DATABASE_VERSION}`,
  );
}
