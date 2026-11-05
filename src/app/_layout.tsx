import {
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
} from "@expo-google-fonts/nunito-sans";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { migrateDbIfNeeded } from "../database/migrations";
import DatabaseInitializer from "../utils/DatabaseInitializer";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SQLiteProvider
      databaseName="penny.db"
      onInit={async (db) => {
        await db.execAsync("PRAGMA foreign_keys = ON");
        await migrateDbIfNeeded(db);
      }}
    >
      <DatabaseInitializer />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#F5F9FF",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="opening" />
        <Stack.Screen name="userInput" />
      </Stack>
    </SQLiteProvider>
  );
}
