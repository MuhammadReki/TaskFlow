import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
