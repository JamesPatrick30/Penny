import type { SQLiteDatabase } from "expo-sqlite";

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils" },
  { name: "Drinks", icon: "coffee" },
  { name: "Transportation", icon: "bus" },

  { name: "School Supplies", icon: "book-open" },
  { name: "Printing", icon: "printer" },
  { name: "School Fees", icon: "graduation-cap" },

  { name: "Skincare", icon: "heart" },
  { name: "Makeup", icon: "sparkles" },
  { name: "Hygiene", icon: "flower-2" },
  { name: "Clothing", icon: "shopping-bag" },
  { name: "Salon", icon: "scissors" },
  { name: "Period Care", icon: "package" },

  { name: "Entertainment", icon: "film" },
  { name: "Medicine", icon: "pill" },
  { name: "Gifts", icon: "gift" },
  { name: "Others", icon: "ellipsis" },
];

export async function seedCategories(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    for (const category of DEFAULT_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (name, icon)
         VALUES (?, ?)`,
        category.name,
        category.icon,
      );
    }
  });
}
