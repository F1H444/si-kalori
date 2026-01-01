import { createBrowserClient } from '@supabase/ssr';

// Provide specific fallbacks to prevent build failure if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase instance with singleton pattern
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);