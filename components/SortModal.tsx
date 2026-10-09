import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GREEN_DARK = "#1B6B3A";
const GREEN_BG = "#EAF6EC";
const GRAY_BORDER = "#E5E7EB";
const GRAY_TEXT = "#9CA3AF";

export type SortOption =
  | "terbaru"
  | "terlama"
  | "prioritas"
  | "az"
  | "za"
  | "deadline";

type SortItem = {
  key: SortOption;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SORT_OPTIONS: SortItem[] = [
  {
    key: "terbaru",
    label: "Terbaru",
    description: "Tugas terbaru muncul duluan",
    icon: "time-outline",
  },
  {
    key: "terlama",
    label: "Terlama",
    description: "Tugas terlama muncul duluan",
    icon: "hourglass-outline",
  },
  {
    key: "prioritas",
    label: "Prioritas",
    description: "Tinggi → Sedang → Rendah",
    icon: "flag-outline",
  },
  {
    key: "deadline",
    label: "Deadline Terdekat",
    description: "Yang paling mepet duluan",
    icon: "calendar-outline",
  },
  {
    key: "az",
    label: "A → Z",
    description: "Judul dari A ke Z",
    icon: "arrow-down-outline",
  },
  {
    key: "za",
    label: "Z → A",
    description: "Judul dari Z ke A",
    icon: "arrow-up-outline",
  },
];

type Props = {
  visible: boolean;
  current: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
};

export default function SortModal({
  visible,
  current,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Urutkan Tugas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={GRAY_TEXT} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          {SORT_OPTIONS.map((option) => {
            const active = option.key === current;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => {
                  onSelect(option.key);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIconBox,
                    active && styles.optionIconBoxActive,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={active ? GREEN_DARK : GRAY_TEXT}
                  />
                </View>

                <View style={styles.optionTextWrap}>
                  <Text
                    style={[
                      styles.optionLabel,
                      active && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </View>

                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={GREEN_DARK}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 20 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 4,
    gap: 12,
  },
  optionActive: {
    backgroundColor: GREEN_BG,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconBoxActive: {
    backgroundColor: "#fff",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  optionLabelActive: {
    color: GREEN_DARK,
  },
  optionDesc: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 2,
  },
});
