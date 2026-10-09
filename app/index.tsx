import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { colors } = useTheme();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      setTimeout(() => {
        if (hasSeenOnboarding === "true") {
          router.replace("/welcome");
        } else {
          router.replace("/onboarding");
        }
      }, 1500);
    } catch (error) {
      console.log("Error check onboarding:", error);
      router.replace("/welcome");
    }
  };

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
      <Text
        style={{
          marginTop: 20,
          fontSize: 16,
          color: colors.primary,
          fontWeight: "600",
        }}
      >
        TaskFlow
      </Text>
    </View>
  );
}
