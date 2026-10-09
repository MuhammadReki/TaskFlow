import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    router.replace("/(tabs)");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, { backgroundColor: colors.bg }]}
      onPress={handleStart}
    >
      {/* Dekorasi */}
      <View
        style={[
          styles.decorCircle,
          styles.decorTopLeft,
          { backgroundColor: colors.primaryAccent },
        ]}
      />
      <View
        style={[
          styles.decorCircle,
          styles.decorBottomRight,
          { backgroundColor: colors.primaryAccent },
        ]}
      />
      <View style={[styles.dotTopRight, { backgroundColor: colors.primary }]} />
      <View style={[styles.ringLeft, { borderColor: colors.primaryAccent }]} />
      <View style={[styles.ringRight, { borderColor: colors.primaryAccent }]} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <Image
            source={require("@/assets/images/Logo ToDoList-TaskFlow.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Judul */}
        <Text style={[styles.title, { color: colors.text }]}>
          Task<Text style={{ color: colors.primary }}>Flow</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === "id"
            ? "Kelola tugasmu, tingkatkan produktivitasmu."
            : "Manage your tasks, boost your productivity."}
        </Text>

        {/* Ilustrasi */}
        <View style={styles.illustrationWrap}>
          <View
            style={[
              styles.illustrationBg,
              { backgroundColor: colors.primaryBg },
            ]}
          />
          <View style={styles.plantWrap}>
            <View
              style={[
                styles.leafLeft,
                { backgroundColor: colors.primaryAccent },
              ]}
            />
            <View
              style={[styles.leafRight, { backgroundColor: colors.primary }]}
            />
            <View style={[styles.stem, { backgroundColor: colors.primary }]} />
            <View
              style={[
                styles.pot,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            />
          </View>
          <View
            style={[
              styles.notepad,
              {
                backgroundColor: colors.card,
                shadowOpacity: colors.shadowOpacity,
              },
            ]}
          >
            <View style={styles.spiralRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.spiral, { borderColor: colors.primary }]}
                />
              ))}
            </View>
            {[true, true, false].map((checked, i) => (
              <View key={i} style={styles.taskRow}>
                <View
                  style={[
                    styles.taskCircle,
                    { borderColor: colors.border },
                    checked && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {checked && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <View
                  style={[
                    styles.taskLine,
                    {
                      backgroundColor: checked
                        ? colors.primaryAccent
                        : colors.border,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={[styles.clock, { backgroundColor: colors.primary }]}>
            <View style={[styles.clockFace, { backgroundColor: colors.card }]}>
              <View
                style={[
                  styles.clockHandHour,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.clockHandMinute,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.clockCenter,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Tombol */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={handleStart}
        >
          <Ionicons name="arrow-forward" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          {language === "id" ? "Mulai" : "Get Started"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    overflow: "hidden",
  },
  decorCircle: { position: "absolute", borderRadius: 999, opacity: 0.18 },
  decorTopLeft: { width: 220, height: 220, top: -80, left: -90 },
  decorBottomRight: { width: 260, height: 260, bottom: -100, right: -100 },
  dotTopRight: {
    position: "absolute",
    top: 90,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ringLeft: {
    position: "absolute",
    top: 150,
    left: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  ringRight: {
    position: "absolute",
    bottom: 220,
    right: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  content: { alignItems: "center", width: "100%", paddingHorizontal: 24 },
  logoBox: { marginBottom: 8 },
  logoImage: { width: 70, height: 70, borderRadius: 12 },
  title: { fontSize: 42, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: "center" },
  illustrationWrap: {
    width: width * 0.8,
    height: 260,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationBg: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  notepad: {
    width: 150,
    height: 190,
    borderRadius: 16,
    padding: 16,
    paddingTop: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  spiralRow: {
    position: "absolute",
    top: -8,
    left: 20,
    flexDirection: "row",
    gap: 10,
  },
  spiral: {
    width: 10,
    height: 16,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 6,
  },
  taskRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  taskLine: { flex: 1, height: 4, borderRadius: 2 },
  plantWrap: {
    position: "absolute",
    left: 0,
    bottom: 10,
    alignItems: "center",
  },
  pot: { width: 46, height: 36, borderRadius: 8, borderWidth: 1.5 },
  stem: { width: 4, height: 28, borderRadius: 2, marginBottom: -4 },
  leafLeft: {
    position: "absolute",
    top: 0,
    left: 6,
    width: 18,
    height: 26,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    transform: [{ rotate: "-20deg" }],
  },
  leafRight: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    transform: [{ rotate: "20deg" }],
  },
  clock: {
    position: "absolute",
    right: 0,
    bottom: 4,
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  clockFace: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  clockHandHour: {
    position: "absolute",
    width: 3,
    height: 14,
    borderRadius: 2,
    bottom: 30,
    transform: [{ rotate: "30deg" }],
  },
  clockHandMinute: {
    position: "absolute",
    width: 2.5,
    height: 20,
    borderRadius: 2,
    bottom: 30,
    transform: [{ rotate: "110deg" }],
  },
  clockCenter: { width: 6, height: 6, borderRadius: 3 },
  bottomWrap: { alignItems: "center" },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  hintText: { marginTop: 14, fontSize: 13 },
});
