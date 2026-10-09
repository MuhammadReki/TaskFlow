import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: any;
};

export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TaskSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[skeletonStyles.taskCard, { backgroundColor: colors.card }]}>
      <Skeleton width={24} height={24} radius={12} />
      <View style={skeletonStyles.taskInfo}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
        <Skeleton width="25%" height={18} radius={9} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  taskInfo: { flex: 1 },
});
