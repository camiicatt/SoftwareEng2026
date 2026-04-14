import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database";

let supabaseClient: SupabaseClient<Database> | null = null;

export function createClientBrowser(): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseClient;
}