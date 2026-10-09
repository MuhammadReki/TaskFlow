import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { hapticLight, hapticSelection, hapticWarning } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ================== WARNA (buat icon aja) ==================
const GREEN_DARK = "#1B6B3A";
const GREEN_BG = "#EAF6EC";
const BLUE_BG = "#E8F0FE";
const BLUE = "#3B82F6";
const PURPLE_BG = "#F0EAFB";
const PURPLE = "#8B5CF6";
const RED = "#D9534F";
const RED_BG = "#FCE8E8";
const ORANGE_BG = "#FDF3E0";
const ORANGE = "#E8A83E";
const CYAN_BG = "#E5F7F8";
const CYAN = "#17A2B8";

export default function PengaturanScreen() {
  const { tasks, replaceAllTasks, resetAllTasks } = useTasks();
  const { isDark, colors, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { language, changeLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // ================== BACKUP DATA ==================
  const handleBackup = async () => {
    hapticLight();
    try {
      const json = JSON.stringify(tasks, null, 2);
      const file = new FileSystem.File(
        FileSystem.Paths.document,
        "taskflow-backup.json",
      );
      await file.write(json);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Simpan Backup TaskFlow",
        });
      } else {
        showToast(t("berhasil"), "success");
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // ================== RESTORE DATA ==================
  const handleRestore = async () => {
    hapticLight();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const file = new FileSystem.File(fileUri);
      const content = await file.text();
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed)) {
        showToast("Format file JSON tidak sesuai", "error");
        return;
      }

      await replaceAllTasks(parsed);
      showToast(t("berhasil"), "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // ================== RESET DATA ==================
  const handleReset = () => {
    hapticWarning();
    resetAllTasks();
    showToast(t("berhasil"), "info");
  };

  // ================== LIHAT ONBOARDING ==================
  const handleViewOnboarding = async () => {
    hapticLight();
    await AsyncStorage.removeItem("hasSeenOnboarding");
    router.push("/onboarding");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t("pengaturan")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t("kelolaPreferensi")}
      </Text>

      {/* TAMPILAN */}
      <SectionLabel text={t("tampilan")} colors={colors} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <SettingRow
          icon={isDark ? "moon" : "sunny-outline"}
          iconBg={colors.primaryBg}
          iconColor={colors.primary}
          title={t("darkMode")}
          subtitle={isDark ? t("aktif") : t("nonaktif")}
          colors={colors}
          right={
            <Switch
              value={isDark}
              onValueChange={() => {
                hapticSelection();
                toggleTheme();
              }}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor="#fff"
            />
          }
        />
        <Divider colors={colors} />
        <SettingRow
          icon="language-outline"
          iconBg={colors.infoBg}
          iconColor={colors.info}
          title={t("bahasa")}
          subtitle={language === "id" ? "🇮🇩 Indonesia" : "🇬🇧 English"}
          onPress={() => {
            hapticSelection();
            setShowLanguageModal(true);
          }}
          showArrow
          colors={colors}
        />
      </View>

      {/* DATA & BACKUP */}
      <SectionLabel text={t("dataBackup")} colors={colors} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <SettingRow
          icon="briefcase-outline"
          iconBg={GREEN_BG}
          iconColor={GREEN_DARK}
          title={t("backupData")}
          subtitle={t("backupSubtitle")}
          onPress={handleBackup}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="arrow-down-outline"
          iconBg={BLUE_BG}
          iconColor={BLUE}
          title={t("restoreData")}
          subtitle={t("restoreSubtitle")}
          onPress={handleRestore}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="information-circle-outline"
          iconBg={PURPLE_BG}
          iconColor={PURPLE}
          title={t("tentangBackup")}
          subtitle={t("tentangBackupSubtitle")}
          onPress={() => {
            hapticLight();
            showToast(
              language === "id"
                ? "Backup nyimpen data tugas ke file JSON. Bisa di-restore kapan aja."
                : "Backup saves task data to a JSON file. Can be restored anytime.",
              "info",
            );
          }}
          showArrow
          colors={colors}
        />
      </View>

      {/* KEAMANAN & DATA */}
      <SectionLabel text={t("keamananData")} colors={colors} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <SettingRow
          icon="trash-outline"
          iconBg={RED_BG}
          iconColor={RED}
          title={t("resetData")}
          subtitle={t("resetDataSubtitle")}
          onPress={handleReset}
          showArrow
          danger
          colors={colors}
        />
      </View>

      {/* LAINNYA */}
      <SectionLabel text={t("lainnya")} colors={colors} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <SettingRow
          icon="play-circle-outline"
          iconBg={colors.primaryBg}
          iconColor={colors.primary}
          title={t("lihatOnboarding")}
          subtitle={t("lihatOnboardingSubtitle")}
          onPress={handleViewOnboarding}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="notifications-outline"
          iconBg={ORANGE_BG}
          iconColor={ORANGE}
          title={t("notifikasi")}
          subtitle={t("notifikasiSubtitle")}
          onPress={() => {
            hapticLight();
            router.push("/notifikasi-settings");
          }}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="help-circle-outline"
          iconBg={CYAN_BG}
          iconColor={CYAN}
          title={t("bantuanFaq")}
          subtitle={t("bantuanFaqSubtitle")}
          onPress={() => {
            hapticLight();
            router.push("/bantuan-faq");
          }}
          showArrow
          colors={colors}
        />
      </View>

      {/* BANNER ONLINE */}
      <View
        style={[styles.onlineBanner, { backgroundColor: colors.primaryBg }]}
      >
        <Ionicons name="cloud-done" size={22} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.onlineTitle, { color: colors.primary }]}>
            {t("taskflowOnline")}
          </Text>
          <Text
            style={[styles.onlineSubtitle, { color: colors.textSecondary }]}
          >
            {t("taskflowOnlineSubtitle")}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* MODAL PILIH BAHASA */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("pilihBahasa")}
            </Text>

            <TouchableOpacity
              style={[
                styles.modalOption,
                { borderBottomColor: colors.borderLight },
              ]}
              onPress={() => {
                hapticSelection();
                changeLanguage("id");
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                🇮🇩 Indonesia
              </Text>
              {language === "id" && (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                { borderBottomColor: colors.borderLight },
              ]}
              onPress={() => {
                hapticSelection();
                changeLanguage("en");
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                🇬🇧 English
              </Text>
              {language === "en" && (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.danger }]}>
                {t("batal")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// ================== KOMPONEN KECIL ==================

function SectionLabel({ text, colors }: { text: string; colors: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
      {text}
    </Text>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
  );
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
  right,
  showArrow,
  danger,
  colors,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
  colors: any;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: danger ? RED : colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>
      {right}
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={danger ? RED : colors.textMuted}
        />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 37,
  },
  title: { fontSize: 26, fontWeight: "800", marginTop: 16 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextWrap: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 68 },
  onlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },
  onlineTitle: { fontSize: 13, fontWeight: "800" },
  onlineSubtitle: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  // Modal
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
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: { fontSize: 15, fontWeight: "600" },
  modalCancel: { marginTop: 12, paddingVertical: 14, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
});
