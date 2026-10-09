import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import {
  hapticError,
  hapticHeavy,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
} from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  "Kerja",
  "Pribadi",
  "Belajar",
  "Belanja",
  "Kesehatan",
  "Lainnya",
];

const ICON_BY_CATEGORY: Record<string, string> = {
  Kerja: "briefcase-outline",
  Pribadi: "person-outline",
  Belajar: "book-outline",
  Belanja: "cart-outline",
  Kesehatan: "heart-outline",
  Lainnya: "document-text-outline",
};

export default function TambahTugasScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const taskId = params.id || null;

  const { addTask, updateTask, deleteTask, getTaskById } = useTasks();
  const { colors } = useTheme();
  const existingTask = taskId ? getTaskById(taskId) : null;
  const isEditMode = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(
    existingTask?.description || "",
  );
  const [deadline, setDeadline] = useState<Date | null>(
    existingTask?.deadlineDate ? new Date(existingTask.deadlineDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(existingTask?.priority || "Sedang");
  const [category, setCategory] = useState(existingTask?.category || "Lainnya");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const PRIORITIES = [
    { key: "Tinggi", color: colors.danger, bg: colors.dangerBg },
    { key: "Sedang", color: colors.warning, bg: colors.warningBg },
    { key: "Rendah", color: colors.primary, bg: colors.primaryBg },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      hapticError();
      Alert.alert("Error", "Judul tugas belum diisi bro!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description,
        deadlineDate: deadline ? deadline.toISOString() : null,
        priority,
        category,
        icon: ICON_BY_CATEGORY[category] || "document-text-outline",
      };

      if (isEditMode && existingTask) {
        await updateTask(existingTask.id, payload);
        hapticSuccess();
        Alert.alert("Berhasil", "Tugas berhasil diupdate!");
      } else {
        await addTask(payload);
        hapticSuccess();
        Alert.alert("Berhasil", "Tugas berhasil ditambahkan!");
      }

      router.back();
    } catch (error: any) {
      hapticError();
      Alert.alert("Gagal", error.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingTask) return;

    hapticWarning();
    Alert.alert(
      "Hapus Tugas",
      `Yakin mau hapus "${existingTask.title}"? Tindakan ini gak bisa dibatalin.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              hapticHeavy();
              await deleteTask(existingTask.id);
              router.back();
            } catch (error: any) {
              hapticError();
              Alert.alert("Gagal", error.message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.headerCancel, { color: colors.primary }]}>
            Batal
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? "Edit Tugas" : "Tambah Tugas"}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text
            style={[
              styles.headerSave,
              { color: colors.primary },
              saving && { opacity: 0.5 },
            ]}
          >
            {saving ? "..." : "Simpan"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.form, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.text }]}>Judul Tugas</Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Masukkan judul tugas"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Deskripsi</Text>
        <View
          style={[
            styles.textareaRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="reader-outline"
            size={18}
            color={colors.textMuted}
            style={{ marginTop: 2 }}
          />
          <TextInput
            style={[styles.textarea, { color: colors.text }]}
            placeholder="Tambahkan catatan atau detail tugas"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={(text) => setDescription(text.slice(0, 500))}
            multiline
            maxLength={500}
          />
        </View>
        <Text style={[styles.charCount, { color: colors.textMuted }]}>
          {description.length}/500
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Deadline</Text>
        <TouchableOpacity
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {
            hapticSelection();
            setShowDatePicker(true);
          }}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text
            style={[
              styles.inputText,
              { color: deadline ? colors.text : colors.textMuted },
            ]}
          >
            {deadline ? formatDate(deadline) : "Pilih tanggal deadline"}
          </Text>
          {deadline && (
            <TouchableOpacity onPress={() => setDeadline(null)}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={deadline || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) setDeadline(selectedDate);
            }}
          />
        )}

        <Text style={[styles.label, { color: colors.text }]}>Prioritas</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const active = priority === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityChip,
                  { backgroundColor: p.bg },
                  active && { borderWidth: 2, borderColor: p.color },
                ]}
                onPress={() => {
                  hapticSelection();
                  setPriority(p.key);
                }}
              >
                <Ionicons name="flag" size={14} color={p.color} />
                <Text style={[styles.priorityText, { color: p.color }]}>
                  {p.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
        <TouchableOpacity
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {
            hapticSelection();
            setShowCategoryModal(true);
          }}
        >
          <Ionicons name="folder-outline" size={18} color={colors.primary} />
          <Text style={[styles.inputText, { color: colors.text }]}>
            {category || "Pilih kategori"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>
            {saving ? "Menyimpan..." : "Simpan Tugas"}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              { backgroundColor: colors.card, borderColor: colors.danger },
            ]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
              Hapus Tugas
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <PickerModal
        visible={showCategoryModal}
        title="Pilih Kategori"
        options={CATEGORIES}
        onSelect={(value) => {
          hapticSelection();
          setCategory(value);
          setShowCategoryModal(false);
        }}
        onClose={() => setShowCategoryModal(false)}
        colors={colors}
      />
    </View>
  );
}

function PickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                { borderBottomColor: colors.borderLight },
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={[styles.modalCancelText, { color: colors.danger }]}>
              Batal
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerCancel: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSave: { fontSize: 15, fontWeight: "700" },
  form: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputText: { flex: 1, fontSize: 14 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  textareaRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  textarea: {
    flex: 1,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
    padding: 0,
  },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4 },
  priorityRow: { flexDirection: "row", gap: 10 },
  priorityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  priorityText: { fontSize: 13, fontWeight: "700" },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    gap: 8,
  },
  saveButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    gap: 8,
  },
  deleteButtonText: { fontSize: 15, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 14 },
  modalCancel: { marginTop: 12, paddingVertical: 14, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
});
