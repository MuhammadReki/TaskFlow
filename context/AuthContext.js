import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();

    // Listen perubahan auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ========== INIT AUTH (anonymous auto sign-in) ==========
  const initAuth = async () => {
    try {
      // Cek session yang udah ada
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSession(session);
        setUser(session.user);
      } else {
        // Belum ada session → bikin anonymous user
        console.log("🔐 Bikin anonymous user...");
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.log("❌ Anonymous sign-in error:", error.message);
          throw error;
        }

        console.log("✅ Anonymous user dibuat:", data.user?.id);
        setSession(data.session);
        setUser(data.user);
      }
    } catch (error) {
      console.log("❌ Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTER (link anonymous → permanent) ==========
  const register = async (email, password, nama) => {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
      data: { nama },
    });
    if (error) throw error;
    return data;
  };

  // ========== LOGIN ==========
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // ========== LOGOUT ==========
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Setelah logout → bikin anonymous baru
    await initAuth();
  };

  const value = {
    user,
    session,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
