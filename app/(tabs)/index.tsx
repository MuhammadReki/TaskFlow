import { useTasks } from '@/context/TasksContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ================== WARNA (samain sama SplashScreen) ==================
const GREEN_DARK = '#1B6B3A';
const GREEN = '#2E9E4F';
const GREEN_LIGHT = '#7ED08B';
const GREEN_BG = '#EAF6EC';
const BG = '#F6FAF7';
const RED_BG = '#FCE8E8';
const RED_TEXT = '#D9534F';
const ORANGE_BG = '#FDF3E0';
const ORANGE_TEXT = '#C98A1E';

// ================== FILTER OPTIONS ==================
const FILTERS = ['Semua', 'Hari Ini', 'Mendatang', 'Selesai'];

// Warna badge prioritas — sesuaikan kalau prioritas kamu pake nama lain
const PRIORITY_STYLE = {
  Tinggi: { bg: RED_BG, text: RED_TEXT },
  Sedang: { bg: ORANGE_BG, text: ORANGE_TEXT },
  Rendah: { bg: GREEN_BG, text: GREEN_DARK },
};

/**
 * HomeScreen
 *
 * Kirim data tugas kamu lewat prop `tasks`, contoh bentuk 1 item:
 * {
 *   id: '1',
 *   title: 'Belajar React Native',
 *   date: '18 Juli 2026',
 *   dateLabel: 'Hari ini',
 *   priority: 'Tinggi',       // 'Tinggi' | 'Sedang' | 'Rendah'
 *   icon: 'book',             // nama icon Ionicons, bebas kamu ganti
 *   completed: false,
 * }
 *
 * Kalau belum ada data sama sekali, tinggal jangan kirim prop tasks
 * (defaultnya array kosong) — nanti otomatis muncul tampilan "belum ada tugas".
 */
export default function HomeScreen({
  onPressSearch,
  onPressSettings,
  onPressStatistik,
  onPressAddTask,
  onPressTask,
}) {
  // Ambil tasks dan toggleTask dari context
  const { tasks, toggleTask } = useTasks();
  const [activeFilter, setActiveFilter] = useState('Semua');

  // Filter task sesuai tab yang dipilih
  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'Selesai':
        return tasks.filter((t) => t.completed);
      case 'Hari Ini':
        return tasks.filter((t) => t.dateLabel === 'Hari ini' && !t.completed);
      case 'Mendatang':
        return tasks.filter((t) => t.dateLabel !== 'Hari ini' && !t.completed);
      default:
        return tasks;
    }
  }, [tasks, activeFilter]);

  // Hitung progress otomatis dari data yang kamu kirim
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Task<Text style={styles.headerTitleAccent}>Flow</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
              onPress={() => alert('Fitur pencarian segera hadir bro 🔍')}>
            <Ionicons name="search" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.iconButton}
                onPress={() => router.push('/(tabs)/pengaturan')}>
            <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= PROGRESS CARD ================= */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Progress Hari Ini</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          <View style={styles.progressFooterRow}>
            <Text style={styles.progressSubtext}>
              {doneTasks} dari {totalTasks} tugas selesai
            </Text>
            <TouchableOpacity
  style={styles.statsButton}
  onPress={() => router.push('/(tabs)/statistik')}
>
              <MaterialCommunityIcons
                name="chart-line"
                size={14}
                color={GREEN_DARK}
              />
              <Text style={styles.statsButtonText}>Lihat Statistik</Text>
              <Ionicons name="chevron-forward" size={14} color={GREEN_DARK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= FILTER CHIPS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTERS.map((filter) => {
            const active = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                {filter === 'Semua' && (
                  <Ionicons
                    name="menu"
                    size={14}
                    color={active ? '#fff' : '#6B7280'}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= SECTION TITLE ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Tugas Hari Ini</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>Urutkan</Text>
            <Ionicons name="chevron-down" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* ================= TASK LIST ================= */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={48}
              color={GREEN_LIGHT}
            />
            <Text style={styles.emptyStateTitle}>Belum ada tugas</Text>
            <Text style={styles.emptyStateSubtitle}>
              Tambahkan tugas baru dengan tombol + di bawah
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const priorityStyle =
              PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.Rendah;

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                activeOpacity={0.8}
                onPress={() => onPressTask && onPressTask(task)}
              >
                <TouchableOpacity
                  style={[
                    styles.taskCheckbox,
                    task.completed && styles.taskCheckboxChecked,
                  ]}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleDone,
                    ]}
                  >
                    {task.title}
                  </Text>

                  <View style={styles.taskDateRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color="#9CA3AF"
                    />
                    <Text style={styles.taskDateText}>
                      {task.date} {task.dateLabel ? `• ${task.dateLabel}` : ''}
                    </Text>
                  </View>

                  {task.priority ? (
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: priorityStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: priorityStyle.text },
                        ]}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.taskIconBox}>
                  <Ionicons
                    name={task.icon || 'document-text-outline'}
                    size={18}
                    color={GREEN}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ================= FLOATING ADD BUTTON ================= */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/tambah-tugas')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerTitleAccent: {
    color: GREEN,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_BG,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  statsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN_DARK,
    marginHorizontal: 4,
  },

  filterRow: {
    marginTop: 18,
    flexGrow: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: GREEN_DARK,
    borderColor: GREEN_DARK,
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 4,
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskCheckboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  taskDateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN_DARK,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
});