import { createBrowserClient } from '@supabase/ssr';

// Provide specific fallbacks to prevent build failure if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.error("CRITICAL [v2.0]: Supabase environment variables are missing! Check your deployment dashboard settings.");
  }
} else {
  if (typeof window !== "undefined") {
    console.log("Supabase Client [v2.0] Initialized with URL:", supabaseUrl.substring(0, 10) + "...");
  }
}

// Client-side Supabase instance with singleton pattern
export const supabase = createBrowserClient(
  supabaseUrl || "https://missing.supabase.co",
  supabaseAnonKey || "missing-key",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  cookieOptions: {
    // Omitting maxAge or setting it to undefined makes it a session cookie
    maxAge: undefined,
  },
});
