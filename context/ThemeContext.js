import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// ============ WARNA LIGHT ============
export const LIGHT_COLORS = {
  bg: "#F6FAF7",
  card: "#FFFFFF",
  cardAlt: "#F3F4F6",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  primary: "#1B6B3A",
  primaryLight: "#2E9E4F",
  primaryBg: "#EAF6EC",
  primaryAccent: "#7ED08B",
  danger: "#D9534F",
  dangerBg: "#FCE8E8",
  warning: "#E8A83E",
  warningBg: "#FDF3E0",
  info: "#3B82F6",
  infoBg: "#E8F0FE",
  shadow: "#000",
  shadowOpacity: 0.05,
};

// ============ WARNA DARK ============
export const DARK_COLORS = {
  bg: "#0F1419",
  card: "#1A1F26",
  cardAlt: "#242A33",
  text: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  border: "#2D3540",
  borderLight: "#242A33",
  primary: "#4ADE80",
  primaryLight: "#22C55E",
  primaryBg: "#1A2E20",
  primaryAccent: "#86EFAC",
  danger: "#F87171",
  dangerBg: "#3B1F1F",
  warning: "#FBBF24",
  warningBg: "#3B2F1A",
  info: "#60A5FA",
  infoBg: "#1E2A3B",
  shadow: "#000",
  shadowOpacity: 0.3,
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem("theme");
      if (saved) {
        setIsDark(saved === "dark");
      }
    } catch (error) {
      console.log("Gagal load theme:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
    } catch (error) {
      console.log("Gagal save theme:", error);
    }
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = {
    isDark,
    colors,
    toggleTheme,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
