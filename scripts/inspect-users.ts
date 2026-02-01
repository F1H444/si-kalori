import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function inspectSchema() {
  // Use service role key to bypass RLS for inspection
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log("Inspecting 'users' table structure via information_schema...");
  
  const { data, error } = await supabase.rpc('inspect_table', { table_name: 'users' });
  
  if (error) {
    console.log("RPC 'inspect_table' failed or doesn't exist. Trying raw SQL if possible via usual query...");
    // Since we don't have a direct SQL executor, let's try to fetch one row and see all keys
    const { data: row, error: fetchError } = await supabase.from('users').select('*').limit(1);
    if (fetchError) {
      console.error("❌ Error fetching from users:", fetchError.message);
    } else if (row && row.length > 0) {
      console.log("✅ Columns found in 'users':", Object.keys(row[0]));
    } else {
      console.log("Table is empty, trying to guess columns via a failing insert...");
      const { error: insertError } = await supabase.from('users').insert({ id: '00000000-0000-0000-0000-000000000000' });
      console.log("Insert error (should reveal missing cols if any):", insertError?.message);
    }
  } else {
    console.log("Table structure:", data);
  }
}

inspectSchema().catch(console.error);
