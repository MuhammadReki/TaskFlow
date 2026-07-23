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

// Warna utama sesuai desain
const GREEN_DARK = "#1B6B3A";
const GREEN = "#2E9E4F";
const GREEN_LIGHT = "#7ED08B";
const GREEN_BG = "#EAF6EC";
const BG = "#F6FAF7";

export default function WelcomeScreen() {
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
      style={styles.container}
      onPress={handleStart}
    >
      {/* Dekorasi lingkaran background */}
      <View style={[styles.decorCircle, styles.decorTopLeft]} />
      <View style={[styles.decorCircle, styles.decorBottomRight]} />
      <View style={styles.dotTopRight} />
      <View style={styles.ringLeft} />
      <View style={styles.ringRight} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo icon - GANTI DENGAN INI */}
        <View style={styles.logoBox}>
          <Image
            source={require("@/assets/images/Logo ToDoList-TaskFlow.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Judul */}
        <Text style={styles.title}>
          Task<Text style={styles.titleAccent}>Flow</Text>
        </Text>

        <Text style={styles.subtitle}>
          Kelola tugasmu, tingkatkan produktivitasmu.
        </Text>

        {/* Ilustrasi */}
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationBg} />
          <View style={styles.plantWrap}>
            <View style={styles.leafLeft} />
            <View style={styles.leafRight} />
            <View style={styles.stem} />
            <View style={styles.pot} />
          </View>
          <View style={styles.notepad}>
            <View style={styles.spiralRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.spiral} />
              ))}
            </View>
            {[true, true, false].map((checked, i) => (
              <View key={i} style={styles.taskRow}>
                <View
                  style={[
                    styles.taskCircle,
                    checked && styles.taskCircleChecked,
                  ]}
                >
                  {checked && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <View
                  style={[
                    styles.taskLine,
                    !checked && styles.taskLineUnchecked,
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.clock}>
            <View style={styles.clockFace}>
              <View style={styles.clockHandHour} />
              <View style={styles.clockHandMinute} />
              <View style={styles.clockCenter} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Tombol lanjut */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity style={styles.nextButton} onPress={handleStart}>
          <Ionicons name="arrow-forward" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.hintText}>Get Started</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    overflow: "hidden",
  },

  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: GREEN_LIGHT,
    opacity: 0.18,
  },
  decorTopLeft: {
    width: 220,
    height: 220,
    top: -80,
    left: -90,
  },
  decorBottomRight: {
    width: 260,
    height: 260,
    bottom: -100,
    right: -100,
  },
  dotTopRight: {
    position: "absolute",
    top: 90,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  ringLeft: {
    position: "absolute",
    top: 150,
    left: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GREEN_LIGHT,
  },
  ringRight: {
    position: "absolute",
    bottom: 220,
    right: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GREEN_LIGHT,
  },

  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
  },

  // TAMBAHKAN STYLE INI
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },

  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  titleAccent: {
    color: GREEN,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_BG,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: GREEN_DARK,
    fontWeight: "600",
    marginLeft: 6,
  },

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
    backgroundColor: GREEN_BG,
  },

  notepad: {
    width: 150,
    height: 190,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    paddingTop: 26,
    shadowColor: "#000",
    shadowOpacity: 0.08,
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
    borderColor: GREEN,
    marginRight: 6,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  taskCircleChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  taskLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN_LIGHT,
  },
  taskLineUnchecked: {
    backgroundColor: "#E5E7EB",
  },

  plantWrap: {
    position: "absolute",
    left: 0,
    bottom: 10,
    alignItems: "center",
  },
  pot: {
    width: 46,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  stem: {
    width: 4,
    height: 28,
    backgroundColor: GREEN,
    borderRadius: 2,
    marginBottom: -4,
  },
  leafLeft: {
    position: "absolute",
    top: 0,
    left: 6,
    width: 18,
    height: 26,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: GREEN_LIGHT,
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
    backgroundColor: GREEN,
    transform: [{ rotate: "20deg" }],
  },

  clock: {
    position: "absolute",
    right: 0,
    bottom: 4,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: GREEN_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  clockFace: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  clockHandHour: {
    position: "absolute",
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: GREEN_DARK,
    bottom: 30,
    transform: [{ rotate: "30deg" }],
  },
  clockHandMinute: {
    position: "absolute",
    width: 2.5,
    height: 20,
    borderRadius: 2,
    backgroundColor: GREEN_DARK,
    bottom: 30,
    transform: [{ rotate: "110deg" }],
  },
  clockCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_DARK,
  },

  bottomWrap: {
    alignItems: "center",
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN_DARK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN_DARK,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  hintText: {
    marginTop: 14,
    fontSize: 13,
    color: "#9CA3AF",
  },
});
