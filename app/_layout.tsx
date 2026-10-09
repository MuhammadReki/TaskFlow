import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootNavigator() {
  const { loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="tambah-tugas"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifikasi-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="bantuan-faq" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <AuthProvider>
        <TasksProvider>
          <NavigationThemeProvider
            value={systemColorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationThemeProvider>
        </TasksProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
