// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  console.error('');
  console.error('📝 Solution:');
  console.error('1. Make sure .env.local file exists in root directory');
  console.error('2. Restart the development server (npm run dev)');
  console.error('3. Check that .env.local contains:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://dfzpruqbocggtjiyjrsh.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  
  throw new Error('Missing Supabase environment variables - check console for details');
}

/**
 * Supabase client for server-side operations
 * Uses service role key - bypasses Row Level Security
 * USE WITH CAUTION - only in API routes
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
