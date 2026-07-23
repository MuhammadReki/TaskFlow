import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const TasksContext = createContext();

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  // ========== LOAD DATA SAAT APP START ==========
  useEffect(() => {
    loadTasks();
  }, []);

  // ========== FUNGSI LOAD TASKS ==========
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
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
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, taskWithId];
    await saveTasks(updatedTasks);
  };

  // ========== UPDATE TASK ==========
  const updateTask = async (id, updatedData) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updatedData } : task,
    );
    await saveTasks(updatedTasks);
  };

  // ========== DELETE TASK ==========
  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);
  };

  // ========== TOGGLE COMPLETE ==========
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    );
    await saveTasks(updatedTasks);
  };

  // ========== RESET ALL TASKS ==========
  const resetAllTasks = async () => {
    await saveTasks([]);
  };

  // ========== REPLACE ALL TASKS (untuk restore backup) ==========
  const replaceAllTasks = async (newTasks) => {
    await saveTasks(newTasks);
  };

  // ========== GET TASK BY ID ==========
  const getTaskById = (id) => {
    return tasks.find((task) => task.id === id);
  };

  const value = {
    tasks,
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
