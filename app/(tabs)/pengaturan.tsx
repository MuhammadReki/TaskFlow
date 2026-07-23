import { useTasks } from '@/context/TasksContext';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// ================== WARNA ==================
const GREEN_DARK = '#1B6B3A';
const GREEN = '#2E9E4F';
const GREEN_BG = '#EAF6EC';
const BLUE_BG = '#E8F0FE';
const BLUE = '#3B82F6';
const PURPLE_BG = '#F0EAFB';
const PURPLE = '#8B5CF6';
const RED = '#D9534F';
const RED_BG = '#FCE8E8';
const ORANGE_BG = '#FDF3E0';
const ORANGE = '#E8A83E';
const CYAN_BG = '#E5F7F8';
const CYAN = '#17A2B8';
const BG = '#F6FAF7';
const GRAY_TEXT = '#9CA3AF';

export default function PengaturanScreen() {
  const { tasks, replaceAllTasks, resetAllTasks } = useTasks();
  const [darkMode, setDarkMode] = useState(false);

  // ================== BACKUP DATA KE FILE JSON ==================
  const handleBackup = async () => {
    try {
      const json = JSON.stringify(tasks, null, 2);
      const fileUri = FileSystem.documentDirectory + 'taskflow-backup.json';
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan Backup TaskFlow',
        });
      } else {
        Alert.alert('Backup berhasil', `File tersimpan di:\n${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Gagal backup', error.message);
    }
  };

  // ================== RESTORE DATA DARI FILE JSON ==================
  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed)) {
        Alert.alert('File tidak valid', 'Format file JSON tidak sesuai.');
        return;
      }

      Alert.alert(
        'Restore Data',
        `Ditemukan ${parsed.length} tugas di file ini. Data yang ada sekarang akan diganti. Lanjutkan?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Restore',
            onPress: () => {
              replaceAllTasks(parsed);
              Alert.alert('Berhasil', 'Data berhasil dipulihkan.');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Gagal restore', error.message);
    }
  };

  // ================== RESET SEMUA DATA ==================
  const handleReset = () => {
    Alert.alert(
      'Reset Semua Data',
      'Semua tugas dan pengaturan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => {
            resetAllTasks();
            Alert.alert('Selesai', 'Semua data sudah dihapus.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= HEADER ================= */}
      <Text style={styles.title}>Pengaturan</Text>
      <Text style={styles.subtitle}>
        Kelola preferensi dan data aplikasi Anda
      </Text>


      {/* ================= DATA & BACKUP ================= */}
      <SectionLabel text="DATA & BACKUP" />
      <View style={styles.card}>
        <SettingRow
          icon="briefcase-outline"
          iconBg={GREEN_BG}
          iconColor={GREEN_DARK}
          title="Backup Data (JSON)"
          subtitle="Simpan data tugas ke file JSON"
          onPress={handleBackup}
          showArrow
        />
        <Divider />
        <SettingRow
          icon="arrow-down-outline"
          iconBg={BLUE_BG}
          iconColor={BLUE}
          title="Restore Data (JSON)"
          subtitle="Pulihkan data dari file JSON"
          onPress={handleRestore}
          showArrow
        />
        <Divider />
        <SettingRow
          icon="information-circle-outline"
          iconBg={PURPLE_BG}
          iconColor={PURPLE}
          title="Tentang Backup"
          subtitle="Pelajari cara backup dan restore data"
          onPress={() =>
            Alert.alert(
              'Tentang Backup',
              'Backup akan menyimpan seluruh data tugas kamu ke file JSON yang bisa disimpan di HP atau cloud storage. File ini bisa dipakai lagi lewat menu Restore Data kalau suatu saat kamu ganti HP atau install ulang aplikasi.'
            )
          }
          showArrow
        />
      </View>

      {/* ================= KEAMANAN & DATA ================= */}
      <SectionLabel text="KEAMANAN & DATA" />
      <View style={styles.card}>
        <SettingRow
          icon="trash-outline"
          iconBg={RED_BG}
          iconColor={RED}
          title="Reset Semua Data"
          subtitle="Hapus semua tugas dan pengaturan secara permanen"
          onPress={handleReset}
          showArrow
          danger
        />
      </View>

      {/* ================= LAINNYA ================= */}
      <SectionLabel text="LAINNYA" />
      <View style={styles.card}>
        <SettingRow
          icon="notifications-outline"
          iconBg={ORANGE_BG}
          iconColor={ORANGE}
          title="Notifikasi"
          subtitle="Kelola notifikasi pengingat tugas"
          onPress={() => router.push('/notifikasi-settings')}
          showArrow
        />
        <Divider />
        <SettingRow
          icon="help-circle-outline"
          iconBg={CYAN_BG}
          iconColor={CYAN}
          title="Bantuan & FAQ"
          subtitle="Temukan jawaban dan panduan penggunaan"
          onPress={() => router.push('/bantuan-faq')}
          showArrow
        />
      </View>

      {/* ================= BANNER OFFLINE ================= */}
      <View style={styles.offlineBanner}>
        <Ionicons name="shield-checkmark" size={22} color={GREEN_DARK} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.offlineTitle}>TaskFlow 100% Offline</Text>
          <Text style={styles.offlineSubtitle}>
            Semua data tersimpan di perangkat Anda. Tidak ada data yang
            dikirim ke server.
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ================== KOMPONEN KECIL ==================

function SectionLabel({ text }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
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
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, danger && { color: RED }]}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {right}
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={danger ? RED : GRAY_TEXT}
        />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 37,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginTop: 24,
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
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_BG,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: GREEN_DARK,
  },
  offlineSubtitle: {
    fontSize: 11,
    color: '#4B7A5A',
    marginTop: 2,
    lineHeight: 15,
  },
});

