import {
  cancelTaskNotification,
  rescheduleAllTasks,
  scheduleTaskNotification,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

// ... (kode yang sudah ada)

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  // ========== LOAD DATA SAAT APP START ==========
  useEffect(() => {
    loadTasks();
  }, []);

  // ========== JADWALKAN ULANG NOTIFIKASI SAAT TASKS BERUBAH ==========
  useEffect(() => {
    if (tasks.length > 0) {
      rescheduleAllTasks(tasks);
    }
  }, [tasks]);

  // ========== FUNGSI LOAD TASKS ==========
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
        // Jadwalkan ulang notifikasi setelah load data
        if (parsed.length > 0) {
          await rescheduleAllTasks(parsed);
        }
      }
    } catch (error) {
      console.log("Gagal load tasks:", error);
    }
  };

  // ========== FUNGSI SAVE TASKS ==========
  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.log("Gagal save tasks:", error);
    }
  };

  // ========== TAMBAH TASK ==========
  const addTask = async (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    const updatedTasks = [...tasks, taskWithId];
    await saveTasks(updatedTasks);

    // Jadwalkan notifikasi untuk task baru
    await scheduleTaskNotification(taskWithId);
  };

  // ========== UPDATE TASK ==========
  const updateTask = async (id, updatedData) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updatedData } : task,
    );
    await saveTasks(updatedTasks);

    // Update notifikasi
    const task = updatedTasks.find((t) => t.id === id);
    if (task) {
      await scheduleTaskNotification(task);
    }
  };

  // ========== DELETE TASK ==========
  const deleteTask = async (id) => {
    // Hapus notifikasi task
    await cancelTaskNotification(id);

    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);
  };

  // ========== TOGGLE COMPLETE ==========
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    );
    await saveTasks(updatedTasks);

    // Jika task selesai, hapus notifikasi
    const task = updatedTasks.find((t) => t.id === id);
    if (task?.completed) {
      await cancelTaskNotification(id);
    }
  };

  // ========== RESET ALL TASKS ==========
  const resetAllTasks = async () => {
    await cancelAllNotifications();
    await saveTasks([]);
  };

  // ========== REPLACE ALL TASKS (untuk restore backup) ==========
  const replaceAllTasks = async (newTasks) => {
    await saveTasks(newTasks);
    if (newTasks.length > 0) {
      await rescheduleAllTasks(newTasks);
    }
  };

  // ========== GET TASK BY ID ==========
  const getTaskById = (id) => {
    return tasks.find((task) => task.id === id);
  };

  // ... (return context value)
}

// ... (export useTasks)
