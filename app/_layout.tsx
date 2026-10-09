import { widgetTaskHandler } from "@/widgets/widget-task-handler";
import { registerWidgetTaskHandler } from "react-native-android-widget";

registerWidgetTaskHandler(widgetTaskHandler);

import Toast from "@/components/Toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SubtasksProvider } from "@/context/SubtasksContext";
import { TasksProvider } from "@/context/TasksContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="tambah-tugas"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen name="kalender" options={{ headerShown: false }} />
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
      <LanguageProvider>
        <AuthProvider>
          <TasksProvider>
            <SubtasksProvider>
              <ToastProvider>
                <NavigationThemeProvider
                  value={
                    systemColorScheme === "dark" ? DarkTheme : DefaultTheme
                  }
                >
                  <RootNavigator />
                  <Toast />
                  <StatusBar style="auto" />
                </NavigationThemeProvider>
              </ToastProvider>
            </SubtasksProvider>
          </TasksProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
