import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { seedCategories } from "./categories";

export default function DatabaseInitializer() {
  const db = useSQLiteContext();

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const existingCategories = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) AS count FROM categories",
        );

        if (!cancelled && existingCategories?.count === 0) {
          await seedCategories(db);
        }
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [db]);

  return null;
}
