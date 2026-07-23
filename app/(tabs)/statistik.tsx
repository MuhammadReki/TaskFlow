import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';

// ================== WARNA ==================
const GREEN_DARK = '#1B6B3A';
const GREEN = '#2E9E4F';
const GREEN_LIGHT = '#DCEFDF';
const BG = '#F6FAF7';
const ORANGE = '#E8A83E';
const ORANGE_BG = '#FDF3E0';
const BLUE = '#3B82F6';
const BLUE_BG = '#E8F0FE';
const RED = '#D9534F';
const GRAY_BAR = '#D9DCE1';

const PERIODS = ['7 Hari Terakhir', '30 Hari Terakhir', 'Semua Waktu'];

/**
 * StatistikScreen
 *
 * Semua data dikirim lewat props, default-nya kosong/nol —
 * silakan isi sesuai data asli kamu (dari database / local storage / API).
 *
 * Props:
 * - summary: { totalTugas, selesai, belumSelesai, tugasHariIni }
 * - chartData: [{ label: '12/7', selesai: 0, belumSelesai: 0 }, ...]
 * - priorityData: [
 *     { label: 'Tinggi', count: 0, percent: 0, color: '#D9534F' },
 *     { label: 'Sedang', count: 0, percent: 0, color: '#E8A83E' },
 *     { label: 'Rendah', count: 0, percent: 0, color: '#2E9E4F' },
 *   ]
 * - productivityPercent: number (persen "lebih produktif dari X% pengguna")
 * - onPressCalendar, onPressMotivasi: function
 */
