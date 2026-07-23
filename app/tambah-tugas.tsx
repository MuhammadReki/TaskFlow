import { useTasks } from "@/context/TasksContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ================== WARNA ==================
const GREEN_DARK = "#1B6B3A";
const GREEN = "#2E9E4F";
const BG = "#F6FAF7";
const RED = "#D9534F";
const RED_BG = "#FCE8E8";
const ORANGE = "#E8A83E";
const ORANGE_BG = "#FDF3E0";
const GREEN_BG = "#EAF6EC";
const GRAY_BORDER = "#E5E7EB";
const GRAY_TEXT = "#9CA3AF";

const PRIORITIES = [
  { key: "Tinggi", color: RED, bg: RED_BG },
  { key: "Sedang", color: ORANGE, bg: ORANGE_BG },
  { key: "Rendah", color: GREEN, bg: GREEN_BG },
];

// Kategori & waktu pengingat — bebas kamu sesuaikan/tambah sendiri
const CATEGORIES = [
  "Kerja",
  "Pribadi",
  "Belajar",
  "Belanja",
  "Kesehatan",
  "Lainnya",
];
const REMINDER_OPTIONS = [
  "5 menit sebelum",
  "10 menit sebelum",
  "30 menit sebelum",
  "1 jam sebelum",
  "1 hari sebelum",
];

const ICON_BY_CATEGORY = {
  Kerja: "briefcase-outline",
  Pribadi: "person-outline",
  Belajar: "book-outline",
  Belanja: "cart-outline",
  Kesehatan: "heart-outline",
  Lainnya: "document-text-outline",
};

/**
 * TambahTugasScreen
 *
 * Kalau `taskId` dikasih (mode edit), form ini otomatis keisi data lama
 * dan tombol "Hapus Tugas" muncul. Kalau kosong (mode tambah baru),
 * tombol hapus disembunyikan.
 */
