import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#1A1110" }}>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="how-to-play" />
        <Stack.Screen name="character-select" />
        <Stack.Screen name="game" />
      </Stack>
    </GestureHandlerRootView>
  );
}
