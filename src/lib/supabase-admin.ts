import { createClient } from "@supabase/supabase-js";

// Note: This client should ONLY be used in secure server-side environments (API Routes, Server Actions)
// It bypasses Row Level Security (RLS).
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
