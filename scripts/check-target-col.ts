import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkCol() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log("Checking if 'daily_calorie_target' exists in 'users'...");
  const { data, error } = await supabase.from('users').select('daily_calorie_target').limit(1);
  
  if (error) {
    console.error("❌ Column check error:", error.message);
  } else {
    console.log("✅ Column exists!");
  }
}

checkCol().catch(console.error);
