import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  task: any;
  index: number;
  priorityStyle: { bg: string; text: string };
  onPress: () => void;
  onToggle: () => void;
};

export default function AnimatedTaskCard({
  task,
  priorityStyle,
  onPress,
  onToggle,
}: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        {
          backgroundColor: colors.card,
          shadowOpacity: colors.shadowOpacity,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <TouchableOpacity
        style={[
          styles.taskCheckbox,
          { borderColor: colors.border },
          task.completed && {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
        ]}
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <Text
          style={[
            styles.taskTitle,
            { color: colors.text },
            task.completed && {
              textDecorationLine: "line-through",
              color: colors.textMuted,
            },
          ]}
        >
          {task.title}
        </Text>

        <View style={styles.taskDateRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.taskDateText, { color: colors.textMuted }]}>
            {task.date} {task.dateLabel ? `• ${task.dateLabel}` : ""}
          </Text>
        </View>

        {task.priority ? (
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityStyle.bg },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {task.priority}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.taskIconBox, { backgroundColor: colors.primaryBg }]}>
        <Ionicons
          name={(task.icon as any) || "document-text-outline"}
          size={18}
          color={colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700" },
  taskDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  taskDateText: { fontSize: 12, marginLeft: 4 },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  priorityText: { fontSize: 11, fontWeight: "700" },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
