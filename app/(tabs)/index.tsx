import SearchModal from "@/components/SearchModal";
import SortModal, { SortOption } from "@/components/SortModal";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticMedium, hapticSelection } from "@/lib/haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Task = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  dateLabel?: string;
  priority?: string;
  category?: string;
  icon?: string;
  completed: boolean;
  deadlineDate?: string;
};

const FILTERS = ["Semua", "Hari Ini", "Mendatang", "Selesai"];

const PRIORITY_FILTERS = [
  { key: "Semua", label: "Semua" },
  { key: "Tinggi", label: "Tinggi" },
  { key: "Sedang", label: "Sedang" },
  { key: "Rendah", label: "Rendah" },
];

const PRIORITY_WEIGHT: Record<string, number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

const SORT_LABEL: Record<SortOption, string> = {
  terbaru: "Terbaru",
  terlama: "Terlama",
  prioritas: "Prioritas",
  deadline: "Deadline",
  az: "A-Z",
  za: "Z-A",
};

export default function HomeScreen() {
  const { tasks, toggleTask } = useTasks();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activePriority, setActivePriority] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [showSort, setShowSort] = useState(false);

  const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
    Tinggi: { bg: colors.dangerBg, text: colors.danger },
    Sedang: { bg: colors.warningBg, text: colors.warning },
    Rendah: { bg: colors.primaryBg, text: colors.primary },
  };

  const filteredTasks = useMemo(() => {
    let result: Task[] = tasks;

    switch (activeFilter) {
      case "Selesai":
        result = result.filter((t) => t.completed);
        break;
      case "Hari Ini":
        result = result.filter(
          (t) => t.dateLabel === "Hari ini" && !t.completed,
        );
        break;
      case "Mendatang":
        result = result.filter(
          (t) => t.dateLabel !== "Hari ini" && !t.completed,
        );
        break;
      default:
        break;
    }

    if (activePriority !== "Semua") {
      result = result.filter((t) => t.priority === activePriority);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sortBy) {
      case "terbaru":
        break;
      case "terlama":
        sorted.reverse();
        break;
      case "prioritas":
        sorted.sort(
          (a, b) =>
            (PRIORITY_WEIGHT[b.priority || "Rendah"] || 0) -
            (PRIORITY_WEIGHT[a.priority || "Rendah"] || 0),
        );
        break;
      case "deadline":
        sorted.sort((a, b) => {
          if (!a.deadlineDate) return 1;
          if (!b.deadlineDate) return -1;
          return (
            new Date(a.deadlineDate).getTime() -
            new Date(b.deadlineDate).getTime()
          );
        });
        break;
      case "az":
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "za":
        sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
    }

    return sorted;
  }, [tasks, activeFilter, activePriority, searchQuery, sortBy]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const handleOpenSearch = () => {
    hapticLight();
    setShowSearch(true);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const hasActiveFilter =
    activeFilter !== "Semua" ||
    activePriority !== "Semua" ||
    searchQuery.length > 0;

  const handleResetFilter = () => {
    hapticMedium();
    setActiveFilter("Semua");
    setActivePriority("Semua");
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Task<Text style={{ color: colors.primary }}>Flow</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                shadowOpacity: colors.shadowOpacity,
              },
            ]}
            onPress={handleOpenSearch}
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                shadowOpacity: colors.shadowOpacity,
              },
            ]}
            onPress={() => {
              hapticLight();
              router.push("/(tabs)/pengaturan");
            }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
          ]}
        >
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>
              Progress Hari Ini
            </Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooterRow}>
            <Text
              style={[styles.progressSubtext, { color: colors.textSecondary }]}
            >
              {doneTasks} dari {totalTasks} tugas selesai
            </Text>
            <TouchableOpacity
              style={[
                styles.statsButton,
                { backgroundColor: colors.primaryBg },
              ]}
              onPress={() => {
                hapticLight();
                router.push("/(tabs)/statistik");
              }}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.statsButtonText, { color: colors.primary }]}>
                Lihat Statistik
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {searchQuery.length > 0 && (
          <View
            style={[styles.searchBanner, { backgroundColor: colors.primaryBg }]}
          >
            <Ionicons name="search" size={16} color={colors.primary} />
            <Text
              style={[styles.searchBannerText, { color: colors.primary }]}
              numberOfLines={1}
            >
              Hasil untuk: "{searchQuery}"
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {FILTERS.map((filter) => {
            const active = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  hapticSelection();
                  setActiveFilter(filter);
                }}
              >
                {filter === "Semua" && (
                  <Ionicons
                    name="menu"
                    size={14}
                    color={active ? "#fff" : colors.textSecondary}
                    style={styles.filterIcon}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.priorityFilterHeader}>
          <Text
            style={[styles.priorityFilterLabel, { color: colors.textMuted }]}
          >
            Prioritas
          </Text>
          {hasActiveFilter && (
            <TouchableOpacity onPress={handleResetFilter}>
              <Text style={[styles.resetFilterText, { color: colors.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.priorityFilterRow}>
          {PRIORITY_FILTERS.map((p) => {
            const active = p.key === activePriority;
            const style = PRIORITY_STYLE[p.key] || {
              bg: colors.cardAlt,
              text: colors.textSecondary,
            };
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityChip,
                  { backgroundColor: active ? style.text : style.bg },
                  active && styles.priorityChipActive,
                ]}
                onPress={() => {
                  hapticSelection();
                  setActivePriority(p.key);
                }}
              >
                {p.key !== "Semua" && (
                  <Ionicons
                    name="flag"
                    size={12}
                    color={active ? "#fff" : style.text}
                    style={styles.priorityIcon}
                  />
                )}
                <Text
                  style={[
                    styles.priorityChipText,
                    { color: active ? "#fff" : style.text },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery
                ? "Hasil Pencarian"
                : activePriority !== "Semua"
                  ? `Prioritas ${activePriority}`
                  : "Daftar Tugas"}
            </Text>
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>
              {filteredTasks.length} tugas · {SORT_LABEL[sortBy]}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.primaryBg }]}
            onPress={() => {
              hapticLight();
              setShowSort(true);
            }}
          >
            <Ionicons name="swap-vertical" size={14} color={colors.primary} />
            <Text style={[styles.sortButtonText, { color: colors.primary }]}>
              Urutkan
            </Text>
          </TouchableOpacity>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                searchQuery ? "search-outline" : "checkmark-done-circle-outline"
              }
              size={48}
              color={colors.primaryAccent}
            />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {searchQuery
                ? "Gak ada hasil"
                : activePriority !== "Semua"
                  ? `Gak ada tugas prioritas ${activePriority}`
                  : "Belum ada tugas"}
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}
            >
              {searchQuery
                ? `Gak ada tugas yang cocok dengan "${searchQuery}"`
                : activePriority !== "Semua"
                  ? "Coba pilih prioritas lain atau reset filter"
                  : "Tambahkan tugas baru dengan tombol + di bawah"}
            </Text>
            {hasActiveFilter && (
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleResetFilter}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.resetButtonText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredTasks.map((task) => {
            const priorityStyle =
              PRIORITY_STYLE[task.priority || "Rendah"] ||
              PRIORITY_STYLE.Rendah;

            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: colors.card,
                    shadowOpacity: colors.shadowOpacity,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  hapticLight();
                  router.push(`/tambah-tugas?id=${task.id}`);
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.taskCheckbox,
                    { borderColor: colors.border },
                    task.completed && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    toggleTask(task.id);
                  }}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: colors.text },
                      task.completed && {
                        textDecorationLine: "line-through",
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    {task.title}
                  </Text>

                  <View style={styles.taskDateRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={colors.textMuted}
                    />
                    <Text
                      style={[styles.taskDateText, { color: colors.textMuted }]}
                    >
                      {task.date} {task.dateLabel ? `• ${task.dateLabel}` : ""}
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

                <View
                  style={[
                    styles.taskIconBox,
                    { backgroundColor: colors.primaryBg },
                  ]}
                >
                  <Ionicons
                    name={(task.icon as any) || "document-text-outline"}
                    size={18}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => {
          hapticMedium();
          router.push("/tambah-tugas");
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <SearchModal
        visible={showSearch}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClose={handleCloseSearch}
        resultCount={filteredTasks.length}
      />

      <SortModal
        visible={showSort}
        current={sortBy}
        onSelect={setSortBy}
        onClose={() => setShowSort(false)}
      />
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
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: { paddingHorizontal: 20 },
  progressCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: 15, fontWeight: "600" },
  progressPercent: { fontSize: 20, fontWeight: "800" },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  progressSubtext: { fontSize: 12 },
  statsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  statsButtonText: { fontSize: 12, fontWeight: "600", marginHorizontal: 4 },
  searchBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    gap: 8,
  },
  searchBannerText: { flex: 1, fontSize: 13, fontWeight: "600" },
  filterRow: { marginTop: 18, flexGrow: 0 },
  filterRowContent: { gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  filterIcon: { marginRight: 4 },
  priorityFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  priorityFilterLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  resetFilterText: { fontSize: 12, fontWeight: "700" },
  priorityFilterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  priorityChipActive: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  priorityChipText: { fontSize: 12, fontWeight: "700" },
  priorityIcon: { marginRight: 2 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  resultCount: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  sortButtonText: { fontSize: 12, fontWeight: "700" },
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700" },
  taskDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  taskDateText: { fontSize: 12, marginLeft: 4 },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  priorityText: { fontSize: 11, fontWeight: "700" },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: { fontSize: 18, fontWeight: "700", marginTop: 12 },
  emptyStateSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
  },
  resetButtonText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  bottomSpacer: { height: 100 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
});
