import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

import { TasksProvider } from "@/context/TasksContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { requestNotificationPermissions } from "@/utils/notifications";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

// ================== TAMBAHKAN INI ==================
// Setup handler untuk notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // ========== Minta izin notifikasi ==========
    requestNotificationPermissions();

    // ========== Listener saat notifikasi muncul ==========
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notifikasi diterima:", notification);
      });

    // ========== Listener saat notifikasi diklik ==========
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          console.log("👆 Notifikasi diklik, taskId:", taskId);
          // Navigasi ke halaman detail tugas (atau halaman utama)
          router.push("/(tabs)");
        }
      });

    // ========== Cleanup ==========
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <TasksProvider>
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
        <StatusBar style="auto" />
      </TasksProvider>
    </ThemeProvider>
  );
}
