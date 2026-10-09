import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BantuanFaqScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQ_ITEMS = [
    {
      question:
        language === "id"
          ? "Apakah data saya aman kalau HP hilang?"
          : "Is my data safe if I lose my phone?",
      answer:
        language === "id"
          ? "Aman! Data TaskFlow tersimpan di cloud (Supabase). Tinggal login dari HP baru, semua tugas langsung muncul lagi."
          : "Safe! TaskFlow data is stored in the cloud (Supabase). Just log in from a new phone, and all tasks will appear.",
    },
    {
      question:
        language === "id"
          ? "Bagaimana cara backup data tugas saya?"
          : "How do I backup my task data?",
      answer:
        language === "id"
          ? "Buka Pengaturan → Data & Backup → Backup Data (JSON). File JSON berisi semua tugas kamu akan dibuat dan bisa langsung disimpan."
          : "Go to Settings → Data & Backup → Backup Data (JSON). A JSON file containing all your tasks will be created and can be saved immediately.",
    },
    {
      question:
        language === "id"
          ? "Bagaimana cara memulihkan data dari backup?"
          : "How do I restore data from backup?",
      answer:
        language === "id"
          ? "Buka Pengaturan → Data & Backup → Restore Data (JSON), lalu pilih file backup JSON yang sebelumnya kamu simpan."
          : "Go to Settings → Data & Backup → Restore Data (JSON), then select the JSON backup file you saved earlier.",
    },
    {
      question:
        language === "id"
          ? "Apakah TaskFlow butuh koneksi internet?"
          : "Does TaskFlow need an internet connection?",
      answer:
        language === "id"
          ? "Ya, TaskFlow butuh internet karena data disimpan di cloud (Supabase). Tapi kamu bisa akses dari device manapun setelah login."
          : "Yes, TaskFlow needs internet because data is stored in the cloud (Supabase). But you can access it from any device after logging in.",
    },
    {
      question:
        language === "id"
          ? "Bagaimana cara menghapus semua data sekaligus?"
          : "How do I delete all data at once?",
      answer:
        language === "id"
          ? "Buka Pengaturan → Reset Semua Data. Tindakan ini akan menghapus seluruh tugas secara permanen."
          : "Go to Settings → Reset All Data. This action will permanently delete all tasks.",
    },
    {
      question:
        language === "id"
          ? "Kenapa notifikasi pengingat tidak muncul?"
          : "Why aren't reminder notifications showing up?",
      answer:
        language === "id"
          ? 'Pastikan toggle "Pengingat Tugas" di Pengaturan → Notifikasi sudah aktif, dan izin notifikasi untuk TaskFlow sudah diaktifkan.'
          : 'Make sure the "Task Reminder" toggle in Settings → Notifications is active, and notification permission for TaskFlow is enabled.',
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          {t("bantuanFaqTitle")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t("pertanyaanSering")}
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
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <View key={item.question}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => {
                    hapticLight();
                    toggleItem(index);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.faqQuestionText, { color: colors.text }]}
                  >
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <Text
                    style={[
                      styles.faqAnswerText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.answer}
                  </Text>
                )}
                {index < FAQ_ITEMS.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.borderLight },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t("masihButuhBantuan")}
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
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => {
              hapticLight();
              Linking.openURL("mailto:mreki2023@gmail.com");
            }}
          >
            <View
              style={[
                styles.contactIconBox,
                { backgroundColor: colors.primaryBg },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("hubungiSupport")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                mreki2023@gmail.com
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  description: { fontSize: 13, marginTop: 16, marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestionText: { flex: 1, fontSize: 14, fontWeight: "700" },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 22,
    paddingBottom: 16,
    textAlign: "justify",
    paddingHorizontal: 4,
  },
  divider: { height: 1 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
});
