import type { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  if (result?.user_version === 1) return;

  return db.execAsync(`PRAGMA user_version = 1`);
}

export async function setUser(db: SQLiteDatabase, name: string): Promise<void> {
  return db
    .runAsync("INSERT INTO user (name) VALUES (?)", [name])
    .then(() => undefined);
}
