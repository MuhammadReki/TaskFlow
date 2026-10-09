import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rvpmzedwoqyhhiyllvut.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cG16ZWR3b3F5aGhpeWxsdnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDMwMTQsImV4cCI6MjEwNzAxOTAxNH0.dLUP_PNvALHDf3T4CaNO66Jr9EeSlCOcNRS3V1UDh-A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
