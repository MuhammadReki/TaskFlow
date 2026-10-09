import { useTheme } from "@/context/ThemeContext";
import { hapticHeavy, hapticLight } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
  type = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();

  const typeConfig = {
    danger: { icon: "trash", color: colors.danger, bg: colors.dangerBg },
    warning: { icon: "alert", color: colors.warning, bg: colors.warningBg },
    info: {
      icon: "information-circle",
      color: colors.info,
      bg: colors.infoBg,
    },
  };

  const config = typeConfig[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
            <Ionicons
              name={config.icon as any}
              size={32}
              color={config.color}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.cardAlt }]}
              onPress={() => {
                hapticLight();
                onCancel();
              }}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: config.color }]}
              onPress={() => {
                hapticHeavy();
                onConfirm();
              }}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  message: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 24, width: "100%" },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "700" },
});