export default function TambahTugasScreen({ taskId = null }) {
  const { addTask, updateTask, deleteTask, getTaskById } = useTasks();
  const existingTask = taskId ? getTaskById(taskId) : null;

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(
    existingTask?.description || "",
  );
  const [deadline, setDeadline] = useState(
    existingTask?.deadlineDate ? new Date(existingTask.deadlineDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(existingTask?.priority || null);
  const [category, setCategory] = useState(existingTask?.category || null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(
    existingTask?.reminderEnabled || false,
  );
  const [reminderTime, setReminderTime] = useState(
    existingTask?.reminderTime || null,
  );
  const [showReminderModal, setShowReminderModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Judul tugas belum diisi bro, isi dulu ya.");
      return;
    }

    const payload = {
      title: title.trim(),
      description,
      deadlineDate: deadline ? deadline.toISOString() : null,
      date: deadline ? formatDate(deadline) : "",
      dateLabel: getDateLabel(deadline),
      priority,
      category,
      icon: category ? ICON_BY_CATEGORY[category] : "document-text-outline",
      reminderEnabled,
      reminderTime,
    };

    if (existingTask) {
      updateTask(existingTask.id, payload);
    } else {
      addTask(payload); // <-- INI OTOMATIS JADWAL NOTIFIKASI
    }

    router.back();
  };

  const handleDelete = () => {
    if (existingTask) {
      deleteTask(existingTask.id);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerCancel}>Batal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingTask ? "Edit Tugas" : "Tambah Tugas Baru"}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.headerSave}>Simpan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= JUDUL ================= */}
        <Text style={styles.label}>Judul Tugas</Text>
        <View style={styles.inputRow}>
          <Ionicons name="create-outline" size={18} color={GREEN} />
          <TextInput
            style={styles.input}
            placeholder="Masukkan judul tugas"
            placeholderTextColor={GRAY_TEXT}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* ================= DESKRIPSI ================= */}
        <Text style={styles.label}>Deskripsi</Text>
        <View style={styles.textareaRow}>
          <Ionicons
            name="reader-outline"
            size={18}
            color="#9CA3AF"
            style={{ marginTop: 2 }}
          />
          <TextInput
            style={styles.textarea}
            placeholder="Tambahkan catatan atau detail tugas"
            placeholderTextColor={GRAY_TEXT}
            value={description}
            onChangeText={(text) => setDescription(text.slice(0, 500))}
            multiline
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{description.length}/500</Text>

        {/* ================= DEADLINE ================= */}
        <Text style={styles.label}>Deadline</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={GREEN} />
          <Text style={[styles.inputText, !deadline && { color: GRAY_TEXT }]}>
            {deadline ? formatDate(deadline) : "Pilih tanggal deadline"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={GRAY_TEXT} />
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

        {/* ================= PRIORITAS ================= */}
        <Text style={styles.label}>Prioritas</Text>
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
                onPress={() => setPriority(p.key)}
              >
                <Ionicons name="flag" size={14} color={p.color} />
                <Text style={[styles.priorityText, { color: p.color }]}>
                  {p.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= KATEGORI ================= */}
        <Text style={styles.label}>Kategori</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowCategoryModal(true)}
        >
          <Ionicons name="folder-outline" size={18} color={GREEN} />
          <Text style={[styles.inputText, !category && { color: GRAY_TEXT }]}>
            {category || "Pilih kategori"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={GRAY_TEXT} />
        </TouchableOpacity>

        {/* ================= PENGINGAT ================= */}
        <Text style={styles.label}>Pengingat</Text>
        <View style={styles.reminderToggleRow}>
          <Ionicons name="notifications-outline" size={18} color="#374151" />
          <Text style={styles.reminderToggleText}>
            Aktifkan pengingat untuk tugas ini
          </Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: "#E5E7EB", true: GREEN }}
            thumbColor="#fff"
          />
        </View>

        {/* ================= WAKTU PENGINGAT ================= */}
        <Text style={styles.label}>Waktu Pengingat</Text>
        <Text style={styles.helperText}>
          Pilih waktu sebelum deadline untuk menerima notifikasi
        </Text>
        <TouchableOpacity
          style={[styles.inputRow, !reminderEnabled && styles.inputRowDisabled]}
          disabled={!reminderEnabled}
          onPress={() => setShowReminderModal(true)}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={reminderEnabled ? GREEN : GRAY_TEXT}
          />
          <Text
            style={[
              styles.inputText,
              (!reminderEnabled || !reminderTime) && { color: GRAY_TEXT },
            ]}
          >
            {reminderTime || "Pilih waktu pengingat"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={GRAY_TEXT} />
        </TouchableOpacity>

        {/* ================= TOMBOL ================= */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>Simpan Tugas</Text>
        </TouchableOpacity>

        {existingTask && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={RED} />
            <Text style={styles.deleteButtonText}>Hapus Tugas</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ================= MODAL KATEGORI ================= */}
      <PickerModal
        visible={showCategoryModal}
        title="Pilih Kategori"
        options={CATEGORIES}
        onSelect={(value) => {
          setCategory(value);
          setShowCategoryModal(false);
        }}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* ================= MODAL WAKTU PENGINGAT ================= */}
      <PickerModal
        visible={showReminderModal}
        title="Pilih Waktu Pengingat"
        options={REMINDER_OPTIONS}
        onSelect={(value) => {
          setReminderTime(value);
          setShowReminderModal(false);
        }}
        onClose={() => setShowReminderModal(false)}
      />
    </View>
  );
}

// Helper: nentuin label "Hari ini" / "Besok" / nama hari, dipakai HomeScreen buat filter
function getDateLabel(date) {
  if (!date) return "";
  const today = new Date();
  const target = new Date(date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  return target.toLocaleDateString("id-ID", { weekday: "long" });
}

// ================== MODAL PICKER SEDERHANA ==================
function PickerModal({ visible, title, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.modalOption}
              onPress={() => onSelect(option)}
            >
              <Text style={styles.modalOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomColor: GRAY_BORDER,
  },
  headerCancel: {
    fontSize: 16,
    color: GREEN,
    fontWeight: "600",
    paddingVertical: 40, // DITAMBAHKAN
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSave: {
    fontSize: 14,
    color: GREEN,
    fontWeight: "700",
    paddingVertical: 40, // DITAMBAHKAN
  },
  form: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 8,
    marginTop: -4,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: GRAY_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputRowDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.6,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    padding: 0,
  },

  textareaRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  textarea: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    minHeight: 90,
    textAlignVertical: "top",
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    color: GRAY_TEXT,
    textAlign: "right",
    marginTop: 4,
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "700",
  },

  reminderToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  reminderToggleText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_DARK,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: RED,
  },

  // ================== MODAL ==================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: RED,
  },
});
