import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SubtasksContext = createContext();

export function SubtasksProvider({ children }) {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubtasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubtasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.log("Gagal load subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubtasksByTaskId = (taskId) => {
    return subtasks.filter((s) => s.task_id === taskId);
  };

  const addSubtask = async (taskId, judul) => {
    if (!user) throw new Error("User belum siap");

    try {
      const { data, error } = await supabase
        .from("subtasks")
        .insert({
          task_id: taskId,
          user_id: user.id,
          judul,
        })
        .select()
        .single();

      if (error) throw error;
      setSubtasks((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.log("Gagal tambah subtask:", error);
      throw error;
    }
  };

  const toggleSubtask = async (id) => {
    const subtask = subtasks.find((s) => s.id === id);
    if (!subtask) return;

    try {
      const { error } = await supabase
        .from("subtasks")
        .update({ completed: !subtask.completed })
        .eq("id", id);
      if (error) throw error;
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
      );
    } catch (error) {
      console.log("Gagal toggle subtask:", error);
    }
  };

  const deleteSubtask = async (id) => {
    try {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw error;
      setSubtasks((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.log("Gagal delete subtask:", error);
      throw error;
    }
  };

  const deleteSubtasksByTaskId = async (taskId) => {
    try {
      const { error } = await supabase
        .from("subtasks")
        .delete()
        .eq("task_id", taskId);
      if (error) throw error;
      setSubtasks((prev) => prev.filter((s) => s.task_id !== taskId));
    } catch (error) {
      console.log("Gagal delete subtasks:", error);
    }
  };

  const value = {
    subtasks,
    loading,
    getSubtasksByTaskId,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    deleteSubtasksByTaskId,
    loadSubtasks,
  };

  return (
    <SubtasksContext.Provider value={value}>
      {children}
    </SubtasksContext.Provider>
  );
}

export function useSubtasks() {
  const context = useContext(SubtasksContext);
  if (!context) {
    throw new Error("useSubtasks must be used within a SubtasksProvider");
  }
  return context;
}
