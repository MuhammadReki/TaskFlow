import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const GREEN_DARK = "#1B6B3A";
const GREEN = "#2E9E4F";
const GRAY_BORDER = "#E5E7EB";
const GRAY_TEXT = "#9CA3AF";

type Props = {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  resultCount?: number;
};

export default function SearchModal({
  visible,
  value,
  onChangeText,
  onClose,
  resultCount,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={GRAY_TEXT} />
              <TextInput
                style={styles.input}
                placeholder="Cari tugas..."
                placeholderTextColor={GRAY_TEXT}
                value={value}
                onChangeText={onChangeText}
                autoFocus
                returnKeyType="search"
              />
              {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")}>
                  <Ionicons name="close-circle" size={18} color={GRAY_TEXT} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>

          {/* INFO */}
          {value.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                {resultCount === 0
                  ? "Gak ada tugas yang cocok"
                  : `${resultCount} tugas ditemukan`}
              </Text>
            </View>
          )}

          {/* HINT */}
          {value.length === 0 && (
            <View style={styles.hintBox}>
              <Ionicons name="bulb-outline" size={20} color={GREEN} />
              <Text style={styles.hintText}>
                Ketik judul atau deskripsi tugas buat nyari
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    padding: 0,
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: GREEN_DARK,
  },
  infoRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#EAF6EC",
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: GREEN_DARK,
    lineHeight: 17,
  },
});
