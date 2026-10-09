import AnimatedTaskCard from "@/components/AnimatedTaskCard";
import SearchModal from "@/components/SearchModal";
import { TaskSkeleton } from "@/components/Skeleton";
import SortModal, { SortOption } from "@/components/SortModal";
import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticMedium, hapticSelection } from "@/lib/haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  RefreshControl,
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

const FILTERS = [
  { key: "Semua", label: "semua" },
  { key: "Hari Ini", label: "hariIni" },
  { key: "Mendatang", label: "mendatang" },
  { key: "Selesai", label: "selesai" },
];

const PRIORITY_FILTERS = [
  { key: "Semua", labelKey: "semua" },
  { key: "Tinggi", labelKey: "tinggi" },
  { key: "Sedang", labelKey: "sedang" },
  { key: "Rendah", labelKey: "rendah" },
];

const PRIORITY_WEIGHT: Record<string, number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

export default function HomeScreen() {
  const { tasks, toggleTask, loadTasks, loading } = useTasks();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activePriority, setActivePriority] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [showSort, setShowSort] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const SORT_LABEL: Record<SortOption, string> = {
    terbaru: t("terbaru"),
    terlama: t("terlama"),
    prioritas: t("prioritas"),
    deadline: t("deadline"),
    az: t("az"),
    za: t("za"),
  };

  const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
    Tinggi: { bg: colors.dangerBg, text: colors.danger },
    Sedang: { bg: colors.warningBg, text: colors.warning },
    Rendah: { bg: colors.primaryBg, text: colors.primary },
  };

  const filteredTasks = useMemo(() => {
    let result: Task[] = tasks;

    switch (activeFilter) {
      case "Selesai":
        result = result.filter((t: Task) => t.completed);
        break;
      case "Hari Ini":
        result = result.filter(
          (t: Task) => t.dateLabel === "Hari ini" && !t.completed,
        );
        break;
      case "Mendatang":
        result = result.filter(
          (t: Task) => t.dateLabel !== "Hari ini" && !t.completed,
        );
        break;
      default:
        break;
    }

    if (activePriority !== "Semua") {
      result = result.filter((t: Task) => t.priority === activePriority);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t: Task) =>
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
          (a: Task, b: Task) =>
            (PRIORITY_WEIGHT[b.priority || "Rendah"] || 0) -
            (PRIORITY_WEIGHT[a.priority || "Rendah"] || 0),
        );
        break;
      case "deadline":
        sorted.sort((a: Task, b: Task) => {
          if (!a.deadlineDate) return 1;
          if (!b.deadlineDate) return -1;
          return (
            new Date(a.deadlineDate).getTime() -
            new Date(b.deadlineDate).getTime()
          );
        });
        break;
      case "az":
        sorted.sort((a: Task, b: Task) =>
          (a.title || "").localeCompare(b.title || ""),
        );
        break;
      case "za":
        sorted.sort((a: Task, b: Task) =>
          (b.title || "").localeCompare(a.title || ""),
        );
        break;
    }

    return sorted;
  }, [tasks, activeFilter, activePriority, searchQuery, sortBy]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: Task) => t.completed).length;
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
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
            onPress={() => {
              hapticLight();
              router.push("/kalender");
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
          </TouchableOpacity>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
              {t("progressHariIni")}
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
              {doneTasks} / {totalTasks} {t("tugasSelesai")}
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
                {t("lihatStatistik")}
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
              {t("hasilUntuk")}: "{searchQuery}"
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
            const active = filter.key === activeFilter;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  hapticSelection();
                  setActiveFilter(filter.key);
                }}
              >
                {filter.key === "Semua" && (
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
                  {t(filter.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.priorityFilterHeader}>
          <Text
            style={[styles.priorityFilterLabel, { color: colors.textMuted }]}
          >
            {t("prioritas")}
          </Text>
          {hasActiveFilter && (
            <TouchableOpacity onPress={handleResetFilter}>
              <Text style={[styles.resetFilterText, { color: colors.primary }]}>
                {t("reset")}
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
                  {t(p.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery
                ? t("hasilPencarian")
                : activePriority !== "Semua"
                  ? `${t("prioritas")} ${t(activePriority.toLowerCase())}`
                  : t("daftarTugas")}
            </Text>
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>
              {filteredTasks.length} {t("tugas")} · {SORT_LABEL[sortBy]}
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
              {t("urutkan")}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: colors.primaryBg },
              ]}
            >
              <Ionicons
                name={
                  searchQuery
                    ? "search-outline"
                    : activePriority !== "Semua"
                      ? "flag-outline"
                      : "checkmark-done-circle-outline"
                }
                size={56}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {searchQuery
                ? t("gakAdaHasil")
                : activePriority !== "Semua"
                  ? `${t("prioritas")} ${t(activePriority.toLowerCase())}`
                  : t("belumAdaTugas")}
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}
            >
              {searchQuery
                ? t("cobaKataKunciLain")
                : activePriority !== "Semua"
                  ? t("cobaPilihPrioritasLain")
                  : t("yukMulaiProduktif")}
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
                <Text style={styles.resetButtonText}>{t("resetFilter")}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredTasks.map((task: Task, index: number) => {
            const priorityStyle =
              PRIORITY_STYLE[task.priority || "Rendah"] ||
              PRIORITY_STYLE.Rendah;

            return (
              <AnimatedTaskCard
                key={task.id}
                task={task}
                index={index}
                priorityStyle={priorityStyle}
                onPress={() => {
                  hapticLight();
                  router.push(`/tambah-tugas?id=${task.id}`);
                }}
                onToggle={() => {
                  hapticLight();
                  toggleTask(task.id);
                }}
              />
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB — dengan zIndex biar gak ketutup */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            zIndex: 999,
            elevation: 999,
          },
        ]}
        onPress={() => {
          hapticMedium();
          router.push("/tambah-tugas");
        }}
        activeOpacity={0.7}
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
  headerIcons: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
