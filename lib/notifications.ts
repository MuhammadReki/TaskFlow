import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Setup handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isNative = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Minta izin notifikasi
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNative) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

/**
 * Schedule notifikasi lokal
 */
export const scheduleTaskNotification = async (
  taskId: string,
  title: string,
  deadline: Date,
  minutesBefore: number = 30,
): Promise<string | null> => {
  if (!isNative) return null;

  const permission = await requestNotificationPermission();
  if (!permission) {
    console.log("❌ Izin notifikasi ditolak");
    return null;
  }

  const triggerDate = new Date(deadline.getTime() - minutesBefore * 60 * 1000);

  if (triggerDate.getTime() <= Date.now()) {
    console.log("⏰ Trigger time udah lewat, skip notifikasi");
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Pengingat Tugas",
        body: `${title} - deadline ${minutesBefore} menit lagi!`,
        data: { taskId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    console.log("✅ Notifikasi dijadwalkan:", id);
    return id;
  } catch (error) {
    console.log("❌ Gagal schedule notifikasi:", error);
    return null;
  }
};

/**
 * Cancel notifikasi by ID
 */
export const cancelNotification = async (id: string) => {
  if (!isNative) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log("🗑️ Notifikasi dicancel:", id);
  } catch (error) {
    console.log("Gagal cancel notifikasi:", error);
  }
};

/**
 * Cancel semua notifikasi
 */
export const cancelAllNotifications = async () => {
  if (!isNative) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
