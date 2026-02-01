import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkSchema() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log("Checking 'users' table columns...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("Columns found in 'users':", Object.keys(data[0]));
  } else {
    // Try to get headers if table is empty
    const { data: data2, error: error2 } = await supabase.from('users').select('*').limit(0);
    console.log("Table 'users' is empty. Trying to get columns from empty select...");
    // This doesn't help much with JS client. 
  }
}

checkSchema().catch(console.error);
