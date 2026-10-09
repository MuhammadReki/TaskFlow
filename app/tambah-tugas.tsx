import ConfirmDialog from "@/components/ConfirmDialog";
import SubtaskList from "@/components/SubtaskList";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  hapticError,
  hapticHeavy,
  hapticLight,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
} from "@/lib/haptics";
import { deleteAttachment, uploadAttachment } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TambahTugasScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const taskId = params.id || null;

  const { user } = useAuth();
  const { addTask, updateTask, deleteTask, getTaskById } = useTasks();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const existingTask = taskId ? getTaskById(taskId) : null;
  const isEditMode = !!existingTask;

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const CATEGORIES = [
    { value: "Kerja", labelKey: "kerja", icon: "briefcase-outline" as const },
    { value: "Pribadi", labelKey: "pribadi", icon: "person-outline" as const },
    { value: "Belajar", labelKey: "belajar", icon: "book-outline" as const },
    { value: "Belanja", labelKey: "belanja", icon: "cart-outline" as const },
    {
      value: "Kesehatan",
      labelKey: "kesehatan",
      icon: "heart-outline" as const,
    },
    {
      value: "Lainnya",
      labelKey: "lainnya",
      icon: "document-text-outline" as const,
    },
  ];

  const REMINDER_OPTIONS = [
    { labelKey: "limaMenit", value: 5 },
    { labelKey: "sepuluhMenit", value: 10 },
    { labelKey: "tigaPuluhMenit", value: 30 },
    { labelKey: "satuJam", value: 60 },
    { labelKey: "satuHari", value: 1440 },
  ];

  const RECURRING_OPTIONS = [
    { labelKey: "tidakBerulang", value: "none" },
    { labelKey: "harian", value: "daily" },
    { labelKey: "mingguan", value: "weekly" },
    { labelKey: "bulanan", value: "monthly" },
  ];

  const ICON_BY_CATEGORY: Record<string, string> = {
    Kerja: "briefcase-outline",
    Pribadi: "person-outline",
    Belajar: "book-outline",
    Belanja: "cart-outline",
    Kesehatan: "heart-outline",
    Lainnya: "document-text-outline",
  };

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
  const [reminderBefore, setReminderBefore] = useState<number>(30);
  const [recurring, setRecurring] = useState(existingTask?.recurring || "none");
  const [saving, setSaving] = useState(false);

  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(
    existingTask?.attachmentUrl || null,
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(
    existingTask?.attachmentName || null,
  );
  const [uploading, setUploading] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmRemoveAttachment, setShowConfirmRemoveAttachment] =
    useState(false);

  const PRIORITIES = [
    {
      key: "Tinggi",
      labelKey: "tinggi",
      color: colors.danger,
      bg: colors.dangerBg,
    },
    {
      key: "Sedang",
      labelKey: "sedang",
      color: colors.warning,
      bg: colors.warningBg,
    },
    {
      key: "Rendah",
      labelKey: "rendah",
      color: colors.primary,
      bg: colors.primaryBg,
    },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePickImage = async () => {
    hapticSelection();
    setShowAttachmentModal(false);

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast(t("butuhIzinGaleri"), "warning");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;

      setUploading(true);
      const url = await uploadAttachment(user!.id, asset.uri, fileName);
      setUploading(false);

      if (url) {
        setAttachmentUrl(url);
        setAttachmentName(fileName);
        hapticSuccess();
        showToast(t("berhasil"), "success");
      } else {
        hapticError();
        showToast(t("gagal"), "error");
      }
    } catch (error: any) {
      setUploading(false);
      hapticError();
      showToast(error.message, "error");
    }
  };

  const handlePickDocument = async () => {
    hapticSelection();
    setShowAttachmentModal(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const fileName = asset.name || `file_${Date.now()}`;

      setUploading(true);
      const url = await uploadAttachment(user!.id, asset.uri, fileName);
      setUploading(false);

      if (url) {
        setAttachmentUrl(url);
        setAttachmentName(fileName);
        hapticSuccess();
        showToast(t("berhasil"), "success");
      } else {
        hapticError();
        showToast(t("gagal"), "error");
      }
    } catch (error: any) {
      setUploading(false);
      hapticError();
      showToast(error.message, "error");
    }
  };

  const handleRemoveAttachment = () => {
    hapticWarning();
    setShowConfirmRemoveAttachment(true);
  };

  const confirmRemoveAttachment = async () => {
    setShowConfirmRemoveAttachment(false);
    try {
      if (attachmentUrl) {
        await deleteAttachment(attachmentUrl);
      }
      setAttachmentUrl(null);
      setAttachmentName(null);
      hapticHeavy();
      showToast(t("berhasil"), "info");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const isImage = (url: string | null) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const handleShare = async () => {
    hapticLight();
    const shareText = `
📋 *${title || "TaskFlow"}*

${description ? `📝 ${description}\n` : ""}
${deadline ? `📅 ${t("deadline")}: ${formatDate(deadline)}\n` : ""}
🎯 ${t("prioritas")}: ${t(priority.toLowerCase())}
📂 ${t("kategori")}: ${t(category.toLowerCase())}
${attachmentUrl ? `📎 ${t("lampiran")}: ${attachmentUrl}\n` : ""}

TaskFlow 📱
    `.trim();

    try {
      await Share.share({
        message: shareText,
        title: title || "TaskFlow",
      });
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      hapticError();
      showToast(t("judulKosong"), "warning");
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
        reminderBefore,
        recurring,
        attachmentUrl,
        attachmentName,
      };

      if (isEditMode && existingTask) {
        await updateTask(existingTask.id, payload);
        hapticSuccess();
        showToast(t("berhasil"), "success");
      } else {
        await addTask(payload);
        hapticSuccess();
        showToast(t("berhasil"), "success");
      }

      router.back();
    } catch (error: any) {
      hapticError();
      showToast(error.message || t("gagal"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingTask) return;
    hapticWarning();
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!existingTask) return;
    setShowConfirmDelete(false);

    try {
      hapticHeavy();
      if (attachmentUrl) {
        await deleteAttachment(attachmentUrl);
      }
      await deleteTask(existingTask.id);
      showToast(t("berhasil"), "info");
      router.back();
    } catch (error: any) {
      hapticError();
      showToast(error.message, "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.headerCancel, { color: colors.primary }]}>
            {t("batal")}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? t("editTugas") : t("tambahTugas")}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text
            style={[
              styles.headerSave,
              { color: colors.primary },
              saving && { opacity: 0.5 },
            ]}
          >
            {saving ? "..." : t("simpan")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* JUDUL */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("judulTugas")}
        </Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("judulPlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* DESKRIPSI */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("deskripsi")}
        </Text>
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
            placeholder={t("deskripsiPlaceholder")}
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

        {/* DEADLINE */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("deadline")}
        </Text>
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
            {deadline ? formatDate(deadline) : t("pilihDeadline")}
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

        {/* PENGINGAT */}
        {deadline && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("pengingat")}
            </Text>
            <TouchableOpacity
              style={[
                styles.inputRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                hapticSelection();
                setShowReminderModal(true);
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.inputText, { color: colors.text }]}>
                {t(
                  REMINDER_OPTIONS.find((r) => r.value === reminderBefore)
                    ?.labelKey || "tigaPuluhMenit",
                )}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </>
        )}

        {/* PENGULANGAN */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("pengulangan")}
        </Text>
        <TouchableOpacity
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {
            hapticSelection();
            setShowRecurringModal(true);
          }}
        >
          <Ionicons name="repeat-outline" size={18} color={colors.primary} />
          <Text style={[styles.inputText, { color: colors.text }]}>
            {t(
              RECURRING_OPTIONS.find((r) => r.value === recurring)?.labelKey ||
                "tidakBerulang",
            )}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* LAMPIRAN */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("lampiran")}
        </Text>

        {attachmentUrl ? (
          <View
            style={[
              styles.attachmentPreview,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {isImage(attachmentUrl) ? (
              <Image
                source={{ uri: attachmentUrl }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.fileIconBox,
                  { backgroundColor: colors.primaryBg },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>
            )}

            <View style={styles.attachmentInfo}>
              <Text
                style={[styles.attachmentName, { color: colors.text }]}
                numberOfLines={1}
              >
                {attachmentName || t("lampiran")}
              </Text>
            </View>

            <TouchableOpacity onPress={handleRemoveAttachment}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.attachmentButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              hapticSelection();
              setShowAttachmentModal(true);
            }}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.attachmentButtonText,
                    { color: colors.primary },
                  ]}
                >
                  {t("mengupload")}
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="attach-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.attachmentButtonText,
                    { color: colors.primary },
                  ]}
                >
                  {t("tambahLampiran")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* SUB-TASKS */}
        {isEditMode && existingTask && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("subTugas")}
            </Text>
            <SubtaskList taskId={existingTask.id} />
          </>
        )}

        {/* PRIORITAS */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("prioritas")}
        </Text>
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
                  {t(p.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* KATEGORI */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("kategori")}
        </Text>
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
            {t(category.toLowerCase())}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* SIMPAN */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>
            {saving ? t("mengupload") : t("simpanTugas")}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={[
              styles.shareButton,
              { backgroundColor: colors.card, borderColor: colors.primary },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
            <Text style={[styles.shareButtonText, { color: colors.primary }]}>
              {t("bagikanTugas")}
            </Text>
          </TouchableOpacity>
        )}

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
              {t("hapusTugas")}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* PICKER MODALS */}
      <PickerModal
        visible={showCategoryModal}
        title={t("pilihKategori")}
        options={CATEGORIES.map((c) => ({
          label: t(c.labelKey),
          value: c.value,
          icon: c.icon,
        }))}
        onSelect={(value) => {
          setCategory(value);
          setShowCategoryModal(false);
        }}
        onClose={() => setShowCategoryModal(false)}
        colors={colors}
      />

      <PickerModal
        visible={showReminderModal}
        title={t("pilihWaktuPengingat")}
        options={REMINDER_OPTIONS.map((r) => ({
          label: t(r.labelKey),
          value: String(r.value),
          icon: "time-outline",
        }))}
        onSelect={(value) => {
          setReminderBefore(Number(value));
          setShowReminderModal(false);
        }}
        onClose={() => setShowReminderModal(false)}
        colors={colors}
      />

      <PickerModal
        visible={showRecurringModal}
        title={t("pilihPengulangan")}
        options={RECURRING_OPTIONS.map((r) => ({
          label: t(r.labelKey),
          value: r.value,
          icon: "repeat-outline",
        }))}
        onSelect={(value) => {
          setRecurring(value);
          setShowRecurringModal(false);
        }}
        onClose={() => setShowRecurringModal(false)}
        colors={colors}
      />

      <PickerModal
        visible={showAttachmentModal}
        title={t("tambahLampiran")}
        options={[
          { label: t("pilihGambar"), value: "image", icon: "image-outline" },
          {
            label: t("pilihDokumen"),
            value: "document",
            icon: "document-outline",
          },
        ]}
        onSelect={(value) => {
          setShowAttachmentModal(false);
          if (value === "image") handlePickImage();
          else if (value === "document") handlePickDocument();
        }}
        onClose={() => setShowAttachmentModal(false)}
        colors={colors}
      />

      {/* CONFIRM DIALOGS */}
      <ConfirmDialog
        visible={showConfirmDelete}
        title={t("hapusTugasTitle")}
        message={`"${existingTask?.title}" ${t("hapusTugasMessage")}`}
        type="danger"
        confirmText={t("hapus")}
        cancelText={t("batal")}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />

      <ConfirmDialog
        visible={showConfirmRemoveAttachment}
        title={t("hapusLampiranTitle")}
        message={t("hapusLampiranMessage")}
        type="warning"
        confirmText={t("hapus")}
        cancelText={t("batal")}
        onConfirm={confirmRemoveAttachment}
        onCancel={() => setShowConfirmRemoveAttachment(false)}
      />
    </View>
  );
}

// ============ PICKER MODAL ============
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
  options: { label: string; value: string; icon?: any }[];
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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
              key={option.value}
              style={[
                styles.modalOption,
                { borderBottomColor: colors.borderLight },
              ]}
              onPress={() => onSelect(option.value)}
            >
              {option.icon && (
                <Ionicons name={option.icon} size={20} color={colors.primary} />
              )}
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                {option.label}
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
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  attachmentButtonText: { fontSize: 14, fontWeight: "700" },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  attachmentImage: { width: 56, height: 56, borderRadius: 8 },
  fileIconBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: 13, fontWeight: "700" },
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
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    gap: 8,
  },
  shareButtonText: { fontSize: 15, fontWeight: "700" },
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
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalOptionText: { fontSize: 14, fontWeight: "600" },
  modalCancel: { marginTop: 12, paddingVertical: 14, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
});
