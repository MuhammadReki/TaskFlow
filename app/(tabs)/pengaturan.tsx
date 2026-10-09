import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticSelection, hapticWarning } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  Alert,
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

  // ================== BACKUP DATA KE FILE JSON ==================
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
        Alert.alert("Backup berhasil", `File tersimpan di:\n${file.uri}`);
      }
    } catch (error: any) {
      Alert.alert("Gagal backup", error.message);
    }
  };

  // ================== RESTORE DATA DARI FILE JSON ==================
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
        Alert.alert("File tidak valid", "Format file JSON tidak sesuai.");
        return;
      }

      Alert.alert(
        "Restore Data",
        `Ditemukan ${parsed.length} tugas di file ini. Data yang ada sekarang akan diganti. Lanjutkan?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Restore",
            onPress: () => {
              replaceAllTasks(parsed);
              Alert.alert("Berhasil", "Data berhasil dipulihkan.");
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Gagal restore", error.message);
    }
  };

  // ================== RESET SEMUA DATA ==================
  const handleReset = () => {
    hapticWarning();
    Alert.alert(
      "Reset Semua Data",
      "Semua tugas dan pengaturan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: () => {
            resetAllTasks();
            Alert.alert("Selesai", "Semua data sudah dihapus.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}
      <Text style={[styles.title, { color: colors.text }]}>Pengaturan</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Kelola preferensi dan data aplikasi Anda
      </Text>

      {/* ================= TAMPILAN ================= */}
      <SectionLabel text="TAMPILAN" colors={colors} />
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
          title="Dark Mode"
          subtitle={isDark ? "Aktif" : "Nonaktif"}
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
      </View>

      {/* ================= DATA & BACKUP ================= */}
      <SectionLabel text="DATA & BACKUP" colors={colors} />
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
          title="Backup Data (JSON)"
          subtitle="Simpan data tugas ke file JSON"
          onPress={handleBackup}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="arrow-down-outline"
          iconBg={BLUE_BG}
          iconColor={BLUE}
          title="Restore Data (JSON)"
          subtitle="Pulihkan data dari file JSON"
          onPress={handleRestore}
          showArrow
          colors={colors}
        />
        <Divider colors={colors} />
        <SettingRow
          icon="information-circle-outline"
          iconBg={PURPLE_BG}
          iconColor={PURPLE}
          title="Tentang Backup"
          subtitle="Pelajari cara backup dan restore data"
          onPress={() => {
            hapticLight();
            Alert.alert(
              "Tentang Backup",
              "Backup akan menyimpan seluruh data tugas kamu ke file JSON yang bisa disimpan di HP atau cloud storage. File ini bisa dipakai lagi lewat menu Restore Data kalau suatu saat kamu ganti HP atau install ulang aplikasi.",
            );
          }}
          showArrow
          colors={colors}
        />
      </View>

      {/* ================= KEAMANAN & DATA ================= */}
      <SectionLabel text="KEAMANAN & DATA" colors={colors} />
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
          title="Reset Semua Data"
          subtitle="Hapus semua tugas dan pengaturan secara permanen"
          onPress={handleReset}
          showArrow
          danger
          colors={colors}
        />
      </View>

      {/* ================= LAINNYA ================= */}
      <SectionLabel text="LAINNYA" colors={colors} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <SettingRow
          icon="notifications-outline"
          iconBg={ORANGE_BG}
          iconColor={ORANGE}
          title="Notifikasi"
          subtitle="Kelola notifikasi pengingat tugas"
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
          title="Bantuan & FAQ"
          subtitle="Temukan jawaban dan panduan penggunaan"
          onPress={() => {
            hapticLight();
            router.push("/bantuan-faq");
          }}
          showArrow
          colors={colors}
        />
      </View>

      {/* ================= BANNER ONLINE ================= */}
      <View
        style={[styles.onlineBanner, { backgroundColor: colors.primaryBg }]}
      >
        <Ionicons name="cloud-done" size={22} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.onlineTitle, { color: colors.primary }]}>
            TaskFlow Online
          </Text>
          <Text
            style={[styles.onlineSubtitle, { color: colors.textSecondary }]}
          >
            Data tersimpan di cloud (Supabase). Bisa diakses dari mana aja.
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
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

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },

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
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },

  onlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },
  onlineTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  onlineSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
