import { useSubtasks } from "@/context/SubtasksContext";
import { useTheme } from "@/context/ThemeContext";
import { hapticLight, hapticSelection } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ================== TYPE ==================
type Subtask = {
  id: string;
  task_id: string;
  user_id: string;
  judul: string;
  completed: boolean;
  created_at: string;
};

type Props = {
  taskId: string;
};

export default function SubtaskList({ taskId }: Props) {
  const { colors } = useTheme();
  const { getSubtasksByTaskId, addSubtask, toggleSubtask, deleteSubtask } =
    useSubtasks();
  const [newSubtask, setNewSubtask] = useState("");
  const [adding, setAdding] = useState(false);

  const subtasks: Subtask[] = getSubtasksByTaskId(taskId);
  const completed = subtasks.filter((s: Subtask) => s.completed).length;
  const total = subtasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleAdd = async () => {
    if (!newSubtask.trim()) return;

    setAdding(true);
    try {
      await addSubtask(taskId, newSubtask.trim());
      setNewSubtask("");
      hapticSelection();
    } catch (error) {
      console.log("Gagal tambah subtask:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      {total > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressHeader}>
            <Text
              style={[styles.progressText, { color: colors.textSecondary }]}
            >
              {completed}/{total} selesai
            </Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {progress}%
            </Text>
          </View>
          <View
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </View>
      )}

      {subtasks.map((subtask: Subtask) => (
        <View
          key={subtask.id}
          style={[styles.subtaskRow, { backgroundColor: colors.cardAlt }]}
        >
          <TouchableOpacity
            style={[
              styles.checkbox,
              { borderColor: colors.border },
              subtask.completed && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => {
              hapticLight();
              toggleSubtask(subtask.id);
            }}
          >
            {subtask.completed && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </TouchableOpacity>

          <Text
            style={[
              styles.subtaskText,
              { color: colors.text },
              subtask.completed && {
                textDecorationLine: "line-through",
                color: colors.textMuted,
              },
            ]}
          >
            {subtask.judul}
          </Text>

          <TouchableOpacity
            onPress={() => {
              hapticLight();
              deleteSubtask(subtask.id);
            }}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

      <View
        style={[
          styles.addRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Tambah sub-tugas..."
          placeholderTextColor={colors.textMuted}
          value={newSubtask}
          onChangeText={setNewSubtask}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: newSubtask.trim()
                ? colors.primary
                : colors.border,
            },
          ]}
          onPress={handleAdd}
          disabled={!newSubtask.trim() || adding}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  progressWrap: { marginBottom: 8 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressText: { fontSize: 12, fontWeight: "600" },
  progressPercent: { fontSize: 12, fontWeight: "700" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskText: { flex: 1, fontSize: 13, fontWeight: "600" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  input: { flex: 1, fontSize: 13, padding: 8 },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
