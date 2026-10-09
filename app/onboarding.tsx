import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticSelection } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "checkmark-done-circle" as const,
    title: "Kelola Tugas",
    subtitle:
      "Catat semua tugas lu di satu tempat. Gak ada lagi yang kelupaan.",
    color: "#2E9E4F",
  },
  {
    id: "2",
    icon: "notifications" as const,
    title: "Pengingat Otomatis",
    subtitle: "Dapet notifikasi sebelum deadline. Biar gak ada yang kelewat.",
    color: "#E8A83E",
  },
  {
    id: "3",
    icon: "cloud-done" as const,
    title: "Sinkron ke Cloud",
    subtitle: "Data aman di cloud. Bisa diakses dari HP manapun, kapanpun.",
    color: "#3B82F6",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    hapticSelection();

    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    hapticLight();
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/welcome");
  };

  const handleSkip = async () => {
    hapticLight();
    await finishOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Skip Button */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>
            Lewati
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}
            >
              <Ionicons name={item.icon} size={80} color={item.color} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: colors.primary }]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>
          {currentIndex === SLIDES.length - 1 ? "Mulai Sekarang" : "Lanjut"}
        </Text>
        <Ionicons
          name={
            currentIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"
          }
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  skipButton: { paddingVertical: 8, paddingHorizontal: 12 },
  skipText: { fontSize: 14, fontWeight: "600" },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
