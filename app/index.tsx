import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  useEffect(() => {
    // Tunggu 2 detik, lalu pindah ke Welcome
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2000);

    // Bersihkan timer kalau komponen di-unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6FAF7" }}>
      <ActivityIndicator size="large" color="#1B6B3A" />
      <Text style={{ marginTop: 20, fontSize: 16, color: "#1B6B3A", fontWeight: "600" }}>
        TaskFlow
      </Text>
    </View>
  );
}