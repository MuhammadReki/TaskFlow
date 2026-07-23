import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ================== WARNA ==================
const GREEN_DARK = '#1B6B3A';
const GREEN = '#2E9E4F';
const GREEN_BG = '#EAF6EC';
const BG = '#F6FAF7';
const GRAY_BORDER = '#E5E7EB';
const GRAY_TEXT = '#9CA3AF';

// Isi FAQ — bebas kamu ubah/tambah sesuai kebutuhan app kamu
const FAQ_ITEMS = [
  {
    question: 'Apakah data saya aman kalau HP hilang?',
    answer:
      'Semua data TaskFlow tersimpan langsung di perangkat kamu, bukan di server. Karena itu, kami sangat menyarankan kamu rutin melakukan Backup Data (JSON) lewat menu Pengaturan supaya data bisa dipulihkan kalau ganti HP.',
  },
  {
    question: 'Bagaimana cara backup data tugas saya?',
    answer:
      'Buka Pengaturan → Data & Backup → Backup Data (JSON). File JSON berisi semua tugas kamu akan dibuat dan bisa langsung disimpan ke Google Drive, email, atau penyimpanan lain.',
  },
  {
    question: 'Bagaimana cara memulihkan data dari backup?',
    answer:
      'Buka Pengaturan → Data & Backup → Restore Data (JSON), lalu pilih file backup JSON yang sebelumnya kamu simpan. Data yang ada sekarang akan diganti dengan isi file backup.',
  },
  {
    question: 'Apakah TaskFlow butuh koneksi internet?',
    answer:
      'Tidak. TaskFlow dirancang 100% offline — semua fitur termasuk pengingat notifikasi berjalan langsung di perangkat kamu tanpa perlu internet.',
  },
  {
    question: 'Bagaimana cara menghapus semua data sekaligus?',
    answer:
      'Buka Pengaturan → Reset Semua Data. Perlu diingat, tindakan ini akan menghapus seluruh tugas secara permanen dan tidak bisa dibatalkan, jadi pastikan kamu sudah backup dulu kalau perlu.',
  },
  {
    question: 'Kenapa notifikasi pengingat tidak muncul?',
    answer:
      'Pastikan toggle "Pengingat Tugas" di Pengaturan → Notifikasi sudah aktif, dan izin notifikasi untuk TaskFlow sudah diaktifkan di pengaturan sistem HP kamu.',
  },
];

export default function BantuanFaqScreen() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan & FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Pertanyaan yang sering ditanyakan seputar TaskFlow.
        </Text>

        <View style={styles.card}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <View key={item.question}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleItem(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={GRAY_TEXT}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                )}
                {index < FAQ_ITEMS.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* ================= KONTAK ================= */}
        <Text style={styles.sectionLabel}>MASIH BUTUH BANTUAN?</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:mreki2023@gmail.com')}
          >
            <View style={styles.contactIconBox}>
              <Ionicons name="mail-outline" size={20} color={GREEN_DARK} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Hubungi Support</Text>
              <Text style={styles.rowSubtitle}>mreki2023@gmail.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={GRAY_TEXT} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
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
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#374151', // Diubah dari #6B7280 ke #374151 untuk kontras lebih baik
    lineHeight: 22, // Ditingkatkan dari 19 ke 22 untuk spasi antar baris lebih nyaman
    paddingBottom: 16,
    textAlign: 'justify', // INI YANG PALING PENTING - rata kiri kanan
    paddingHorizontal: 4, // Tambahan padding kecil agar lebih rapi
  },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  rowSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});