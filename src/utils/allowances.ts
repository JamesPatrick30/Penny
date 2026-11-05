import type { SQLiteDatabase } from "expo-sqlite";
import { getCurrentTimestamp, getLocalDate } from "../utils/date";

export interface Allowance {
  id: number;
  amount_cents: number;
  note: string | null;
  date: string;
  created_at: string;
}

// Convert PHP pesos into integer cents.
function toCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const cents = Math.round(amount * 100);

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error("Invalid allowance amount");
  }

  return cents;
}

// CREATE
export async function setAllowance(
  db: SQLiteDatabase,
  amount: number,
  note: string | null = null,
  date: string = getLocalDate(),
): Promise<number> {
  const amountCents = toCents(amount);
  const createdAt = getCurrentTimestamp();

  const result = await db.runAsync(
    `INSERT INTO allowances (
      amount_cents,
      note,
      date,
      created_at
    ) VALUES (?, ?, ?, ?)`,
    amountCents,
    note,
    date,
    createdAt,
  );

  return result.lastInsertRowId;
}

// get today's total allowance
export async function getTodayTotalAllowance(
  db: SQLiteDatabase,
): Promise<number | null> {
  const today = getLocalDate();
  return db
    .getFirstAsync<Allowance>(
      `SELECT *
     FROM daily_allowances
     WHERE date = ?`,
      today,
    )
    .then((result) => {
      if (result) {
        return result.amount_cents;
      }
      return null;
    });
}

// Get all allowances for today
export async function getAllAllowancesForToday(
  db: SQLiteDatabase,
): Promise<Allowance[]> {
  const today = getLocalDate();

  return db.getAllAsync<Allowance>(
    `SELECT *
     FROM daily_allowances
     WHERE date = ?
     ORDER BY created_at ASC, id ASC`,
    today,
  );
}
// READ ONE BY ID
export async function getAllowanceById(
  db: SQLiteDatabase,
  id: number,
): Promise<Allowance | null> {
  return db.getFirstAsync<Allowance>(
    `SELECT *
     FROM allowances
     WHERE id = ?`,
    id,
  );
}

// READ ALL FOR A DATE
export async function getAllAllowancesByDate(
  db: SQLiteDatabase,
  date: string,
): Promise<Allowance[]> {
  return db.getAllAsync<Allowance>(
    `SELECT *
     FROM allowances
     WHERE date = ?
     ORDER BY created_at ASC, id ASC`,
    date,
  );
}

// UPDATE
export async function updateAllowance(
  db: SQLiteDatabase,
  id: number,
  amount: number,
  note: string | null,
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid allowance ID");
  }

  const amountCents = toCents(amount);
  const updatedAt = getCurrentTimestamp();

  const result = await db.runAsync(
    `UPDATE allowances
     SET amount_cents = ?,
         note = ?,
         updated_at = ?
     WHERE id = ?`,
    amountCents,
    note,
    updatedAt,
    id,
  );

  if (result.changes === 0) {
    throw new Error("Allowance not found");
  }
}

// DELETE
export async function deleteAllowance(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid allowance ID");
  }

  const result = await db.runAsync(
    `DELETE FROM allowances
     WHERE id = ?`,
    id,
  );

  if (result.changes === 0) {
    throw new Error("Allowance not found");
  }
}

// GET TOTAL FOR A DATE
export async function getTotalAllowancesForDate(
  db: SQLiteDatabase,
  date: string,
): Promise<number> {
  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total
     FROM allowances
     WHERE date = ?`,
    date,
  );

  return result?.total ?? 0;
}
