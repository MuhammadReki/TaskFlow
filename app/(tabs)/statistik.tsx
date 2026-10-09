import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticSelection } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Rect } from "react-native-svg";

const PERIODS = ["7 Hari Terakhir", "30 Hari Terakhir", "Semua Waktu"];

export default function StatistikScreen() {
  const { tasks } = useTasks();
  const { colors } = useTheme();
  const [activePeriod, setActivePeriod] = useState(PERIODS[0]);

  // ================== HITUNG DATA DARI TASKS ==================
  const stats = useMemo(() => {
    const total = tasks.length;
    const selesai = tasks.filter((t) => t.completed).length;
    const belumSelesai = total - selesai;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tugasHariIni = tasks.filter((t) => {
      if (!t.deadlineDate || t.completed) return false;
      const d = new Date(t.deadlineDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const chartData: {
      label: string;
      selesai: number;
      belumSelesai: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;

      const taskHariItu = tasks.filter((t) => {
        if (!t.date) return false;
        return t.date === label;
      });

      chartData.push({
        label,
        selesai: taskHariItu.filter((t) => t.completed).length,
        belumSelesai: taskHariItu.filter((t) => !t.completed).length,
      });
    }

    const priorityData = [
      {
        label: "Tinggi",
        count: tasks.filter((t) => t.priority === "Tinggi").length,
        color: colors.danger,
      },
      {
        label: "Sedang",
        count: tasks.filter((t) => t.priority === "Sedang").length,
        color: colors.warning,
      },
      {
        label: "Rendah",
        count: tasks.filter((t) => t.priority === "Rendah").length,
        color: colors.primary,
      },
    ];
    const totalPriority = priorityData.reduce((s, p) => s + p.count, 0);
    const priorityWithPercent = priorityData.map((p) => ({
      ...p,
      percent:
        totalPriority === 0 ? 0 : Math.round((p.count / totalPriority) * 100),
    }));

    const productivityPercent =
      total === 0 ? null : Math.min(99, Math.round((selesai / total) * 100));

    return {
      summary: { totalTugas: total, selesai, belumSelesai, tugasHariIni },
      chartData,
      priorityData: priorityWithPercent,
      productivityPercent,
    };
  }, [tasks, colors]);

  const maxBarValue = useMemo(() => {
    const max = Math.max(
      1,
      ...stats.chartData.map((d) => (d.selesai || 0) + (d.belumSelesai || 0)),
    );
    return Math.ceil(max / 5) * 5;
  }, [stats.chartData]);

  const totalPriority = stats.priorityData.reduce(
    (sum, p) => sum + (p.count || 0),
    0,
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Statistik
        </Text>
        <View
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.text} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodRow}
        contentContainerStyle={[
          styles.periodRowContent,
          { backgroundColor: colors.cardAlt },
        ]}
      >
        {PERIODS.map((period) => {
          const active = period === activePeriod;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                active && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                hapticSelection();
                setActivePeriod(period);
              }}
            >
              <Text
                style={[
                  styles.periodChipText,
                  { color: active ? "#fff" : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ringkasan
      </Text>
      <View style={styles.summaryGrid}>
        <SummaryCard
          icon="clipboard-outline"
          iconBg={colors.primaryBg}
          iconColor={colors.primary}
          value={stats.summary.totalTugas}
          label="Total Tugas"
          colors={colors}
        />
        <SummaryCard
          icon="checkmark-circle-outline"
          iconBg={colors.primaryBg}
          iconColor={colors.primary}
          value={stats.summary.selesai}
          label="Selesai"
          colors={colors}
        />
        <SummaryCard
          icon="time-outline"
          iconBg={colors.warningBg}
          iconColor={colors.warning}
          value={stats.summary.belumSelesai}
          label="Belum Selesai"
          colors={colors}
        />
        <SummaryCard
          icon="calendar-outline"
          iconBg={colors.infoBg}
          iconColor={colors.info}
          value={stats.summary.tugasHariIni}
          label="Tugas Hari Ini"
          colors={colors}
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <View style={styles.chartHeaderRow}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Tugas Selesai vs Belum Selesai
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              ({activePeriod})
            </Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Selesai
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Belum Selesai
            </Text>
          </View>
        </View>

        {stats.chartData.length === 0 ? (
          <EmptyChart text="Belum ada data untuk ditampilkan" colors={colors} />
        ) : (
          <BarChart
            data={stats.chartData}
            maxValue={maxBarValue}
            colors={colors}
          />
        )}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Distribusi Prioritas
        </Text>

        {stats.priorityData.length === 0 || totalPriority === 0 ? (
          <EmptyChart text="Belum ada data prioritas" colors={colors} />
        ) : (
          <View style={styles.donutRow}>
            <DonutChart
              data={stats.priorityData}
              total={totalPriority}
              bgColor={colors.card}
            />
            <View style={styles.donutLegend}>
              {stats.priorityData.map((p) => (
                <View key={p.label} style={styles.donutLegendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: p.color }]}
                  />
                  <View style={{ marginLeft: 8 }}>
                    <Text
                      style={[styles.donutLegendLabel, { color: colors.text }]}
                    >
                      {p.label}
                    </Text>
                    <Text
                      style={[
                        styles.donutLegendCount,
                        { color: colors.textMuted },
                      ]}
                    >
                      {p.count} tugas
                    </Text>
                  </View>
                  <Text
                    style={[styles.donutLegendPercent, { color: colors.text }]}
                  >
                    {p.percent}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View
        style={[styles.productivityCard, { backgroundColor: colors.primaryBg }]}
      >
        <Text style={styles.productivityEmoji}>🏆</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.productivityText, { color: colors.text }]}>
            {stats.productivityPercent === null ? (
              "Selesaikan tugas biar keliatan performamu di sini"
            ) : (
              <>
                Kamu udah selesaiin{" "}
                <Text
                  style={[
                    styles.productivityPercent,
                    { color: colors.primary },
                  ]}
                >
                  {stats.productivityPercent}%
                </Text>{" "}
                tugas kamu!
              </>
            )}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ================== KOMPONEN KECIL ==================

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  colors,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: colors.card, shadowOpacity: colors.shadowOpacity },
      ]}
    >
      <View style={[styles.summaryIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.summaryValue, { color: colors.text }]}>
        {value ?? 0}
      </Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function EmptyChart({ text, colors }: { text: string; colors: any }) {
  return (
    <View style={styles.emptyChart}>
      <Ionicons name="bar-chart-outline" size={36} color={colors.textMuted} />
      <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
        {text}
      </Text>
    </View>
  );
}

function BarChart({
  data,
  maxValue,
  colors,
}: {
  data: any[];
  maxValue: number;
  colors: any;
}) {
  const chartHeight = 180;
  const barWidth = 22;
  const gap = 18;
  const svgWidth = data.length * (barWidth + gap);

  return (
    <View>
      <Svg width={svgWidth} height={chartHeight + 24}>
        {data.map((item, index) => {
          const selesai = item.selesai || 0;
          const belumSelesai = item.belumSelesai || 0;
          const x = index * (barWidth + gap);

          const selesaiHeight = (selesai / maxValue) * chartHeight;
          const belumHeight = (belumSelesai / maxValue) * chartHeight;

          return (
            <G key={item.label || index}>
              <Rect
                x={x}
                y={chartHeight - selesaiHeight - belumHeight}
                width={barWidth}
                height={belumHeight}
                rx={4}
                fill={colors.border}
              />
              <Rect
                x={x}
                y={chartHeight - selesaiHeight}
                width={barWidth}
                height={selesaiHeight}
                rx={4}
                fill={colors.primary}
              />
            </G>
          );
        })}
      </Svg>

      <View style={[styles.barLabelsRow, { width: svgWidth }]}>
        {data.map((item, index) => (
          <Text
            key={item.label || index}
            style={[
              styles.barLabel,
              { width: barWidth + gap, color: colors.textMuted },
            ]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function DonutChart({
  data,
  total,
  bgColor,
}: {
  data: any[];
  total: number;
  bgColor: string;
}) {
  const size = 140;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} originX={size / 2} originY={size / 2}>
        {data.map((item) => {
          const percent = (item.count || 0) / total;
          const strokeDasharray = `${circumference * percent} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <Circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
            />
          );
        })}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2 - 2}
          fill={bgColor}
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  periodRow: { marginTop: 12, flexGrow: 0 },
  periodRowContent: { borderRadius: 14, padding: 4, gap: 6 },
  periodChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  periodChipText: { fontSize: 12, fontWeight: "600" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 12,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 2 },

  card: {
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  cardSubtitle: { fontSize: 12, marginTop: 2 },

  legendRow: { flexDirection: "row", gap: 16, marginTop: 14, marginBottom: 6 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12 },

  barLabelsRow: { flexDirection: "row", marginTop: 4 },
  barLabel: { fontSize: 10, textAlign: "center" },

  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 20,
  },
  donutLegend: { flex: 1 },
  donutLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  donutLegendLabel: { fontSize: 13, fontWeight: "700" },
  donutLegendCount: { fontSize: 11, marginTop: 1 },
  donutLegendPercent: { marginLeft: "auto", fontSize: 14, fontWeight: "800" },

  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyChartText: { fontSize: 12, marginTop: 8 },

  productivityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
  },
  productivityEmoji: { fontSize: 24 },
  productivityText: { fontSize: 13, lineHeight: 18 },
  productivityPercent: { fontWeight: "800" },
});
