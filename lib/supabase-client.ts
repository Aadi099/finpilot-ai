import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const nodeEnv =
  typeof process !== "undefined"
    ? (process.env as Record<string, string | undefined>)
    : {};

export const supabaseUrl =
  nodeEnv.NEXT_PUBLIC_SUPABASE_URL ?? viteEnv.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  nodeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? viteEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  browserClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}

export async function getSupabaseUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export type DbAccount = {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  account_type: string;
  opening_balance: number;
  created_at: string;
};

export type DbTransaction = {
  id: string;
  user_id: string;
  account_id: string | null;
  account_name: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  name: string;
  category: string;
  transaction_date: string;
  paid_date: string | null;
  payment_method: string;
  notes: string | null;
  created_at: string;
};
