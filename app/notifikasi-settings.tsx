import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticSelection } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotifikasiSettingsScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [overdueAlert, setOverdueAlert] = useState(true);

  const isID = language === "id";

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            hapticLight();
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("notifikasi")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isID
            ? "Atur bagaimana dan kapan TaskFlow mengingatkan kamu tentang tugas."
            : "Set how and when TaskFlow reminds you about tasks."}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
          ]}
        >
          <Row
            icon="notifications-outline"
            iconBg={colors.primaryBg}
            iconColor={colors.primary}
            title={isID ? "Pengingat Tugas" : "Task Reminder"}
            subtitle={
              isID
                ? "Aktifkan notifikasi pengingat deadline"
                : "Enable deadline reminder notifications"
            }
            colors={colors}
            right={
              <Switch
                value={remindersEnabled}
                onValueChange={() => {
                  hapticSelection();
                  setRemindersEnabled(!remindersEnabled);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {isID ? "DETAIL NOTIFIKASI" : "NOTIFICATION DETAILS"}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
            !remindersEnabled && styles.cardDisabled,
          ]}
        >
          <Row
            icon="volume-high-outline"
            iconBg={colors.warningBg}
            iconColor={colors.warning}
            title={isID ? "Suara" : "Sound"}
            subtitle={
              isID
                ? "Mainkan suara saat notifikasi muncul"
                : "Play sound when notification appears"
            }
            colors={colors}
            right={
              <Switch
                value={soundEnabled}
                onValueChange={() => {
                  hapticSelection();
                  setSoundEnabled(!soundEnabled);
                }}
                disabled={!remindersEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Divider colors={colors} />
          <Row
            icon="phone-portrait-outline"
            iconBg={colors.infoBg}
            iconColor={colors.info}
            title={isID ? "Getar" : "Vibration"}
            subtitle={
              isID
                ? "Getarkan perangkat saat notifikasi muncul"
                : "Vibrate device when notification appears"
            }
            colors={colors}
            right={
              <Switch
                value={vibrationEnabled}
                onValueChange={() => {
                  hapticSelection();
                  setVibrationEnabled(!vibrationEnabled);
                }}
                disabled={!remindersEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {isID ? "JENIS NOTIFIKASI" : "NOTIFICATION TYPES"}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
            !remindersEnabled && styles.cardDisabled,
          ]}
        >
          <Row
            icon="alert-circle-outline"
            iconBg={colors.warningBg}
            iconColor={colors.warning}
            title={isID ? "Tugas Terlambat" : "Overdue Tasks"}
            subtitle={
              isID
                ? "Beri tahu saat tugas melewati deadline"
                : "Notify when task passes deadline"
            }
            colors={colors}
            right={
              <Switch
                value={overdueAlert}
                onValueChange={() => {
                  hapticSelection();
                  setOverdueAlert(!overdueAlert);
                }}
                disabled={!remindersEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Divider colors={colors} />
          <Row
            icon="today-outline"
            iconBg={colors.primaryBg}
            iconColor={colors.primary}
            title={isID ? "Ringkasan Harian" : "Daily Summary"}
            subtitle={
              isID
                ? "Kirim ringkasan tugas hari ini setiap pagi"
                : "Send today's task summary every morning"
            }
            colors={colors}
            right={
              <Switch
                value={dailySummary}
                onValueChange={() => {
                  hapticSelection();
                  setDailySummary(!dailySummary);
                }}
                disabled={!remindersEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <View style={styles.noteBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={[styles.noteText, { color: colors.textMuted }]}>
            {isID
              ? "Notifikasi diproses langsung di perangkat kamu (notifikasi lokal), jadi tetap jalan meski tidak ada koneksi internet."
              : "Notifications are processed directly on your device (local notifications), so they work even without internet."}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Row({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  right,
  colors,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>
      {right}
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  content: { flex: 1, paddingHorizontal: 20 },
  description: {
    fontSize: 13,
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 20,
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
  cardDisabled: { opacity: 0.5 },
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
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16 },
});
