import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "") as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "") as string;

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing. Make sure VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is set.");
    }
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}
