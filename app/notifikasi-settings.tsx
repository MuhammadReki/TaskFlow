import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ================== WARNA ==================
const GREEN_DARK = '#1B6B3A';
const GREEN = '#2E9E4F';
const GREEN_BG = '#EAF6EC';
const ORANGE_BG = '#FDF3E0';
const ORANGE = '#E8A83E';
const BLUE_BG = '#E8F0FE';
const BLUE = '#3B82F6';
const BG = '#F6FAF7';
const GRAY_BORDER = '#E5E7EB';
const GRAY_TEXT = '#9CA3AF';

export default function NotifikasiSettingsScreen() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [overdueAlert, setOverdueAlert] = useState(true);

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Atur bagaimana dan kapan TaskFlow mengingatkan kamu tentang tugas.
        </Text>

        {/* ================= PENGINGAT UTAMA ================= */}
        <View style={styles.card}>
          <Row
            icon="notifications-outline"
            iconBg={GREEN_BG}
            iconColor={GREEN_DARK}
            title="Pengingat Tugas"
            subtitle="Aktifkan notifikasi pengingat deadline"
            right={
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* ================= DETAIL ================= */}
        <Text style={styles.sectionLabel}>DETAIL NOTIFIKASI</Text>
        <View
          style={[
            styles.card,
            !remindersEnabled && styles.cardDisabled,
          ]}
        >
          <Row
            icon="volume-high-outline"
            iconBg={ORANGE_BG}
            iconColor={ORANGE}
            title="Suara"
            subtitle="Mainkan suara saat notifikasi muncul"
            right={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                disabled={!remindersEnabled}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <Row
            icon="phone-portrait-outline"
            iconBg={BLUE_BG}
            iconColor={BLUE}
            title="Getar"
            subtitle="Getarkan perangkat saat notifikasi muncul"
            right={
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                disabled={!remindersEnabled}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* ================= JENIS NOTIFIKASI ================= */}
        <Text style={styles.sectionLabel}>JENIS NOTIFIKASI</Text>
        <View
          style={[
            styles.card,
            !remindersEnabled && styles.cardDisabled,
          ]}
        >
          <Row
            icon="alert-circle-outline"
            iconBg={ORANGE_BG}
            iconColor={ORANGE}
            title="Tugas Terlambat"
            subtitle="Beri tahu saat tugas melewati deadline"
            right={
              <Switch
                value={overdueAlert}
                onValueChange={setOverdueAlert}
                disabled={!remindersEnabled}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <Row
            icon="today-outline"
            iconBg={GREEN_BG}
            iconColor={GREEN_DARK}
            title="Ringkasan Harian"
            subtitle="Kirim ringkasan tugas hari ini setiap pagi"
            right={
              <Switch
                value={dailySummary}
                onValueChange={setDailySummary}
                disabled={!remindersEnabled}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={16} color={GRAY_TEXT} />
          <Text style={styles.noteText}>
            Notifikasi diproses langsung di perangkat kamu (notifikasi
            lokal), jadi tetap jalan meski tidak ada koneksi internet.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Row({ icon, iconBg, iconColor, title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  content: { flex: 1, backgroundColor: BG, paddingHorizontal: 20 },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  cardDisabled: { opacity: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  rowSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: GRAY_TEXT,
    lineHeight: 16,
  },
});

