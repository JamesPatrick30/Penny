export interface DailyAllowance {
  id: number;
  dateId: string;
  amount_cents: number;
  note: string | null;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface Expense {
  id: number;
  amount_cents: number;
  category_id: string;
  note: string | null;
  spent_at: string;
  dateId: string;
  created_at: string;
}

export interface Categories {
  id: number;
  name: string;
  icon: string;
}

export interface dates {
  id: string;
  date: string;
}