export default function StatistikScreen({
  summary = {
    totalTugas: 0,
    selesai: 0,
    belumSelesai: 0,
    tugasHariIni: 0,
  },
  chartData = [],
  priorityData = [],
  productivityPercent = null,
  onPressCalendar,
  onPressMotivasi,
}) {
  const [activePeriod, setActivePeriod] = useState(PERIODS[0]);

  const maxBarValue = useMemo(() => {
    const max = Math.max(
      1,
      ...chartData.map((d) => (d.selesai || 0) + (d.belumSelesai || 0))
    );
    // Bulatkan ke atas kelipatan 5 biar sumbu Y rapi
    return Math.ceil(max / 5) * 5;
  }, [chartData]);

  const totalPriority = priorityData.reduce(
    (sum, p) => sum + (p.count || 0),
    0
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistik</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressCalendar}
        >
          <Ionicons name="calendar-outline" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* ================= PERIOD TABS ================= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodRow}
        contentContainerStyle={styles.periodRowContent}
      >
        {PERIODS.map((period) => {
          const active = period === activePeriod;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                active && styles.periodChipActive,
              ]}
              onPress={() => setActivePeriod(period)}
            >
              <Text
                style={[
                  styles.periodChipText,
                  active && styles.periodChipTextActive,
                ]}
                numberOfLines={1}
              >
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ================= RINGKASAN ================= */}
      <Text style={styles.sectionTitle}>Ringkasan</Text>
      <View style={styles.summaryGrid}>
        <SummaryCard
          icon="clipboard-outline"
          iconBg={GREEN_LIGHT}
          iconColor={GREEN_DARK}
          value={summary.totalTugas}
          label="Total Tugas"
        />
        <SummaryCard
          icon="checkmark-circle-outline"
          iconBg={GREEN_LIGHT}
          iconColor={GREEN_DARK}
          value={summary.selesai}
          label="Selesai"
        />
        <SummaryCard
          icon="time-outline"
          iconBg={ORANGE_BG}
          iconColor={ORANGE}
          value={summary.belumSelesai}
          label="Belum Selesai"
        />
        <SummaryCard
          icon="calendar-outline"
          iconBg={BLUE_BG}
          iconColor={BLUE}
          value={summary.tugasHariIni}
          label="Tugas Hari Ini"
        />
      </View>

      {/* ================= BAR CHART ================= */}
      <View style={styles.card}>
        <View style={styles.chartHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>
              Tugas Selesai vs Belum Selesai
            </Text>
            <Text style={styles.cardSubtitle}>({activePeriod})</Text>
          </View>
        
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
            <Text style={styles.legendText}>Selesai</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: GRAY_BAR }]}
            />
            <Text style={styles.legendText}>Belum Selesai</Text>
          </View>
        </View>

        {chartData.length === 0 ? (
          <EmptyChart text="Belum ada data untuk ditampilkan" />
        ) : (
          <BarChart data={chartData} maxValue={maxBarValue} />
        )}
      </View>

      {/* ================= DONUT PRIORITAS ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribusi Prioritas</Text>

        {priorityData.length === 0 || totalPriority === 0 ? (
          <EmptyChart text="Belum ada data prioritas" />
        ) : (
          <View style={styles.donutRow}>
            <DonutChart data={priorityData} total={totalPriority} />
            <View style={styles.donutLegend}>
              {priorityData.map((p) => (
                <View key={p.label} style={styles.donutLegendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: p.color },
                    ]}
                  />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.donutLegendLabel}>{p.label}</Text>
                    <Text style={styles.donutLegendCount}>
                      {p.count} tugas
                    </Text>
                  </View>
                  <Text style={styles.donutLegendPercent}>
                    {p.percent}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ================= PRODUKTIVITAS BANNER ================= */}
      <View style={styles.productivityCard}>
        <Text style={styles.productivityEmoji}>🏆</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.productivityText}>
            {productivityPercent === null ? (
              'Selesaikan tugas biar keliatan performamu di sini'
            ) : (
              <>
                Kamu lebih produktif dari{' '}
                <Text style={styles.productivityPercent}>
                  {productivityPercent}% pengguna TaskFlow!
                </Text>
              </>
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.motivasiButton}
          onPress={onPressMotivasi}
        >
          <Text style={styles.motivasiButtonText}>Motivasi Saya</Text>
          <Ionicons name="chevron-forward" size={14} color={GREEN_DARK} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ================== KOMPONEN KECIL ==================

function SummaryCard({ icon, iconBg, iconColor, value, label }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.summaryValue}>{value ?? 0}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function EmptyChart({ text }) {
  return (
    <View style={styles.emptyChart}>
      <Ionicons name="bar-chart-outline" size={36} color="#D1D5DB" />
      <Text style={styles.emptyChartText}>{text}</Text>
    </View>
  );
}

// Bar chart sederhana pake react-native-svg (stacked: selesai + belum selesai)
function BarChart({ data, maxValue }) {
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
              {/* Belum selesai (atas, abu-abu) */}
              <Rect
                x={x}
                y={chartHeight - selesaiHeight - belumHeight}
                width={barWidth}
                height={belumHeight}
                rx={4}
                fill={GRAY_BAR}
              />
              {/* Selesai (bawah, hijau) */}
              <Rect
                x={x}
                y={chartHeight - selesaiHeight}
                width={barWidth}
                height={selesaiHeight}
                rx={4}
                fill={GREEN}
              />
            </G>
          );
        })}
      </Svg>

      {/* Label sumbu X */}
      <View style={[styles.barLabelsRow, { width: svgWidth }]}>
        {data.map((item, index) => (
          <Text
            key={item.label || index}
            style={[styles.barLabel, { width: barWidth + gap }]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Donut chart sederhana pake react-native-svg
function DonutChart({ data, total }) {
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
        {/* Lubang tengah donut */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2 - 2}
          fill={BG}
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  periodRow: {
    marginTop: 12,
    flexGrow: 0,
  },
  periodRowContent: {
    backgroundColor: '#EDEFF2',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  periodChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipActive: {
    backgroundColor: GREEN_DARK,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodChipTextActive: {
    color: '#fff',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 22,
    marginBottom: 12,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
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
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  dropdownButtonText: {
    fontSize: 12,
    color: '#374151',
    marginRight: 4,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },

  barLabelsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 20,
  },
  donutLegend: {
    flex: 1,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  donutLegendLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  donutLegendCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  donutLegendPercent: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },

  productivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 16,
    padding: 16,
  },
  productivityEmoji: {
    fontSize: 24,
  },
  productivityText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
  },
  productivityPercent: {
    color: GREEN_DARK,
    fontWeight: '800',
  },
  motivasiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  motivasiButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN_DARK,
    marginRight: 2,
  },
});

