import { createContext, useContext, useEffect, useState } from "react";
import {
  cancelNotification,
  scheduleTaskNotification,
} from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((t) => ({
        id: t.id,
        title: t.judul,
        description: t.deskripsi,
        deadlineDate: t.deadline,
        date: t.deadline
          ? new Date(t.deadline).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        dateLabel: getDateLabel(t.deadline),
        priority: t.priority,
        category: t.kategori,
        completed: t.completed,
        icon: getIconByCategory(t.kategori),
        recurring: t.recurring || "none",
        streakCount: t.streak_count || 0,
        attachmentUrl: t.attachment_url || null,
        attachmentName: t.attachment_name || null,
        reminderEnabled: false,
        reminderTime: null,
      }));

      setTasks(mapped);
    } catch (error) {
      console.log("Gagal load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== TAMBAH TASK ==========
  const addTask = async (newTask) => {
    if (!user) {
      console.log("❌ User belum siap, gak bisa tambah task");
      throw new Error("User belum siap. Tunggu sebentar ya.");
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          judul: newTask.title,
          deskripsi: newTask.description || null,
          kategori: newTask.category || "Lainnya",
          priority: newTask.priority || "Sedang",
          deadline: newTask.deadlineDate || null,
          recurring: newTask.recurring || "none",
          attachment_url: newTask.attachmentUrl || null,
          attachment_name: newTask.attachmentName || null,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped = {
        id: data.id,
        title: data.judul,
        description: data.deskripsi,
        deadlineDate: data.deadline,
        date: data.deadline
          ? new Date(data.deadline).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        dateLabel: getDateLabel(data.deadline),
        priority: data.priority,
        category: data.kategori,
        completed: data.completed,
        icon: getIconByCategory(data.kategori),
        recurring: data.recurring || "none",
        streakCount: data.streak_count || 0,
        attachmentUrl: data.attachment_url || null,
        attachmentName: data.attachment_name || null,
      };

      if (data.deadline) {
        const reminderBefore = newTask.reminderBefore || 30;
        await scheduleTaskNotification(
          data.id,
          data.judul,
          new Date(data.deadline),
          reminderBefore,
        );
      }

      setTasks((prev) => [mapped, ...prev]);
      return mapped;
    } catch (error) {
      console.log("Gagal tambah task:", error);
      throw error;
    }
  };

  // ========== UPDATE TASK ==========
  const updateTask = async (id, updatedData) => {
    if (!user) throw new Error("User belum siap");

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          judul: updatedData.title,
          deskripsi: updatedData.description,
          kategori: updatedData.category,
          priority: updatedData.priority,
          deadline: updatedData.deadlineDate,
          recurring: updatedData.recurring || "none",
          attachment_url: updatedData.attachmentUrl || null,
          attachment_name: updatedData.attachmentName || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await cancelNotification(id);

      if (data.deadline) {
        const reminderBefore = updatedData.reminderBefore || 30;
        await scheduleTaskNotification(
          data.id,
          data.judul,
          new Date(data.deadline),
          reminderBefore,
        );
      }

      await loadTasks();
      return data;
    } catch (error) {
      console.log("Gagal update task:", error);
      throw error;
    }
  };

  // ========== DELETE TASK ==========
  const deleteTask = async (id) => {
    if (!user) throw new Error("User belum siap");

    try {
      await cancelNotification(id);

      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.log("Gagal delete task:", error);
      throw error;
    }
  };

  // ========== TOGGLE COMPLETE ==========
  const toggleTask = async (id) => {
    if (!user) throw new Error("User belum siap");

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const newCompleted = !task.completed;
      const newStreak = newCompleted ? (task.streakCount || 0) + 1 : 0;

      const { error } = await supabase
        .from("tasks")
        .update({
          completed: newCompleted,
          streak_count: newStreak,
        })
        .eq("id", id);
      if (error) throw error;

      if (newCompleted) {
        await cancelNotification(id);
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, completed: newCompleted, streakCount: newStreak }
            : t,
        ),
      );
    } catch (error) {
      console.log("Gagal toggle task:", error);
    }
  };

  // ========== RESET ALL TASKS ==========
  const resetAllTasks = async () => {
    if (!user) throw new Error("User belum siap");

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
      setTasks([]);
    } catch (error) {
      console.log("Gagal reset tasks:", error);
      throw error;
    }
  };

  // ========== REPLACE ALL TASKS ==========
  const replaceAllTasks = async (newTasks) => {
    if (!user) throw new Error("User belum siap");

    try {
      await resetAllTasks();
      if (newTasks.length === 0) return;

      const payload = newTasks.map((t) => ({
        user_id: user.id,
        judul: t.title || t.judul,
        deskripsi: t.description || t.deskripsi || null,
        kategori: t.category || t.kategori || "Lainnya",
        priority: t.priority || "Sedang",
        deadline: t.deadlineDate || t.deadline || null,
        completed: t.completed || false,
        recurring: t.recurring || "none",
        attachment_url: t.attachmentUrl || null,
        attachment_name: t.attachmentName || null,
      }));

      const { error } = await supabase.from("tasks").insert(payload);
      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.log("Gagal replace tasks:", error);
      throw error;
    }
  };

  const getTaskById = (id) => tasks.find((t) => t.id === id);

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    resetAllTasks,
    replaceAllTasks,
    getTaskById,
    loadTasks,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}

// ============ HELPERS ============
function getDateLabel(date) {
  if (!date) return "";
  const today = new Date();
  const target = new Date(date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  return target.toLocaleDateString("id-ID", { weekday: "long" });
}

function getIconByCategory(category) {
  const map = {
    Kerja: "briefcase-outline",
    Pribadi: "person-outline",
    Belajar: "book-outline",
    Belanja: "cart-outline",
    Kesehatan: "heart-outline",
    Lainnya: "document-text-outline",
  };
  return map[category] || "document-text-outline";
}
