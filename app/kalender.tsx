import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticSelection } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// ================== TYPE ==================
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

// ================== LOCALE ==================
LocaleConfig.locales["id"] = {
  monthNames: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  today: "Hari ini",
};

LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  today: "Today",
};

// Set default locale — casting biar TypeScript gak protes
(LocaleConfig as any).defaultLocale = "id";

export default function KalenderScreen() {
  const { tasks } = useTasks();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Set locale sesuai bahasa
  useEffect(() => {
    (LocaleConfig as any).defaultLocale = language;
  }, [language]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    tasks.forEach((task: Task) => {
      if (task.deadlineDate) {
        const date = new Date(task.deadlineDate).toISOString().split("T")[0];
        if (!marks[date]) {
          marks[date] = { dots: [] };
        }

        const priorityColor =
          task.priority === "Tinggi"
            ? colors.danger
            : task.priority === "Sedang"
              ? colors.warning
              : colors.primary;

        marks[date].dots.push({ color: priorityColor });

        if (task.completed) {
          marks[date].dots[marks[date].dots.length - 1].color =
            colors.textMuted;
        }
      }
    });

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: "#fff",
    };

    return marks;
  }, [tasks, selectedDate, colors]);

  const tasksOnDate = useMemo(() => {
    return tasks.filter((task: Task) => {
      if (!task.deadlineDate) return false;
      const date = new Date(task.deadlineDate).toISOString().split("T")[0];
      return date === selectedDate;
    });
  }, [tasks, selectedDate]);

  const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
    Tinggi: { bg: colors.dangerBg, text: colors.danger },
    Sedang: { bg: colors.warningBg, text: colors.warning },
    Rendah: { bg: colors.primaryBg, text: colors.primary },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hapticSelection();
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === "id" ? "Kalender" : "Calendar"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CALENDAR */}
        <View
          style={[
            styles.calendarWrap,
            {
              backgroundColor: colors.card,
              shadowOpacity: colors.shadowOpacity,
            },
          ]}
        >
          <Calendar
            key={language}
            current={selectedDate}
            onDayPress={(day: { dateString: string }) => {
              hapticSelection();
              setSelectedDate(day.dateString);
            }}
            markingType="multi-dot"
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: "#fff",
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              dotColor: colors.primary,
              selectedDotColor: "#fff",
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: "600",
              textMonthFontWeight: "800",
              textDayHeaderFontWeight: "700",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* DAFTAR TASK */}
        <View style={styles.tasksSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? "Tugas" : "Tasks"} -{" "}
            {new Date(selectedDate).toLocaleDateString(
              language === "id" ? "id-ID" : "en-US",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            {tasksOnDate.length} {language === "id" ? "tugas" : "tasks"}
          </Text>
        </View>

        {tasksOnDate.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.primaryAccent}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {language === "id" ? "Gak ada tugas" : "No tasks"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {language === "id"
                ? "Gak ada tugas dengan deadline di tanggal ini"
                : "No tasks with deadline on this date"}
            </Text>
          </View>
        ) : (
          tasksOnDate.map((task: Task) => {
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
                onPress={() => {
                  hapticSelection();
                  router.push(`/tambah-tugas?id=${task.id}`);
                }}
              >
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
                  {task.priority && (
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
                  )}
                </View>

                {task.completed && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })
        )}

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
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  calendarWrap: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  tasksSection: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  sectionSubtitle: { fontSize: 12, marginTop: 2 },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  taskIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "700" },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  priorityText: { fontSize: 10, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginTop: 12 },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
