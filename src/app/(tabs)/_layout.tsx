import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
    </Stack>
  );
}
