import type { SQLiteDatabase } from "expo-sqlite";
import { getCurrentTimestamp, getLocalDate } from "../utils/date";

// ==========================================
// TYPES
// ==========================================

export interface Expense {
  id: number;
  amount_cents: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  note: string | null;
  spent_at: string;
  date: string;
  created_at: string;
}

// ==========================================
// HELPERS
// ==========================================

function toCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const cents = Math.round(amount * 100);

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error("Invalid expense amount");
  }

  return cents;
}

// ==========================================
// CREATE
// ==========================================

export async function setExpense(
  db: SQLiteDatabase,
  amount: number,
  categoryId: number,
  note: string | null = null,
  date: string = getLocalDate(),
): Promise<number> {
  const amountCents = toCents(amount);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Invalid category ID");
  }

  const spentAt = getCurrentTimestamp();

  const result = await db.runAsync(
    `INSERT INTO expenses (
      amount_cents,
      category_id,
      note,
      spent_at,
      date
    ) VALUES (?, ?, ?, ?, ?)`,
    amountCents,
    categoryId,
    note,
    spentAt,
    date,
  );

  return result.lastInsertRowId;
}

// ==========================================
// READ BY DATE
// ==========================================

export async function getExpenses(
  db: SQLiteDatabase,
  date: string,
): Promise<Expense[]> {
  return db.getAllAsync<Expense>(
    `SELECT
      e.id,
      e.amount_cents,
      e.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      e.note,
      e.spent_at,
      e.date,
      e.created_at
    FROM expenses e
    INNER JOIN categories c
      ON e.category_id = c.id
    WHERE e.date = ?
    ORDER BY e.spent_at DESC`,
    date,
  );
}

// ==========================================
// READ BY ID
// ==========================================

export async function getExpenseById(
  db: SQLiteDatabase,
  expenseId: number,
): Promise<Expense | null> {
  return db.getFirstAsync<Expense>(
    `SELECT
      e.id,
      e.amount_cents,
      e.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      e.note,
      e.spent_at,
      e.date,
      e.created_at
    FROM expenses e
    INNER JOIN categories c
      ON e.category_id = c.id
    WHERE e.id = ?`,
    expenseId,
  );
}

// ==========================================
// UPDATE
// ==========================================

export async function updateExpense(
  db: SQLiteDatabase,
  expenseId: number,
  amount: number,
  categoryId: number,
  note: string | null,
): Promise<void> {
  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Error("Invalid expense ID");
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Invalid category ID");
  }

  const amountCents = toCents(amount);

  const result = await db.runAsync(
    `UPDATE expenses
     SET amount_cents = ?,
         category_id = ?,
         note = ?
     WHERE id = ?`,
    amountCents,
    categoryId,
    note,
    expenseId,
  );

  if (result.changes === 0) {
    throw new Error("Expense not found");
  }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteExpense(
  db: SQLiteDatabase,
  expenseId: number,
): Promise<void> {
  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Error("Invalid expense ID");
  }

  const result = await db.runAsync(
    "DELETE FROM expenses WHERE id = ?",
    expenseId,
  );

  if (result.changes === 0) {
    throw new Error("Expense not found");
  }
}

// ==========================================
// TOTAL EXPENSES FOR DATE
// ==========================================

export async function getTotalExpensesForDate(
  db: SQLiteDatabase,
  date: string,
): Promise<number> {
  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total
     FROM expenses
     WHERE date = ?`,
    date,
  );

  return result?.total ?? 0;
}

// ==========================================
// READ ALL SORTED BY DATE
// ==========================================

export async function getAllExpensesSortedByDate(
  db: SQLiteDatabase,
): Promise<Expense[]> {
  return db.getAllAsync<Expense>(
    `SELECT
      e.id,
      e.amount_cents,
      e.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      e.note,
      e.spent_at,
      e.date,
      e.created_at
    FROM expenses e
    INNER JOIN categories c
      ON e.category_id = c.id
    ORDER BY e.date DESC, e.spent_at DESC`,
  );
}
