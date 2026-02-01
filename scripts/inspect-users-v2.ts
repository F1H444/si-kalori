import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log("Fetching first user to see columns...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error("Error:", error.message);
  } else if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data in users table. Trying to insert a dummy to see if it fails on schema...");
    const { error: insErr } = await supabase.from('users').insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com'
    });
    if (insErr) {
        console.log("Insert failed as expected or with schema error:", insErr.message);
    }
  }
}

run().catch(console.error);
