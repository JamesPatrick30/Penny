import type { SQLiteDatabase } from "expo-sqlite";

export async function getUser(
  db: SQLiteDatabase,
): Promise<{ name: string } | null> {
  const result = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM user LIMIT 1",
  );
  return result || null;
}
export async function setUser(db: SQLiteDatabase, name: string): Promise<void> {
  return db
    .runAsync("INSERT INTO user (name) VALUES (?)", [name])
    .then(() => undefined);
}
